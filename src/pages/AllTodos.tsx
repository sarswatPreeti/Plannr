import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronDown, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
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
  status: "todo" | "progress" | "review" | "completed";
};

export default function AllTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "todo",
    "progress",
    "review",
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

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
        client: todo.project?.name || 'Personal',
        description: todo.description || '',
        deadline: new Date(todo.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        people: [{ name: 'User' }],
        priority: todo.priority || 'medium',
        status: todo.completed ? 'completed' : (todo.status || 'todo'),
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

  const getTodosForSection = (status: string) =>
    todos.filter((todo) => todo.status === status);

  // Calculate dynamic section counts
  const sections = [
    { id: "todo", title: "TO DO", count: getTodosForSection('todo').length },
    { id: "progress", title: "IN PROGRESS", count: getTodosForSection('progress').length },
    { id: "review", title: "IN REVIEW", count: getTodosForSection('review').length },
    { id: "completed", title: "COMPLETED", count: getTodosForSection('completed').length },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Hello, manage your project.
              </h1>
              <p className="text-sm text-muted-foreground">
                You can monitor, analyze, and refine essential metrics to improve your project
                outcomes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search team" className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading todos...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No todos yet. Create your first todo!</div>
          ) : (
            <div className="space-y-1">
            {sections.map((section) => {
              const sectionTodos = getTodosForSection(section.id);
              const isExpanded = expandedSections.includes(section.id);

              return (
                <div key={section.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-sm uppercase tracking-wide text-foreground">
                      {section.title}
                    </span>
                    <span className="text-xs text-muted-foreground">({section.count})</span>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div>
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/10 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <div className="col-span-3">Project Name</div>
                        <div className="col-span-2">Client</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2">Deadline</div>
                        <div className="col-span-1">People</div>
                        <div className="col-span-1">Priority</div>
                      </div>

                      {/* Table Rows */}
                      {sectionTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-border hover:bg-muted/20 transition-colors items-center"
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <Checkbox 
                              checked={todo.status === 'completed'}
                              onCheckedChange={() => handleToggleTodo(todo.id)}
                            />
                            <span className="font-medium text-sm text-foreground">{todo.name}</span>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {todo.client}
                          </div>
                          <div className="col-span-3 text-sm text-muted-foreground">
                            {todo.description}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {todo.deadline}
                          </div>
                          <div className="col-span-1">
                            <div className="flex -space-x-2">
                              {todo.people.map((person, idx) => (
                                <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                                  <AvatarImage src={person.avatar} />
                                  <AvatarFallback className="text-xs">
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
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}

                      {/* Add Button */}
                      <div className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Plus className="w-4 h-4 mr-2" />
                          Add task
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </main>

      <AddTodoModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={loadTodos} />
    </div>
  );
}
