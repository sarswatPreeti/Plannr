import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryBadge } from "./CategoryBadge";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TodoCardProps {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  description?: string;
  icon?: string;
  completed?: boolean;
  onToggle?: (id: string) => void;
}

export function TodoCard({ 
  id, 
  title, 
  category, 
  dueDate, 
  description,
  icon, 
  completed = false,
  onToggle 
}: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isToday = formatDistanceToNow(dueDate, { addSuffix: false }) === "0 minutes";
  const dateText = isToday ? "Today" : formatDistanceToNow(dueDate, { addSuffix: true });
  const isPast = dueDate < new Date() && !isToday;

  return (
    <div className="rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3 p-4">
        <Checkbox 
          checked={completed}
          onCheckedChange={() => onToggle?.(id)}
          className="mt-0.5"
        />
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-2 mb-1">
            {icon && <span className="text-lg">{icon}</span>}
            <h3 className={`font-medium text-sm flex-1 ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {title}
            </h3>
            {description && (
              isExpanded ? 
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : 
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CategoryBadge category={category} />
            <span className={isPast ? "text-destructive font-medium" : "text-primary"}>
              {dateText}
            </span>
          </div>
        </div>
      </div>
      {isExpanded && description && (
        <div className="px-4 pb-4 pt-0 pl-11">
          <div className="text-sm text-muted-foreground border-t pt-3">
            {description}
          </div>
        </div>
      )}
    </div>
  );
}
