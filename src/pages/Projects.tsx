import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanCard } from "@/components/KanbanCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";
import { AddTodoModal } from "@/components/AddTodoModal";
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

const columns = [
  { id: "information", title: "Information", color: "bg-warning" },
  { id: "planning", title: "Planning", color: "bg-warning" },
  { id: "tasks", title: "Project Tasks", color: "bg-destructive" },
  { id: "meetings", title: "Meetings", color: "bg-warning" },
];

export default function Projects() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      // Note: You'll need to adapt the project data to match the Task type
      setTasks([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="flex-1 overflow-x-auto ml-64">
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
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New task
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
          ) : (
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
          )}
        </div>
      </main>
      
      <AddTodoModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false);
          loadProjects();
        }}
      />
    </div>
  );
}
