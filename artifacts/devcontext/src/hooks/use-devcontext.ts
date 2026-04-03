import { useState } from "react";
import { 
  getCommitDetail, 
  useSummarizeCommits, 
  Commit,
  DepContextItem,
} from "@workspace/api-client-react";

export type { DepContextItem };

export type RepoCommitGroup = {
  owner: string;
  repoName: string;
  commits: Commit[];
};

export function useGenerateSummary() {
  const mutation = useSummarizeCommits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Generate a summary for one or more repos.
   * When multiple repos are passed, commits are interleaved chronologically
   * and each carries a per-commit repo_name so the AI can reason cross-repo.
   */
  const generate = async (
    repoGroups: RepoCommitGroup[],
    mode: "next_steps" | "standup" = "next_steps",
    depContext?: DepContextItem[]
  ) => {
    const allCommits = repoGroups.flatMap(g => g.commits)
    if (!allCommits.length) return;
    setIsGenerating(true);
    setProgress(10);
    
    try {
      let completed = 0;
      const totalCommits = allCommits.length;

      // Fetch details for all commits from all repos in parallel
      const detailsByGroup = await Promise.all(
        repoGroups.map(async (group) => {
          const details = await Promise.all(
            group.commits.map(async (commit) => {
              const detail = await getCommitDetail(group.owner, group.repoName, commit.sha);
              completed++;
              setProgress(10 + Math.round((completed / totalCommits) * 60));
              return { ...detail, _repoName: group.repoName };
            })
          );
          return details;
        })
      );

      // Flatten and sort chronologically (newest first matches the commit list order)
      const allDetails = detailsByGroup
        .flat()
        .sort((a, b) => new Date(b.author_date).getTime() - new Date(a.author_date).getTime());

      // Primary repo name = first group (for prompt fallback / cache key)
      const primaryRepoName = repoGroups[0]?.repoName ?? "repo";
      const primaryOwner = repoGroups[0]?.owner ?? "";
      void primaryOwner; // used for cache key at call site

      const payload = {
        repo_name: primaryRepoName,
        mode,
        commits: allDetails.map(d => ({
          sha: d.sha,
          message: d.message,
          author_date: d.author_date,
          files: d.files.map(f => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
          })),
          stats: {
            additions: d.stats.additions,
            deletions: d.stats.deletions,
          },
          repo_name: repoGroups.length > 1 ? d._repoName : null,
        })),
        dep_context: depContext && depContext.length > 0 ? depContext : null,
      };

      setProgress(80);
      
      const response = await mutation.mutateAsync({ data: payload });
      setProgress(100);
      return response;
    } catch (error) {
      console.error("Failed to generate summary:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { 
    generate, 
    isGenerating: isGenerating || mutation.isPending, 
    progress,
    result: mutation.data,
    error: mutation.error
  };
}
