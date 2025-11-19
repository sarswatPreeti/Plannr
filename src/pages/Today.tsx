import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TodoCard } from "@/components/TodoCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";

export default function Today() {
  const [todos, setTodos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await todoService.getTodos({ dueDate: today });
      setTodos(response.data || []);
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

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Day</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading todos...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No todos for today</div>
          ) : (
            <div className="space-y-2 mb-6">
              {todos.map((todo) => (
                <TodoCard
                  key={todo._id}
                  id={todo._id}
                  title={todo.title}
                  category={todo.project?.name || 'Personal'}
                  dueDate={new Date(todo.dueDate)}
                  description={todo.description}
                  icon="📋"
                  completed={todo.completed}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}

          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Todo
          </Button>
        </div>
      </main>

      <AddTodoModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={loadTodos}
      />
    </div>
  );
}
