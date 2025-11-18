import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { AddTodoModal } from "@/components/AddTodoModal";

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

const mockTodos: Todo[] = [
  {
    id: "1",
    name: "Prototopl Mobile App",
    client: "Lady Diana",
    description: "Project Performance Insights",
    deadline: "Jun 8, 2025",
    people: [{ name: "John Doe" }, { name: "Jane Smith" }],
    priority: "medium",
    status: "todo",
  },
  {
    id: "2",
    name: "YellyBox Project",
    client: "Roberto Kulgra",
    description: "Data-Driven Optimization Strategy",
    deadline: "Jul 15, 2025",
    people: [{ name: "Mike Johnson" }, { name: "Sarah Williams" }],
    priority: "high",
    status: "progress",
  },
  {
    id: "3",
    name: "Minicam Exploration",
    client: "Mariam Belina",
    description: "Key Metrics Tracker",
    deadline: "Aug 22, 2025",
    people: [{ name: "Alex Brown" }, { name: "Emily Davis" }],
    priority: "low",
    status: "progress",
  },
  {
    id: "4",
    name: "Alexa AI (landing page)",
    client: "Dody Fayet",
    description: "Performance Measurement Hub",
    deadline: "Sep 10, 2025",
    people: [{ name: "Chris Wilson" }],
    priority: "medium",
    status: "progress",
  },
  {
    id: "5",
    name: "Warkopolim",
    client: "Wancoy",
    description: "Optimization Project Overview",
    deadline: "Oct 5, 2025",
    people: [{ name: "Pat Taylor" }],
    priority: "low",
    status: "progress",
  },
  {
    id: "6",
    name: "Mantraman (Branding)",
    client: "Nathalie Wed",
    description: "Analytics and Insights Project",
    deadline: "Nov 12, 2025",
    people: [{ name: "Jordan Lee" }],
    priority: "high",
    status: "review",
  },
  {
    id: "7",
    name: "Animisme (Research)",
    client: "Brody",
    description: "Key Performance Dashboard",
    deadline: "Dec 30, 2025",
    people: [{ name: "Morgan Kim" }],
    priority: "low",
    status: "review",
  },
];

const sections = [
  { id: "todo", title: "TO DO", count: 1 },
  { id: "progress", title: "IN PROGRESS", count: 4 },
  { id: "review", title: "IN REVIEW", count: 2 },
  { id: "completed", title: "COMPLETED", count: 0 },
];

export default function AllTodos() {
  const [todos] = useState<Todo[]>(mockTodos);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "todo",
    "progress",
    "review",
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getTodosForSection = (status: string) =>
    todos.filter((todo) => todo.status === status);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
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
                            <Checkbox />
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
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
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
        </div>
      </main>

      <AddTodoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
