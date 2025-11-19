import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { todoService } from "@/services/todo.service";
import { useToast } from "@/hooks/use-toast";

interface AddTodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultDate?: Date;
  editingTodo?: any;
  defaultPriority?: 'low' | 'medium' | 'high';
  projectId?: string;
  defaultStatus?: 'todo' | 'in-progress' | 'review' | 'completed';
  projectColumn?: string;
}

export function AddTodoModal({ open, onOpenChange, onSuccess, defaultDate, editingTodo, defaultPriority, projectId, defaultStatus, projectColumn }: AddTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Personal");
  const [priority, setPriority] = useState<string>(defaultPriority || "medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(defaultDate);
  const [time, setTime] = useState<string>("09:00");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || "");
      setDescription(editingTodo.description || "");
      setCategory(editingTodo.category || "Personal");
      setPriority(editingTodo.priority || "medium");
      
      if (editingTodo.dueDate) {
        const date = new Date(editingTodo.dueDate);
        setDueDate(date);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setTime(`${hours}:${minutes}`);
      }
    } else {
      setTitle("");
      setDescription("");
      setCategory("Personal");
      setPriority(defaultPriority || "medium");
      setDueDate(defaultDate);
      setTime("09:00");
    }
  }, [editingTodo, defaultDate, defaultPriority]);

  const handleSave = async () => {
    if (!title) return;

    try {
      setSaving(true);
      
      // Combine date and time
      let finalDate = dueDate || new Date();
      if (defaultDate && time) {
        const [hours, minutes] = time.split(':');
        finalDate = new Date(finalDate);
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      const todoData = {
        title,
        description,
        category,
        priority: priority as 'low' | 'medium' | 'high',
        dueDate: finalDate.toISOString(),
        completed: editingTodo?.completed || false,
        status: editingTodo?.status || defaultStatus || 'todo',
        tags: projectColumn ? [`projectColumn:${projectColumn}`] : [],
        ...(projectId && { projectId }),
      };

      if (editingTodo) {
        await todoService.updateTodo(editingTodo._id, todoData);
        toast({
          title: "Success",
          description: "Todo updated successfully",
        });
      } else {
        await todoService.createTodo(todoData);
        toast({
          title: "Success",
          description: "Todo created successfully",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Personal");
      setPriority("medium");
      setDueDate(defaultDate);
      setTime("09:00");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${editingTodo ? 'update' : 'create'} todo`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingTodo ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingTodo ? 'Update your task details below.' : 'Add a new task to your todo list. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '0ms' }}>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus:scale-[1.01] transition-transform duration-200"
            />
          </div>

          <div className="grid gap-2 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '100ms' }}>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="focus:scale-[1.01] transition-transform duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '200ms' }}>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="focus:scale-[1.01] transition-transform duration-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority} disabled={!!defaultPriority}>
                <SelectTrigger id="priority" className="focus:scale-[1.01] transition-transform duration-200">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: '300ms' }}>
            {!defaultDate ? (
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal focus:scale-[1.01] transition-transform duration-200",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="focus:scale-[1.01] transition-transform duration-200"
                />
              </div>
            )}
            
            {defaultDate && (
              <div className="grid gap-2">
                <Label>Date</Label>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Today
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={saving}
            className="hover:scale-105 transition-transform duration-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title || saving}
            className="hover:scale-105 transition-transform duration-200"
          >
            {saving ? (editingTodo ? "Updating..." : "Creating...") : (editingTodo ? "Update Task" : "Create Task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
