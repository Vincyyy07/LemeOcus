import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, CheckCircle2, Trophy, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const Habits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, done, streak }: { id: string; done: boolean; streak: number }) => {
      const newStreak = done ? streak + 1 : Math.max(0, streak - 1);
      const habit = habits.find(h => h.id === id);
      const longestStreak = habit ? Math.max(habit.longest_streak, newStreak) : newStreak;
      const { error } = await supabase.from("habits").update({ done, streak: newStreak, longest_streak: longestStreak }).eq("id", id);
      if (error) throw error;
      // Write habit_log for today so Reports can track history
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        await supabase.from("habit_logs").upsert(
          { habit_id: id, user_id: user.id, date: today, done },
          { onConflict: "habit_id,date" }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit_logs"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newHabitName.trim() || !user) return;
      const { error } = await supabase.from("habits").insert({ name: newHabitName, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setNewHabitName("");
      setShowModal(false);
      toast.success("Habit added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const completed = habits.filter((h) => h.done).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;
  const longestStreak = habits.length ? Math.max(...habits.map((h) => h.longest_streak)) : 0;
  const percent = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Habits</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 btn-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center glow-green">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(145 80% 52%)" />
                  <stop offset="100%" stopColor="hsl(182 88% 60%)" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
              <motion.circle
                cx="32" cy="32" r="28" fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - percent / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{percent}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Today's Progress</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Flame className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold font-display">{bestStreak}</p>
          <p className="text-xs text-muted-foreground">Current Best</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold font-display">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>
      </motion.div>

      {/* Today's habits */}
      <motion.section variants={fadeUp} className="glass-card rounded-2xl p-6 glow-purple">
        <h2 className="font-display text-lg font-semibold mb-4">Today's Checklist</h2>
        {habits.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">No habits yet. Add one to start building consistency!</p>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMutation.mutate({ id: habit.id, done: !habit.done, streak: habit.streak })}
                className={cn(
                  "flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all duration-200",
                  habit.done
                    ? "bg-success/10 border border-success/25 shadow-[0_0_12px_hsl(var(--success)/0.12)]"
                    : "bg-secondary/35 border border-border/25 hover:border-primary/30 hover:bg-secondary/55"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  habit.done ? "border-success bg-success/20" : "border-muted-foreground/30"
                )}>
                  {habit.done && <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
                <span className="flex-1 text-sm font-medium">{habit.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {habit.streak}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Add Habit Modal */}
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
                <h2 className="font-display text-lg font-semibold">New Habit</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Habit name..."
                  className="w-full input-focus rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addMutation.mutate()}
                />
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="w-full btn-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Habit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Habits;
