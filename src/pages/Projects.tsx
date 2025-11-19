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
        <div className="px-6 py-10">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-3xl leading-none">📋</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">Organize your tasks with Kanban boards</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search task" className="pl-9 w-64 focus:scale-[1.01] transition-transform duration-200" />
                </div>
                <Button variant="outline" size="icon" className="hover:scale-105 transition-transform duration-200">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button onClick={() => setModalOpen(true)} className="hover:scale-105 transition-transform duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-5 pb-6 overflow-x-auto">
                {columns.map((column) => (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    <div className="flex items-center justify-between mb-4 bg-muted/30 rounded-xl p-3">
                      <h2 className="font-semibold text-foreground">{column.title}</h2>
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                        {getTasksForColumn(column.id).length}
                      </span>
                    </div>

                    <SortableContext
                      items={getTasksForColumn(column.id).map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 min-h-[200px] bg-muted/10 rounded-xl p-3">
                        {getTasksForColumn(column.id).length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No tasks yet
                          </div>
                        ) : (
                          getTasksForColumn(column.id).map((task) => (
                            <KanbanCard key={task.id} {...task} />
                          ))
                        )}
                      </div>
                    </SortableContext>

                    <Button 
                      variant="outline" 
                      className="w-full mt-3 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200" 
                      size="sm"
                      onClick={() => setModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
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
