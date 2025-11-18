import { Checkbox } from "@/components/ui/checkbox";
import { CategoryBadge } from "./CategoryBadge";
import { formatDistanceToNow } from "date-fns";

interface TodoCardProps {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  icon?: string;
  completed?: boolean;
  onToggle?: (id: string) => void;
}

export function TodoCard({ 
  id, 
  title, 
  category, 
  dueDate, 
  icon, 
  completed = false,
  onToggle 
}: TodoCardProps) {
  const isToday = formatDistanceToNow(dueDate, { addSuffix: false }) === "0 minutes";
  const dateText = isToday ? "Today" : formatDistanceToNow(dueDate, { addSuffix: true });
  const isPast = dueDate < new Date() && !isToday;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
      <Checkbox 
        checked={completed}
        onCheckedChange={() => onToggle?.(id)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className={`font-medium text-sm ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CategoryBadge category={category} />
          <span className={isPast ? "text-destructive font-medium" : "text-primary"}>
            {dateText}
          </span>
        </div>
      </div>
    </div>
  );
}
