import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Zap, 
  AlertCircle, 
  User, 
  Grid3x3, 
  CheckCircle2, 
  Briefcase,
  Tag,
  Settings,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/user.service";
import { tagService } from "@/services/tag.service";

export function AppSidebar() {
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadTags();
  }, []);

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getTags();
      setTags(response.data || []);
    } catch (error) {
      console.error('Failed to load tags');
    }
  };

  const navigation = [
    { name: "My Day", href: "/today", icon: Zap, count: stats?.todosToday || 0 },
    { name: "Important", href: "/important", icon: AlertCircle },
    { name: "Personal", href: "/personal", icon: User },
    { name: "Projects", href: "/projects", icon: Briefcase, count: stats?.totalProjects || 0 },
    { name: "All", href: "/all", icon: Grid3x3, count: stats?.totalTodos || 0 },
    { name: "Completed", href: "/completed", icon: CheckCircle2, count: stats?.completedTodos || 0 },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">Rutinitas</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            className="pl-9 bg-secondary border-0"
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="px-4 flex-1 overflow-y-auto min-h-0">
        <div className="mb-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Favorites
          </h3>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.count && (
                    <span className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Your Tags
          </h3>
          <nav className="space-y-1">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <button
                  key={tag._id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4" style={{ color: tag.color || '#6366f1' }} />
                    <span>{tag.name}</span>
                  </div>
                  {tag.count !== undefined && (
                    <span className="text-xs text-muted-foreground">{tag.count}</span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-2">No tags yet</p>
            )}
          </nav>
        </div>
      </div>

      {/* Profile & Settings */}
      <div className="p-4 border-t border-sidebar-border flex-shrink-0 space-y-1">
        <Link 
          to="/profile"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
        <Link 
          to="/settings"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
