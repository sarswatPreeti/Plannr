import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, ChevronDown, ChevronRight, MoreHorizontal, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Todo = {
  id: string;
  name: string;
  client: string;
  description: string;
  deadline: string;
  people: { name: string; avatar?: string }[];
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
};

function DroppableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

function SortableRow({ todo, onToggle, onDelete }: { todo: Todo; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border hover:bg-muted/10 transition-all duration-200 items-center cursor-move group"
    >
      <div className="col-span-3 flex items-center gap-3">
        <Checkbox 
          checked={todo.status === 'completed'}
          onCheckedChange={() => onToggle(todo.id)}
          className="data-[state=checked]:bg-green-500"
        />
        <span className={`font-medium text-sm ${todo.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {todo.name}
        </span>
      </div>
      <div className="col-span-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
          {todo.client}
        </span>
      </div>
      <div className="col-span-3 text-sm text-muted-foreground line-clamp-1">
        {todo.description || "No description"}
      </div>
      <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {todo.deadline}
      </div>
      <div className="col-span-1">
        <div className="flex -space-x-2">
          {todo.people.map((person, idx) => (
            <Avatar key={idx} className="h-8 w-8 border-2 border-background ring-1 ring-border">
              <AvatarImage src={person.avatar} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-between">
        <PriorityBadge priority={todo.priority} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onDelete(todo.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function AllTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "todo",
    "in-progress",
    "completed",
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("todo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({});
      // Map API response to match Todo interface
      const mappedTodos = response.data?.map((todo: any) => ({
        id: todo._id,
        name: todo.title,
        client: todo.category || 'Personal',
        description: todo.description || '',
        deadline: new Date(todo.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        people: [{ name: 'User' }],
        priority: todo.priority || 'medium',
        status: todo.status || 'todo', // Use the status field directly from backend
      })) || [];
      setTodos(mappedTodos);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load todos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      loadTodos(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
      loadTodos(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTodo = todos.find(t => t.id === activeId);
    if (!activeTodo) return;

    // Check if dropped directly on a section
    const targetSection = sections.find(section => section.id === overId);
    
    if (targetSection) {
      // Dropped on section - change status
      if (activeTodo.status !== targetSection.id) {
        // Optimistically update UI
        const previousTodos = [...todos];
        setTodos(prev => prev.map(t => 
          t.id === activeId ? { ...t, status: targetSection.id as any } : t
        ));

        try {
          console.log('Updating task:', activeId, 'to status:', targetSection.id);
          // Get the full todo from backend to preserve its data
          const fullTodo = await todoService.getTodo(activeId);
          
          // Filter out projectColumn tags and keep real tags
          const cleanTags = (fullTodo.data.tags || []).filter(tag => !tag.startsWith('projectColumn:'));
          
          // Update with clean tags
          const updatePayload = { 
            status: targetSection.id as 'todo' | 'in-progress' | 'completed',
            tags: cleanTags // Send empty array or cleaned tags
          };
          console.log('Update payload:', updatePayload);
          const result = await todoService.updateTodo(activeId, updatePayload);
          console.log('Update successful:', result);
          toast({
            title: "Success",
            description: `Task moved to ${targetSection.title}`,
          });
        } catch (error: any) {
          console.error('Update failed:', error.response?.data || error.message);
          // Revert on error
          setTodos(previousTodos);
          toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "Failed to update task status",
            variant: "destructive",
          });
        }
      }
    } else {
      // Dropped on another task
      const overTodo = todos.find(t => t.id === overId);
      
      if (overTodo) {
        if (activeTodo.status === overTodo.status) {
          // Reorder within the same section
          const sectionTodos = todos.filter(t => t.status === activeTodo.status);
          const oldIndex = sectionTodos.findIndex(t => t.id === activeId);
          const newIndex = sectionTodos.findIndex(t => t.id === overId);

          if (oldIndex !== newIndex) {
            const updatedSectionTodos = [...sectionTodos];
            const [movedTodo] = updatedSectionTodos.splice(oldIndex, 1);
            updatedSectionTodos.splice(newIndex, 0, movedTodo);

            const otherTodos = todos.filter(t => t.status !== activeTodo.status);
            setTodos([...otherTodos, ...updatedSectionTodos]);
          }
        } else {
          // Move to different section
          const previousTodos = [...todos];
          setTodos(prev => prev.map(t => 
            t.id === activeId ? { ...t, status: overTodo.status } : t
          ));

          try {
            console.log('Updating task:', activeId, 'to status:', overTodo.status);
            // Get the full todo from backend to preserve its data
            const fullTodo = await todoService.getTodo(activeId);
            
            // Filter out projectColumn tags and keep real tags
            const cleanTags = (fullTodo.data.tags || []).filter(tag => !tag.startsWith('projectColumn:'));
            
            // Update with clean tags
            const updatePayload = { 
              status: overTodo.status as 'todo' | 'in-progress' | 'completed',
              tags: cleanTags
            };
            console.log('Update payload:', updatePayload);
            const result = await todoService.updateTodo(activeId, updatePayload);
            console.log('Update successful:', result);
            toast({
              title: "Success",
              description: `Task moved to ${sections.find(s => s.id === overTodo.status)?.title}`,
            });
          } catch (error: any) {
            console.error('Update failed:', error.response?.data || error.message);
            // Revert on error
            setTodos(previousTodos);
            toast({
              title: "Error",
              description: error.response?.data?.message || error.message || "Failed to update task status",
              variant: "destructive",
            });
          }
        }
      }
    }
  };

  const getTodosForSection = (status: string) =>
    todos.filter((todo) => todo.status === status);

  // Calculate dynamic section counts
  const sections = [
    { id: "todo", title: "TO DO", count: getTodosForSection('todo').length },
    { id: "in-progress", title: "IN PROGRESS", count: getTodosForSection('in-progress').length },
    { id: "completed", title: "COMPLETED", count: getTodosForSection('completed').length },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto ml-64">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                  All Tasks
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor, organize, and manage all your tasks across different stages
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search tasks..." className="pl-9 w-64 h-10" />
                </div>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setModalOpen(true)} className="h-10">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first task to get started on your projects
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">{sections.map((section) => {
              const sectionTodos = getTodosForSection(section.id);
              const isExpanded = expandedSections.includes(section.id);

              return (
                <div key={section.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform" />
                      )}
                      <span className="font-semibold text-base uppercase tracking-wide text-foreground">
                        {section.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {section.count}
                      </span>
                    </div>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <DroppableSection id={section.id}>
                      <div className="bg-background">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <div className="col-span-3">Task Name</div>
                          <div className="col-span-2">Category</div>
                          <div className="col-span-3">Description</div>
                          <div className="col-span-2">Due Date</div>
                          <div className="col-span-1">Assignee</div>
                          <div className="col-span-1">Priority</div>
                        </div>

                        {/* Table Rows with Drag and Drop */}
                        <SortableContext items={sectionTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                          {sectionTodos.map((todo) => (
                            <SortableRow
                              key={todo.id}
                              todo={todo}
                              onToggle={handleToggleTodo}
                              onDelete={handleDeleteTodo}
                            />
                          ))}
                        </SortableContext>

                        {/* Add Button */}
                        <div className="px-6 py-4 border-t border-border bg-muted/5">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            onClick={() => {
                              setSelectedSection(section.id);
                              setModalOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add task to {section.title.toLowerCase()}
                          </Button>
                        </div>
                      </div>
                    </DroppableSection>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-background border-2 border-primary rounded-xl shadow-2xl p-4 opacity-95">
              <span className="font-semibold text-sm">
                {todos.find(t => t.id === activeId)?.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      </main>

      <AddTodoModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        onSuccess={loadTodos}
        defaultStatus={selectedSection as "todo" | "in-progress" | "completed"}
      />
    </div>
  );
}
