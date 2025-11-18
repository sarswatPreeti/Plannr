import { Link, useLocation } from "react-router-dom";
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

const navigation = [
  { name: "My Day", href: "/", icon: Zap, count: 8 },
  { name: "Important", href: "/important", icon: AlertCircle },
  { name: "Personal", href: "/personal", icon: User, count: 4 },
  { name: "Projects", href: "/projects", icon: Briefcase, count: 12 },
  { name: "All", href: "/all", icon: Grid3x3, count: 56 },
  { name: "Completed", href: "/completed", icon: CheckCircle2, count: 10 },
];

const tags = [
  { name: "Work Projects", icon: Briefcase, count: 12, color: "text-primary" },
  { name: "Personal", icon: Tag, count: 8, color: "text-category-personal" },
  { name: "Shopping", icon: Tag, count: 3, color: "text-category-project" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">Rutinitas</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            className="pl-9 bg-secondary border-0"
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="px-4 flex-1 overflow-y-auto">
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
            {tags.map((tag) => (
              <button
                key={tag.name}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <tag.icon className={`w-4 h-4 ${tag.color}`} />
                  <span>{tag.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{tag.count}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
