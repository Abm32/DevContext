import { useState } from "react";
import { 
  getCommitDetail, 
  useSummarizeCommits, 
  Commit,
  DepContextItem,
} from "@workspace/api-client-react";

export type { DepContextItem };

export function useGenerateSummary() {
  const mutation = useSummarizeCommits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = async (
    owner: string,
    repoName: string,
    commits: Commit[],
    mode: "next_steps" | "standup" = "next_steps",
    depContext?: DepContextItem[]
  ) => {
    if (!commits.length) return;
    setIsGenerating(true);
    setProgress(10);
    
    try {
      let completed = 0;
      const details = await Promise.all(
        commits.map(async (commit) => {
          const detail = await getCommitDetail(owner, repoName, commit.sha);
          completed++;
          setProgress(10 + Math.round((completed / commits.length) * 60));
          return detail;
        })
      );

      const payload = {
        repo_name: repoName,
        mode,
        commits: details.map(d => ({
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
