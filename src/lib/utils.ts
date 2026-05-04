import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function getDifficultyColor(difficulty: string) {
  const map: Record<string, string> = {
    beginner: "text-green-700 bg-green-50 border-green-200",
    intermediate: "text-amber-700 bg-amber-50 border-amber-200",
    advanced: "text-red-700 bg-red-50 border-red-200",
  };
  return map[difficulty] ?? "text-stone-600 bg-stone-50 border-stone-200";
}

export function getScoreColor(percentage: number) {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-red-600";
}

export function getBadgeForScore(percentage: number, difficulty: string) {
  if (percentage === 100) return "Perfect Score";
  if (percentage >= 90 && difficulty === "advanced") return "Expert";
  if (percentage >= 80) return "High Achiever";
  return null;
}
