import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  personal: "bg-blue-50 text-blue-600 border-blue-200",
  work: "bg-purple-50 text-purple-600 border-purple-200",
  study: "bg-green-50 text-green-600 border-green-200",
  health: "bg-pink-50 text-pink-600 border-pink-200",
  shopping: "bg-orange-50 text-orange-600 border-orange-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
  project: "bg-indigo-50 text-indigo-600 border-indigo-200",
  default: "bg-slate-50 text-slate-600 border-slate-200",
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = categoryColors[category.toLowerCase()] || categoryColors.default;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        colorClass,
        className
      )}
    >
      {category}
    </span>
  );
}
