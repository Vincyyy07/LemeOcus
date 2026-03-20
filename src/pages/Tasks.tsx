import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Trash2, X, Loader2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTasks, logTaskCompletion } from "@/hooks/use-tasks";
import { useFocus } from "@/context/FocusContext";
import { toast } from "sonner";

type Priority = "high" | "medium" | "low";
type Category = "all" | "work" | "study" | "health";
type Filter = "today" | "upcoming" | "completed";

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "health", label: "Health" },
];

const priorityDot: Record<Priority, string> = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-success",
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const Tasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { startFocus } = useFocus();
  const [category, setCategory] = useState<Category>("all");
  const [filter, setFilter] = useState<Filter>("today");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" as Priority, category: "work" as Exclude<Category, "all"> });

  const { data: tasks = [], isLoading } = useTasks();

  const toggleMutation = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
      if (error) throw error;
      if (user) await logTaskCompletion(id, user.id, done);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task_logs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newTask.title.trim() || !user) return;
      const { error } = await supabase.from("tasks").insert({
        title: newTask.title,
        priority: newTask.priority,
        category: newTask.category,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask({ title: "", priority: "medium", category: "work" });
      setShowModal(false);
      toast.success("Task added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = tasks.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (filter === "completed") return t.done;
    if (filter === "today") return !t.done;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 btn-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              category === c.value
                ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                : "bg-secondary/45 text-muted-foreground border border-border/40 hover:text-foreground hover:border-primary/20"
            )}
          >
            {c.label}
          </button>
        ))}
        <div className="w-px bg-border/50 mx-1" />
        {(["today", "upcoming", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm capitalize font-medium transition-all duration-200",
              filter === f
                ? "bg-accent/15 text-accent border border-accent/35 shadow-[0_0_10px_hsl(var(--accent)/0.15)]"
                : "bg-secondary/45 text-muted-foreground border border-border/40 hover:text-foreground hover:border-accent/20"
            )}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Task List */}
      <motion.div variants={stagger} className="space-y-2 glass-card rounded-2xl p-4">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.p variants={fadeUp} className="text-center text-muted-foreground py-10 text-sm">
              No tasks yet. Add one to get started!
            </motion.p>
          )}
          {filtered.map((task) => (
            <motion.div
              key={task.id}
              variants={fadeUp}
              exit={{ opacity: 0, x: -20 }}
              layout
              className={cn(
                "rounded-xl p-4 flex items-center gap-4 group transition-all duration-200 border",
                task.done
                  ? "bg-secondary/20 border-border/20 opacity-55"
                  : "bg-secondary/35 border-border/25 hover:border-primary/25 hover:bg-secondary/55"
              )}
            >
              <button onClick={() => toggleMutation.mutate({ id: task.id, done: !task.done })} className="shrink-0">
                {task.done ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.done && "line-through text-muted-foreground")}>{task.title}</p>
              </div>
              <span className={cn("w-2 h-2 rounded-full shrink-0", priorityDot[task.priority as Priority])} />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.done && (
                  <button
                    onClick={() => startFocus({ id: task.id, title: task.title })}
                    title="Start focus session"
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(task.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md glow-purple"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-semibold">New Task</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title..."
                  className="w-full input-focus rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addMutation.mutate()}
                />
                <div className="flex gap-3">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                    className="flex-1 input-focus rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Exclude<Category, "all"> })}
                    className="flex-1 input-focus rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="w-full btn-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;
