import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, MessageSquare, Paperclip, MoreHorizontal } from "lucide-react";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface KanbanCardProps {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  subtasks?: { completed: number; total: number };
  comments?: number;
  attachments?: number;
  assignee?: { name: string; avatar?: string };
}

export function KanbanCard({
  id,
  title,
  category,
  priority,
  dueDate,
  subtasks,
  comments,
  attachments,
  assignee,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="w-4 h-4" />
          </button>
          <h3 className="font-medium text-sm text-foreground flex-1 line-clamp-2">{title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3 px-6">{category}</p>

      {subtasks && (
        <div className="mb-4 px-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground font-medium">Subtask</span>
            <span className="text-muted-foreground">{subtasks.completed}/{subtasks.total}</span>
          </div>
          <Progress value={(subtasks.completed / subtasks.total) * 100} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">{dueDate}</span>
          </div>
          <PriorityBadge priority={priority} />
        </div>

        <div className="flex items-center gap-2">
          {comments && comments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{comments}</span>
            </div>
          )}
          {attachments && attachments > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{attachments}</span>
            </div>
          )}
          {assignee && (
            <Avatar className="h-6 w-6 border border-border">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {assignee.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
