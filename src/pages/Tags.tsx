import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Tag as TagIcon } from "lucide-react";
import { tagService, Tag } from "@/services/tag.service";
import { todoService, Todo } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";
import { TodoCard } from "@/components/TodoCard";
import { AddTodoModal } from "@/components/AddTodoModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function Tags() {
  const { tagId } = useParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (tagId && tags.length > 0) {
      const tag = tags.find(t => t._id === tagId);
      if (tag) {
        setSelectedTag(tag);
        loadTagTodos(tagId);
      }
    } else if (tags.length > 0 && !selectedTag) {
      setSelectedTag(tags[0]);
      loadTagTodos(tags[0]._id);
    }
  }, [tagId, tags]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags();
      setTags(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTagTodos = async (tagId: string) => {
    try {
      setLoading(true);
      // For now, load all todos and filter - backend should support tag filtering
      const response = await todoService.getTodos({});
      const allTodos = response.data || [];
      // Filter todos that have this tag
      const filteredTodos = allTodos.filter(todo => 
        todo.tags?.includes(tagId)
      );
      setTodos(filteredTodos);
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

  const handleCreateOrUpdateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const tagData = {
        name: newTagName,
        color: newTagColor,
      };

      if (editingTag) {
        await tagService.updateTag(editingTag._id, tagData);
        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
      } else {
        await tagService.createTag(tagData);
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
      }

      setNewTagName("");
      setNewTagColor("#6366f1");
      setEditingTag(null);
      setTagModalOpen(false);
      loadTags();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${editingTag ? 'update' : 'create'} tag`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      await tagService.deleteTag(tagToDelete._id);
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      loadTags();
      if (selectedTag?._id === tagToDelete._id) {
        setSelectedTag(null);
        setTodos([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      if (selectedTag) {
        loadTagTodos(selectedTag._id);
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
      if (selectedTag) {
        loadTagTodos(selectedTag._id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 ml-64">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Tags</h1>
              <p className="text-muted-foreground">
                Organize your tasks with tags
              </p>
            </div>
            <Button onClick={() => {
              setEditingTag(null);
              setNewTagName("");
              setNewTagColor("#6366f1");
              setTagModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Tag
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading tags...</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center justify-center py-12 mb-8">
                <div className="h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                  <TagIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No tags yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create tags to organize and categorize your tasks. Here are some suggestions to get started:
                </p>
                <Button onClick={() => {
                  setEditingTag(null);
                  setNewTagName("");
                  setNewTagColor("#6366f1");
                  setTagModalOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tag
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on any tag below to create it instantly:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Urgent", color: "#ef4444", icon: "🔥" },
                  { name: "Bug", color: "#dc2626", icon: "🐛" },
                  { name: "Feature", color: "#3b82f6", icon: "✨" },
                  { name: "Meeting", color: "#8b5cf6", icon: "📅" },
                  { name: "Review", color: "#f59e0b", icon: "👀" },
                  { name: "Documentation", color: "#10b981", icon: "📝" },
                  { name: "Planning", color: "#6366f1", icon: "🎯" },
                  { name: "Research", color: "#06b6d4", icon: "🔍" },
                  { name: "Design", color: "#ec4899", icon: "🎨" },
                ].map((tag) => (
                  <button
                    key={tag.name}
                    onClick={async () => {
                      try {
                        await tagService.createTag({
                          name: tag.name,
                          color: tag.color,
                        });
                        toast({
                          title: "Success",
                          description: `Tag "${tag.name}" created successfully`,
                        });
                        loadTags();
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.response?.data?.message || "Failed to create tag",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tag.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {tag.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Click to create
                        </span>
                      </div>
                      <Plus className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Or create a custom tag with your own name and color
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTag(null);
                    setNewTagName("");
                    setNewTagColor("#6366f1");
                    setTagModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Tag
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tags List */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Your Tags</h2>
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div
                        key={tag._id}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedTag?._id === tag._id
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted border border-transparent"
                        }`}
                        onClick={() => {
                          setSelectedTag(tag);
                          loadTagTodos(tag._id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {tag.count || 0}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTag(tag);
                                setNewTagName(tag.name);
                                setNewTagColor(tag.color);
                                setTagModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTagToDelete(tag);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Todos with Selected Tag */}
              <div className="lg:col-span-2">
                {selectedTag ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedTag.color }}
                        />
                        <h2 className="text-2xl font-semibold">{selectedTag.name}</h2>
                        <span className="text-sm text-muted-foreground">
                          ({todos.length} {todos.length === 1 ? 'task' : 'tasks'})
                        </span>
                      </div>
                      <Button onClick={() => setModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    {todos.length === 0 ? (
                      <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                          No tasks with this tag yet
                        </p>
                        <Button onClick={() => setModalOpen(true)} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Task
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todos.map((todo) => (
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
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">
                      Select a tag to view its tasks
                    </p>
                  </div>
                )}
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
          if (selectedTag) {
            loadTagTodos(selectedTag._id);
          }
        }}
      />

      {/* Tag Modal */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
            <DialogDescription>
              {editingTag ? 'Update your tag details' : 'Add a new tag to organize your tasks'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdateTag} disabled={!newTagName.trim()}>
              {editingTag ? 'Update' : 'Create'} Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the tag "{tagToDelete?.name}". This action cannot be undone.
              Tasks with this tag will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
