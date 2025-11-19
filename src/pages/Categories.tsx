import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { FolderOpen } from "lucide-react";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: 'Personal', name: 'Personal', icon: '👤', color: '#3b82f6', description: 'Personal tasks and activities' },
  { id: 'Work', name: 'Work', icon: '💼', color: '#8b5cf6', description: 'Work-related tasks and projects' },
  { id: 'Study', name: 'Study', icon: '📚', color: '#10b981', description: 'Learning and study tasks' },
  { id: 'Health', name: 'Health', icon: '❤️', color: '#ef4444', description: 'Health and fitness goals' },
  { id: 'Shopping', name: 'Shopping', icon: '🛒', color: '#f59e0b', description: 'Shopping lists and purchases' },
  { id: 'Other', name: 'Other', icon: '📋', color: '#6b7280', description: 'Miscellaneous tasks' },
];

export default function Categories() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCategoryCounts();
  }, []);

  const loadCategoryCounts = async () => {
    try {
      setLoading(true);
      const response = await todoService.getTodos({});
      const todos = response.data || [];
      
      const counts: Record<string, number> = {};
      categories.forEach(cat => {
        counts[cat.id] = todos.filter(todo => todo.category === cat.id).length;
      });
      
      setCategoryCounts(counts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 ml-64">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
            <p className="text-muted-foreground">
              Organize your tasks by category
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id.toLowerCase()}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {categoryCounts[category.id] || 0} tasks
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
