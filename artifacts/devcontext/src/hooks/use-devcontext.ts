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
    setProgress(0);
    
    try {
      // Fetch details sequentially to show progress (and avoid rate limits)
      const details = [];
      for (let i = 0; i < commits.length; i++) {
        const detail = await getCommitDetail(owner, repoName, commits[i].sha);
        details.push(detail);
        setProgress(Math.round(((i + 1) / commits.length) * 50)); // First 50% is fetching details
      }

      const payload = {
        repo_name: repoName,
        commits: details.map(d => ({
          sha: d.sha,
          message: d.message,
          author_date: d.author_date,
          files: d.files.map(f => f.filename)
        }))
      };

      setProgress(75); // 75% indicates sending to AI
      
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
