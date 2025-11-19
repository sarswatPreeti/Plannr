import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TodoCard } from "@/components/TodoCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Important() {
  const [todos, setTodos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({});
      // Filter high priority todos
      const importantTodos = (response.data || []).filter((todo: any) => {
        return todo.priority === 'high';
      });
      
      setTodos(importantTodos);
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

  const handleToggle = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      setTodos(todos.map(todo => 
        todo._id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (todo) {
      setEditingTodo(todo);
      setModalOpen(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!todoToDelete) return;
    
    try {
      await todoService.deleteTodo(todoToDelete);
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
      loadTodos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTodoToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-3xl leading-none">⭐</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Important</h1>
                <p className="text-sm text-muted-foreground mt-1">High priority tasks that need your attention</p>
              </div>
            </div>
            
            {!loading && todos.length > 0 && (
              <div className="flex items-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-muted-foreground">
                    {todos.filter(t => !t.completed).length} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">
                    {todos.filter(t => t.completed).length} completed
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading important tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <span className="text-6xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No important tasks</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Mark tasks as high priority to see them here. Stay focused on what matters most!
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {todos.map((todo) => (
                <TodoCard
                  key={todo._id}
                  id={todo._id}
                  title={todo.title}
                  category={todo.category || 'Personal'}
                  dueDate={new Date(todo.dueDate)}
                  description={todo.description}
                  completed={todo.completed}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}

          {/* Add Button */}
          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full h-14 text-base font-semibold rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 hover:shadow-lg transition-all duration-300 group"
            variant="outline"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">Add Important Task</span>
            </div>
          </Button>
        </div>
      </main>

      <AddTodoModal 
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingTodo(null);
        }}
        onSuccess={loadTodos}
        editingTodo={editingTodo}
        defaultPriority="high"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this todo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
