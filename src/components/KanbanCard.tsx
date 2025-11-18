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
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="font-medium text-sm text-foreground flex-1">{title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{category}</p>

      {subtasks && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Subtasks</span>
            <span>{subtasks.completed}/{subtasks.total}</span>
          </div>
          <Progress value={(subtasks.completed / subtasks.total) * 100} className="h-1.5" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{dueDate}</span>
          </div>
          <PriorityBadge priority={priority} />
        </div>

        <div className="flex items-center gap-2">
          {comments && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              <span>{comments}</span>
            </div>
          )}
          {attachments && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              <span>{attachments}</span>
            </div>
          )}
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs">
                {assignee.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
