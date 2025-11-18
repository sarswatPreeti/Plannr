import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TodoCard } from "@/components/TodoCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";

const mockTodos = [
  {
    id: "1",
    title: "Promotion banner",
    category: "GoPay",
    dueDate: new Date(),
    icon: "📢",
    completed: false,
  },
  {
    id: "2",
    title: "Daily workout",
    category: "Personal",
    dueDate: new Date(),
    icon: "🏋️",
    completed: false,
  },
  {
    id: "3",
    title: "Make Dribbble shoot",
    category: "Kretya Studio",
    dueDate: new Date(Date.now() + 86400000),
    icon: "🏀",
    completed: false,
  },
  {
    id: "4",
    title: "Announcement of Kretya Design Challenge #1",
    category: "Kretya Studio",
    dueDate: new Date(Date.now() + 86400000),
    icon: "📢",
    completed: false,
  },
  {
    id: "5",
    title: "Buy LED Strips",
    category: "Personal",
    dueDate: new Date(Date.now() + 172800000),
    icon: "💡",
    completed: false,
  },
  {
    id: "6",
    title: "Pull to refresh at promo discovery",
    category: "GoPay",
    dueDate: new Date(Date.now() + 259200000),
    icon: "📱",
    completed: false,
  },
  {
    id: "7",
    title: "Edit video for social media",
    category: "Content Dump",
    dueDate: new Date(Date.now() + 259200000),
    icon: "🎥",
    completed: false,
  },
  {
    id: "8",
    title: "Make mood-board for new office interior",
    category: "Content Dump",
    dueDate: new Date(Date.now() + 259200000),
    icon: "🎨",
    completed: false,
  },
];

export default function Today() {
  const [todos, setTodos] = useState(mockTodos);
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Day</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>

          <div className="space-y-2 mb-6">
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                {...todo}
                onToggle={handleToggle}
              />
            ))}
          </div>

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
      />
    </div>
  );
}
