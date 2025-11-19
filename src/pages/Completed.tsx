import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TodoCard } from "@/components/TodoCard";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, TrendingUp, CheckCircle2, Target, Flame } from "lucide-react";

export default function Completed() {
  const [todos, setTodos] = useState<any[]>([]);
  const [allTodos, setAllTodos] = useState<any[]>([]);
  const [allTasksCount, setAllTasksCount] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadTodos();
  }, []);

  const filterTodosByTime = useCallback(() => {
    const now = new Date();
    let filtered = [...allTodos];

    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = allTodos.filter(todo => new Date(todo.updatedAt) >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = allTodos.filter(todo => new Date(todo.updatedAt) >= monthAgo);
    } else if (timeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = allTodos.filter(todo => {
        const todoDate = new Date(todo.updatedAt);
        return todoDate >= today && todoDate < tomorrow;
      });
    }

    setTodos(filtered);
  }, [allTodos, timeFilter]);

  useEffect(() => {
    filterTodosByTime();
  }, [filterTodosByTime]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({});
      const allTasksData = response.data || [];
      const completedTodos = allTasksData.filter((todo: any) => {
        return todo.status === 'completed';
      });
      
      setAllTasksCount(allTasksData.length);
      setAllTodos(completedTodos);
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

  const getTotalTasks = () => {
    return allTodos.length;
  };

  const getCompletionRate = () => {
    if (allTasksCount === 0) return 0;
    return Math.round((allTodos.length / allTasksCount) * 100);
  };

  const getFilteredCount = () => {
    return todos.length;
  };

  const getCompletionStreak = () => {
    if (allTodos.length === 0) return 0;
    
    // Sort todos by completion date (most recent first)
    const sortedTodos = [...allTodos].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's a task completed today or yesterday to start the streak
    const mostRecentDate = new Date(sortedTodos[0].updatedAt);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If no task completed today or yesterday, streak is 0
    if (daysDiff > 1) return 0;
    
    // Count consecutive days with completed tasks
    let currentDate = new Date(mostRecentDate);
    const completionDates = new Set(
      sortedTodos.map(todo => {
        const date = new Date(todo.updatedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    while (completionDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const handleToggle = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      loadTodos();
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl leading-none">✓</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground tracking-tight">Completed</h1>
                  <p className="text-sm text-muted-foreground mt-1">All your accomplished tasks</p>
                </div>
              </div>

              {/* Time Filter */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Completed */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Completed</p>
                    <p className="text-2xl font-bold text-foreground">{getTotalTasks()}</p>
                  </div>
                </div>
              </div>

              {/* All Tasks Count */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">All Tasks</p>
                    <p className="text-2xl font-bold text-foreground">{allTasksCount}</p>
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-foreground">{getCompletionRate()}%</p>
                  </div>
                </div>
              </div>

              {/* Completion Streak */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Streak</p>
                    <p className="text-2xl font-bold text-foreground">{getCompletionStreak()} {getCompletionStreak() === 1 ? 'day' : 'days'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {!loading && todos.length > 0 && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">
                    {todos.length} {todos.length === 1 ? 'task' : 'tasks'} in selected period
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading completed tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <span className="text-6xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No completed tasks yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Complete tasks to see them here and celebrate your achievements!
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
                  dueDate={new Date(todo.dueDate || todo.createdAt)}
                  description={todo.description}
                  completed={todo.status === 'completed'}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
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
        defaultStatus="completed"
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
