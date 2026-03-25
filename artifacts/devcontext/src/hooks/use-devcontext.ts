import { useState } from "react";
import { 
  getCommitDetail, 
  useSummarizeCommits, 
  Commit 
} from "@workspace/api-client-react";

export function useGenerateSummary() {
  const mutation = useSummarizeCommits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = async (owner: string, repoName: string, commits: Commit[]) => {
    if (!commits.length) return;
    setIsGenerating(true);
    setProgress(10);
    
    try {
      // Fetch all commit details in parallel — much faster than sequential
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
        commits: details.map(d => ({
          sha: d.sha,
          message: d.message,
          author_date: d.author_date,
          files: d.files.map(f => f.filename)
        }))
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
