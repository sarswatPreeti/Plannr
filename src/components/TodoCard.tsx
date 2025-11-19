import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { CategoryBadge } from "./CategoryBadge";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface TodoCardProps {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  description?: string;
  icon?: string;
  completed?: boolean;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TodoCard({ 
  id, 
  title, 
  category, 
  dueDate, 
  description,
  icon, 
  completed = false,
  onToggle,
  onEdit,
  onDelete
}: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isToday = formatDistanceToNow(dueDate, { addSuffix: false }) === "0 minutes";
  const dateText = isToday ? "Today" : formatDistanceToNow(dueDate, { addSuffix: true });
  const isPast = dueDate < new Date() && !isToday;
  
  // Capitalize first letter of title
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <div 
      className="rounded-2xl border-2 border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0">
          <Checkbox 
            checked={completed}
            onCheckedChange={() => onToggle?.(id)}
            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className={`font-semibold text-base mb-1.5 leading-tight transition-colors truncate ${completed ? "line-through text-muted-foreground/60" : "text-foreground group-hover:text-primary"}`}>
            {capitalizedTitle}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={category} />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm font-medium whitespace-nowrap ${isPast ? "text-red-500" : "text-muted-foreground"}`}>
                {dateText}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {isExpanded && description && (
        <div className="px-4 pb-4 pt-0 pl-[3.75rem] animate-in slide-in-from-top-2 duration-300">
          <div className="text-sm leading-relaxed text-muted-foreground bg-muted/50 rounded-xl p-3 border-l-4 border-primary">
            {description}
          </div>
        </div>
      )}
    </div>
  );
}
