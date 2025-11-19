import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanCard } from "@/components/KanbanCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ChevronRight, List, LayoutGrid, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { projectService, Project } from "@/services/project.service";
import { todoService, Todo } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
import { AddTodoModal } from "@/components/AddTodoModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Task = Todo & {
  columnId: string;
  subtasksProgress?: { completed: number; total: number };
  projectColumn?: string; // Custom field to track which project column the task belongs to
};

const columns = [
  { id: "information", title: "Information", icon: "📝", color: "bg-blue-500", status: "todo" as const },
  { id: "planning", title: "Planning", icon: "🔄", color: "bg-orange-500", status: "in-progress" as const },
  { id: "project-tasks", title: "Project Tasks", icon: "📋", color: "bg-red-500", status: "in-progress" as const },
  { id: "meetings", title: "Meetings", icon: "🎯", color: "bg-purple-500", status: "completed" as const },
];

function DroppableColumn({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[300px] p-3 rounded-lg transition-colors ${
        isOver ? 'bg-primary/5 border-2 border-primary border-dashed' : 'border-2 border-transparent'
      }`}
    >
      {children}
    </div>
  );
}

export default function Projects() {
  const { projectId } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list" | "calendar">("board");
  const [selectedColumnForNewTask, setSelectedColumnForNewTask] = useState<string>("information");
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p._id === projectId);
      if (project) {
        setSelectedProject(project);
        loadProjectTasks(project._id);
      }
    } else if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
      loadProjectTasks(projects[0]._id);
    }
  }, [projectId, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      const projectsList = response.data || [];
      setProjects(projectsList);
      
      if (projectsList.length > 0 && !selectedProject) {
        setSelectedProject(projectsList[0]);
      } else if (projectsList.length === 0) {
        setTasks([]);
        setLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load projects",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({ projectId });
      const todos = response.data || [];
      
      // Get saved column mappings from localStorage
      const savedMappings = localStorage.getItem(`project-${projectId}-columns`);
      const columnMappings = savedMappings ? JSON.parse(savedMappings) : {};
      
      const mappedTasks: Task[] = todos.map((todo) => {
        // Use saved column mapping or default based on status
        let columnId = columnMappings[todo._id];
        
        if (!columnId) {
          // Default distribution based on status
          if (todo.status === 'todo') columnId = 'information';
          else if (todo.status === 'in-progress') columnId = 'planning';
          else if (todo.status === 'completed') columnId = 'meetings';
          else columnId = 'information';
        }
        
        return {
          ...todo,
          columnId,
          projectColumn: columnId,
          subtasksProgress: todo.subtasks && todo.subtasks.length > 0
            ? {
                completed: todo.subtasks.filter(st => st.completed).length,
                total: todo.subtasks.length
              }
            : undefined
        };
      });
      
      setTasks(mappedTasks);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await projectService.createProject({
        name: newProjectName,
        description: newProjectDesc,
        status: 'active'
      });
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      setNewProjectName("");
      setNewProjectDesc("");
      setProjectModalOpen(false);
      loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create project",
        variant: "destructive",
      });
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      return;
    }

    const activeTask = tasks.find((task) => task._id === active.id);
    if (!activeTask) return;

    // Check if dropped over a column or a task
    let targetColumnId: string | null = null;
    
    // If dropped on a column droppable area
    if (columns.some((col) => col.id === over.id)) {
      targetColumnId = over.id as string;
    } else {
      // If dropped on another task, find that task's column
      const overTask = tasks.find((task) => task._id === over.id);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }

    if (targetColumnId && activeTask.columnId !== targetColumnId) {
      // Find the target column to get its status
      const targetColumn = columns.find(col => col.id === targetColumnId);
      if (!targetColumn) return;
      
      // Optimistically update UI
      const previousTasks = [...tasks];
      setTasks(
        tasks.map((task) =>
          task._id === active.id ? { ...task, columnId: targetColumnId!, status: targetColumn.status, projectColumn: targetColumnId! } : task
        )
      );
      
      // Update in backend - only update status
      try {
        // Save column mapping to localStorage
        if (selectedProject) {
          const savedMappings = localStorage.getItem(`project-${selectedProject._id}-columns`);
          const columnMappings = savedMappings ? JSON.parse(savedMappings) : {};
          columnMappings[activeTask._id] = targetColumnId;
          localStorage.setItem(`project-${selectedProject._id}-columns`, JSON.stringify(columnMappings));
        }
        
        // Only update the status field
        await todoService.updateTodo(activeTask._id, { 
          status: targetColumn.status
        });
        
        toast({
          title: "Success",
          description: `Task moved to ${targetColumn.title}`,
        });
      } catch (error: any) {
        // Revert on error
        setTasks(previousTasks);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update task status",
          variant: "destructive",
        });
      }
    }
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((task) => task.columnId === columnId);

  const activeTask = tasks.find((task) => task._id === activeId);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-x-auto ml-64">
        <div className="px-6 py-6">
          {/* Breadcrumb & Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span className="cursor-pointer hover:text-foreground">📊 Project Management</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{selectedProject?.icon || "📁"} {selectedProject?.name || "Select Project"}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Tabs value={selectedProject?._id || projects[0]?._id} className="w-auto">
                <TabsList className="bg-muted/50">
                  {projects.slice(0, 6).map((project) => (
                    <TabsTrigger 
                      key={project._id} 
                      value={project._id}
                      onClick={() => setSelectedProject(project)}
                      className="gap-2"
                    >
                      <span>{project.icon || "📁"}</span>
                      <span>{project.name}</span>
                    </TabsTrigger>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setProjectModalOpen(true)}
                    className="ml-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TabsList>
              </Tabs>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Title & Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{selectedProject?.name || "Projects"}</h1>
                <p className="text-sm text-muted-foreground">{selectedProject?.description || "Short description to place here..."}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search task" className="pl-9 w-56" />
                </div>
                
                <div className="flex items-center bg-muted/50 rounded-lg p-1">
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "board" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("board")}
                    className="h-8 px-3"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "calendar" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    className="h-8 px-3"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
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
          </div>

          {/* Kanban Board */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <span className="text-6xl">📁</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first project to start organizing your tasks
              </p>
              <Button onClick={() => setProjectModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : viewMode === "board" ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCorners}
            >
              <div className="flex gap-4 pb-6 overflow-x-auto">
                {columns.map((column) => (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{column.icon}</span>
                      <h2 className="font-semibold text-foreground flex-1">{column.title}</h2>
                      <span className={`${column.color} text-white text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                        {getTasksForColumn(column.id).length}
                      </span>
                    </div>

                    <SortableContext
                      items={getTasksForColumn(column.id).map((t) => t._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn id={column.id}>
                        {getTasksForColumn(column.id).map((task) => (
                          <KanbanCard 
                            key={task._id} 
                            id={task._id}
                            title={task.title}
                            category={task.category}
                            priority={task.priority}
                            dueDate={new Date(task.dueDate || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            subtasks={task.subtasksProgress}
                            comments={0}
                            attachments={0}
                          />
                        ))}
                      </DroppableColumn>
                    </SortableContext>

                    <Button 
                      variant="ghost" 
                      className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground" 
                      size="sm"
                      onClick={() => {
                        setSelectedColumnForNewTask(column.id);
                        setModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                ))}
              </div>

              <DragOverlay>
                {activeTask && (
                  <KanbanCard 
                    id={activeTask._id}
                    title={activeTask.title}
                    category={activeTask.category}
                    priority={activeTask.priority}
                    dueDate={new Date(activeTask.dueDate || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    subtasks={activeTask.subtasksProgress}
                    comments={0}
                    attachments={0}
                  />
                )}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              {viewMode === "list" ? "List view coming soon" : "Calendar view coming soon"}
            </div>
          )}
        </div>
      </main>
      
      <AddTodoModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        projectId={selectedProject?._id}
        projectColumn={selectedColumnForNewTask}
        defaultStatus={columns.find(col => col.id === selectedColumnForNewTask)?.status}
        onSuccess={() => {
          setModalOpen(false);
          if (selectedProject) {
            loadProjectTasks(selectedProject._id);
          }
        }}
      />

      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your tasks
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-desc">Description (Optional)</Label>
              <Input
                id="project-desc"
                placeholder="Short description..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
