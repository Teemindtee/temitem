import { Badge } from "@/components/ui/badge";

interface FinderLevelBadgeProps {
  completedJobs: number;
  className?: string;
}

export function FinderLevelBadge({ completedJobs, className }: FinderLevelBadgeProps) {
  const getFinderLevel = (jobs: number) => {
    if (jobs >= 100) return { level: "Grandmeister", color: "bg-black text-white" };
    if (jobs >= 50) return { level: "Meister", color: "bg-purple-600 text-white" };
    if (jobs >= 15) return { level: "Seeker", color: "bg-blue-600 text-white" };
    if (jobs >= 5) return { level: "Pathfinder", color: "bg-yellow-500 text-black" };
    return { level: "Novice", color: "bg-green-600 text-white" };
  };

  const { level, color } = getFinderLevel(completedJobs);

  return (
    <Badge className={`${color} font-semibold px-3 py-1 ${className}`}>
      {level}
    </Badge>
  );
}