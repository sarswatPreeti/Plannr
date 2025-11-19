import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import { todoService, Todo } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
import { TodoCard } from "@/components/TodoCard";
import { AddTodoModal } from "@/components/AddTodoModal";

const categories = [
  { id: 'Personal', name: 'Personal', icon: '👤', color: '#3b82f6' },
  { id: 'Work', name: 'Work', icon: '💼', color: '#8b5cf6' },
  { id: 'Study', name: 'Study', icon: '📚', color: '#10b981' },
  { id: 'Health', name: 'Health', icon: '❤️', color: '#ef4444' },
  { id: 'Shopping', name: 'Shopping', icon: '🛒', color: '#f59e0b' },
  { id: 'Other', name: 'Other', icon: '📋', color: '#6b7280' },
];

export default function Category() {
  const { categoryName } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (categoryName) {
      const category = categories.find(c => c.id.toLowerCase() === categoryName.toLowerCase());
      if (category) {
        setSelectedCategory(category);
        loadCategoryTodos(category.id);
      }
    } else if (!selectedCategory) {
      setSelectedCategory(categories[0]);
      loadCategoryTodos(categories[0].id);
    }
  }, [categoryName]);

  const loadCategoryTodos = async (category: string) => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({ category });
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

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      if (selectedCategory) {
        loadCategoryTodos(selectedCategory.id);
      }
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
      if (selectedCategory) {
        loadCategoryTodos(selectedCategory.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  const todosByStatus = {
    todo: todos.filter(t => t.status === 'todo'),
    'in-progress': todos.filter(t => t.status === 'in-progress'),
    completed: todos.filter(t => t.status === 'completed'),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 ml-64">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{selectedCategory?.icon}</span>
                <h1 className="text-3xl font-bold text-foreground">
                  {selectedCategory?.name || 'Category'}
                </h1>
              </div>
              <p className="text-muted-foreground ml-1">
                {todos.length} {todos.length === 1 ? 'task' : 'tasks'} in this category
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category);
                  loadCategoryTodos(category.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory?.id === category.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border hover:border-primary/50 text-foreground"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <FolderOpen className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start organizing your work by creating tasks in this category
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* To Do */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">To Do</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {todosByStatus.todo.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todosByStatus.todo.map((todo) => (
                    <TodoCard
                      key={todo._id}
                      id={todo._id}
                      title={todo.title}
                      category={todo.category}
                      dueDate={todo.dueDate ? new Date(todo.dueDate) : new Date()}
                      description={todo.description}
                      completed={todo.completed}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                  {todosByStatus.todo.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">No tasks to do</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">In Progress</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {todosByStatus['in-progress'].length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todosByStatus['in-progress'].map((todo) => (
                    <TodoCard
                      key={todo._id}
                      id={todo._id}
                      title={todo.title}
                      category={todo.category}
                      dueDate={todo.dueDate ? new Date(todo.dueDate) : new Date()}
                      description={todo.description}
                      completed={todo.completed}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                  {todosByStatus['in-progress'].length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">No tasks in progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Completed</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {todosByStatus.completed.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todosByStatus.completed.map((todo) => (
                    <TodoCard
                      key={todo._id}
                      id={todo._id}
                      title={todo.title}
                      category={todo.category}
                      dueDate={todo.dueDate ? new Date(todo.dueDate) : new Date()}
                      description={todo.description}
                      completed={todo.completed}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                  {todosByStatus.completed.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">No completed tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Todo Modal */}
      <AddTodoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false);
          if (selectedCategory) {
            loadCategoryTodos(selectedCategory.id);
          }
        }}
      />
    </div>
  );
}
