import { Badge } from "@/components/ui/badge";

interface FinderLevelBadgeProps {
  completedJobs: number;
  className?: string;
}

export function FinderLevelBadge({ completedJobs, className }: FinderLevelBadgeProps) {
  const getFinderLevel = (jobs: number) => {
    if (jobs >= 100) return { level: "Master", color: "bg-purple-600 text-white" };
    if (jobs >= 50) return { level: "Expert", color: "bg-blue-600 text-white" };
    if (jobs >= 20) return { level: "Pro", color: "bg-green-600 text-white" };
    if (jobs >= 5) return { level: "Meister", color: "bg-red-600 text-white" };
    return { level: "Rookie", color: "bg-gray-600 text-white" };
  };

  const { level, color } = getFinderLevel(completedJobs);

  return (
    <Badge className={`${color} font-semibold px-3 py-1 ${className}`}>
      {level}
    </Badge>
  );
}