import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanCard } from "@/components/KanbanCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Task = {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  subtasks?: { completed: number; total: number };
  comments?: number;
  attachments?: number;
  assignee?: { name: string; avatar?: string };
  columnId: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Project details: Movie Industry Presentation for Business Class",
    category: "Information",
    priority: "medium",
    dueDate: "Today",
    columnId: "information",
  },
  {
    id: "2",
    title: "Teacher Details: Contact Ms. Auris if you have any project issues",
    category: "Information",
    priority: "high",
    dueDate: "Today",
    columnId: "information",
  },
  {
    id: "3",
    title: "Set up shared file management (Google Document, Dropbox, etc)",
    category: "Planning",
    priority: "high",
    dueDate: "Today",
    subtasks: { completed: 0, total: 4 },
    comments: 5,
    assignee: { name: "John Doe" },
    columnId: "planning",
  },
  {
    id: "4",
    title: "Set up shared communication tool (Whatsapp, Email, etc)",
    category: "Planning",
    priority: "medium",
    dueDate: "Today",
    comments: 2,
    assignee: { name: "Jane Smith" },
    columnId: "planning",
  },
  {
    id: "5",
    title: "Select which topic to present: Disney Movie Studio Analysis",
    category: "Project Task",
    priority: "medium",
    dueDate: "Tomorrow",
    assignee: { name: "Mike Johnson" },
    columnId: "tasks",
  },
  {
    id: "6",
    title: "Write script for presentation",
    category: "Project Task",
    priority: "high",
    dueDate: "Tomorrow",
    subtasks: { completed: 4, total: 4 },
    assignee: { name: "Sarah Williams" },
    columnId: "tasks",
  },
  {
    id: "7",
    title: "Brainstorm meeting",
    category: "Meetings",
    priority: "low",
    dueDate: "Today",
    comments: 2,
    assignee: { name: "Alex Brown" },
    columnId: "meetings",
  },
  {
    id: "8",
    title: "Writing meeting",
    category: "Meetings",
    priority: "low",
    dueDate: "12 Jun",
    comments: 3,
    assignee: { name: "Emily Davis" },
    columnId: "meetings",
  },
];

const columns = [
  { id: "information", title: "Information", color: "bg-warning" },
  { id: "planning", title: "Planning", color: "bg-warning" },
  { id: "tasks", title: "Project Tasks", color: "bg-destructive" },
  { id: "meetings", title: "Meetings", color: "bg-warning" },
];

export default function Projects() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overColumnId = over.id as string;

    if (activeTask && columns.some((col) => col.id === overColumnId)) {
      setTasks(
        tasks.map((task) =>
          task.id === active.id ? { ...task, columnId: overColumnId } : task
        )
      );
    }

    setActiveId(null);
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((task) => task.columnId === columnId);

  const activeTask = tasks.find((task) => task.id === activeId);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-x-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Project Management</span>
                <span>/</span>
                <span className="text-primary">Student Project</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Student Project</h1>
              <p className="text-muted-foreground mt-1">Short description to place here...</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search task" className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New task
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 pb-6">
              {columns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="font-semibold text-foreground">{column.title}</h2>
                    <span
                      className={`${column.color} text-white text-xs font-medium px-2 py-0.5 rounded-full`}
                    >
                      {getTasksForColumn(column.id).length}
                    </span>
                  </div>

                  <SortableContext
                    items={getTasksForColumn(column.id).map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {getTasksForColumn(column.id).map((task) => (
                        <KanbanCard key={task.id} {...task} />
                      ))}
                    </div>
                  </SortableContext>

                  <Button variant="ghost" className="w-full mt-3" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                  </Button>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeTask && <KanbanCard {...activeTask} />}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  );
}
