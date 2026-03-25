import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return "recently";
  }
}

export function getShortSha(sha: string) {
  return sha.substring(0, 7);
}
