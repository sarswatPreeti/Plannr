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
  Search,
  FolderOpen,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/user.service";
import { tagService } from "@/services/tag.service";
import { projectService, Project } from "@/services/project.service";

export function AppSidebar() {
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadStats();
    loadTags();
    loadProjects();
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

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects('active');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects');
    }
  };

  const categories = [
    { id: 'Personal', name: 'Personal', icon: '👤', color: '#3b82f6' },
    { id: 'Work', name: 'Work', icon: '💼', color: '#8b5cf6' },
    { id: 'Study', name: 'Study', icon: '📚', color: '#10b981' },
    { id: 'Health', name: 'Health', icon: '❤️', color: '#ef4444' },
    { id: 'Shopping', name: 'Shopping', icon: '🛒', color: '#f59e0b' },
    { id: 'Other', name: 'Other', icon: '📋', color: '#6b7280' },
  ];

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
        <Link to="/today" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">Plannr</span>
        </Link>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Tags
            </h3>
            <Link to="/tags">
              <Tag className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer" />
            </Link>
          </div>
          <nav className="space-y-1">
            {tags.length > 0 ? (
              tags.slice(0, 5).map((tag) => {
                const isActive = location.pathname === `/tags/${tag._id}`;
                return (
                  <Link
                    key={tag._id}
                    to={`/tags/${tag._id}`}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4" style={{ color: isActive ? 'currentColor' : (tag.color || '#6366f1') }} />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    {tag.count !== undefined && (
                      <span className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {tag.count}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <Link
                to="/tags"
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors border border-dashed border-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first tag
              </Link>
            )}
            {tags.length > 5 && (
              <Link
                to="/tags"
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
              >
                View all tags
              </Link>
            )}
          </nav>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categories
            </h3>
            <Link to="/categories">
              <FolderOpen className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer" />
            </Link>
          </div>
          <nav className="space-y-1">
            {categories.slice(0, 5).map((category) => {
              const isActive = location.pathname === `/categories/${category.id.toLowerCase()}`;
              return (
                <Link
                  key={category.id}
                  to={`/categories/${category.id.toLowerCase()}`}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{category.icon}</span>
                    <span className="truncate">{category.name}</span>
                  </div>
                </Link>
              );
            })}
            <Link
              to="/categories"
              className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
            >
              View all categories
            </Link>
          </nav>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
            <Link to="/projects">
              <Briefcase className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer" />
            </Link>
          </div>
          <nav className="space-y-1">
            {projects.length > 0 ? (
              projects.slice(0, 5).map((project) => {
                const isActive = location.pathname === `/projects/${project._id}`;
                return (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{project.icon || '📁'}</span>
                      <span className="truncate">{project.name}</span>
                    </div>
                    {project.todoCount !== undefined && (
                      <span className={`text-xs ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}>
                        {project.todoCount}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-2">No projects yet</p>
            )}
            {projects.length > 5 && (
              <Link
                to="/projects"
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors"
              >
                View all projects
              </Link>
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
