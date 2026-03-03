import { motion } from "framer-motion";
import { Sparkles, Flame, CheckCircle2, Target, TrendingUp, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTasks } from "@/hooks/use-tasks";

const quotes = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Focus on being productive instead of busy.",
  "Your only limit is your mind.",
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const todayDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const priorityColors: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-success",
};

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const quote = quotes[new Date().getDate() % quotes.length];

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const isLoading = tasksLoading || habitsLoading;

  // Focus tasks: top 5 incomplete tasks sorted by priority
  const focusTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
    .slice(0, 5);

  const completedTasks = tasks.filter((t) => t.done).length;
  const completedHabits = habits.filter((h) => h.done).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;
  const taskPercent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const habitPercent = habits.length ? Math.round((completedHabits / habits.length) * 100) : 0;
  const productivityPercent = Math.round((taskPercent + habitPercent) / 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      {/* Greeting */}
      <motion.section variants={fadeUp}>
        <p className="text-muted-foreground text-sm">{todayDate}</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">
          {getGreeting()}, <span className="text-gradient-purple">Explorer</span>
        </h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {quote}
        </p>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Tasks */}
        <motion.section variants={fadeUp} className="lg:col-span-2 glass rounded-xl p-6 glow-purple">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Focus Tasks
            </h2>
            <button className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors">
              <Play className="w-4 h-4" /> Focus Mode
            </button>
          </div>
          <div className="space-y-3">
            {focusTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                {tasks.length === 0
                  ? "No tasks yet — add some in the Tasks tab! 📝"
                  : "All tasks done! You're crushing it 🎉"}
              </p>
            ) : (
              focusTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-colors",
                    task.done ? "bg-secondary/30" : "bg-secondary/50 hover:bg-secondary/70"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.done ? "border-success bg-success/20" : "border-muted-foreground/40"
                    )}
                  >
                    {task.done && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <span className={cn("flex-1 text-sm", task.done && "line-through text-muted-foreground")}>
                    {task.title}
                  </span>
                  <span className={cn("w-2 h-2 rounded-full", priorityColors[task.priority])} />
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Daily Summary */}
        <motion.section variants={fadeUp} className="glass rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-accent" /> Daily Summary
          </h2>
          <div className="space-y-4">
            <SummaryItem
              label="Tasks Done"
              value={`${completedTasks}/${tasks.length}`}
              percent={taskPercent}
              color="primary"
            />
            <SummaryItem
              label="Habits Done"
              value={`${completedHabits}/${habits.length}`}
              percent={habitPercent}
              color="success"
            />
            <SummaryItem
              label="Productivity"
              value={`${productivityPercent}%`}
              percent={productivityPercent}
              color="accent"
            />
          </div>
        </motion.section>
      </div>

      {/* Habit Overview */}
      <motion.section variants={fadeUp} className="glass rounded-xl p-6 glow-blue">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <RepeatIcon className="w-5 h-5 text-accent" /> Today's Habits
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-destructive" />
            <span>Best streak: {bestStreak} day{bestStreak !== 1 ? "s" : ""}</span>
          </div>
        </div>
        {habits.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            No habits yet — add some in the Habits tab! 🔥
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                    habit.done
                      ? "bg-success/10 border border-success/20"
                      : "bg-secondary/40 border border-border/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      habit.done ? "border-success bg-success/20" : "border-muted-foreground/30"
                    )}
                  >
                    {habit.done && <CheckCircle2 className="w-5 h-5 text-success" />}
                  </div>
                  <span className="text-xs font-medium text-center">{habit.name}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {habit.streak}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span>{completedHabits}/{habits.length}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${habitPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </>
        )}
      </motion.section>
    </motion.div>
  );
};

const RepeatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const SummaryItem = ({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        className={cn("h-full rounded-full", {
          "bg-primary": color === "primary",
          "bg-success": color === "success",
          "bg-accent": color === "accent",
        })}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      />
    </div>
  </div>
);

export default Dashboard;
