import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  personal: "bg-category-personal/10 text-category-personal border-category-personal/20",
  work: "bg-category-work/10 text-category-work border-category-work/20",
  project: "bg-category-project/10 text-category-project border-category-project/20",
  default: "bg-muted text-muted-foreground border-border",
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
