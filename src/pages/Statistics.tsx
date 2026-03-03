import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Zap, Award, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{payload[0].value}</p>
    </div>
  );
};

const Statistics = () => {
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (tasksLoading || habitsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Tasks created per day of week (based on created_at)
  const weeklyTasks = DAYS.map((day, index) => ({
    day,
    tasks: tasks.filter((t) => new Date(t.created_at).getDay() === index).length,
  }));

  // Habit streaks: top 7 by streak
  const habitStreaks = habits
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 7)
    .map((h) => ({
      name: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
      streak: h.streak,
    }));

  // Summary stats
  const totalDone = tasks.filter((t) => t.done).length;
  const bestLongestStreak = habits.length ? Math.max(...habits.map((h) => h.longest_streak)) : 0;
  const completedHabits = habits.filter((h) => h.done).length;
  const mostConsistentHabit = habits.length
    ? habits.reduce((a, b) => (a.streak > b.streak ? a : b))
    : null;
  const mostProductiveDay = weeklyTasks.reduce(
    (a, b) => (a.tasks >= b.tasks ? a : b),
    weeklyTasks[0]
  );

  // Real insights from data
  const insights = [
    {
      icon: Calendar,
      text: tasks.length > 0 && mostProductiveDay.tasks > 0
        ? `Most tasks added on ${mostProductiveDay.day} this week`
        : "Add tasks to discover your most productive day",
      color: "text-accent",
    },
    {
      icon: Zap,
      text: mostConsistentHabit
        ? `"${mostConsistentHabit.name}" is your top habit with a ${mostConsistentHabit.streak}-day streak 🔥`
        : "Add habits to track your consistency",
      color: "text-success",
    },
    {
      icon: TrendingUp,
      text: tasks.length > 0
        ? `${totalDone} of ${tasks.length} tasks completed (${Math.round((totalDone / tasks.length) * 100)}%)`
        : "Start adding tasks to see your completion rate",
      color: "text-primary",
    },
    {
      icon: Award,
      text: bestLongestStreak > 0
        ? `Your longest ever habit streak is ${bestLongestStreak} day${bestLongestStreak !== 1 ? "s" : ""} 🏆`
        : "Start building habit streaks!",
      color: "text-glow-purple",
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.h1 variants={fadeUp} className="font-display text-3xl font-bold">Statistics</motion.h1>

      {/* Summary stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length },
          { label: "Completed", value: totalDone },
          { label: "Habits Today", value: `${completedHabits}/${habits.length}` },
          { label: "Best Streak", value: `${bestLongestStreak}d` },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks per day of week */}
        <motion.div variants={fadeUp} className="glass rounded-xl p-6 glow-purple">
          <h2 className="font-display text-lg font-semibold mb-4">Tasks by Day of Week</h2>
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 text-sm">
              No tasks yet — add some to see stats!
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTasks}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 15% 18%)" />
                <XAxis dataKey="day" tick={{ fill: "hsl(237 10% 70%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(237 10% 70%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasks" fill="hsl(255 60% 68%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Habit streaks */}
        <motion.div variants={fadeUp} className="glass rounded-xl p-6 glow-blue">
          <h2 className="font-display text-lg font-semibold mb-4">Habit Streaks</h2>
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 text-sm">
              No habits yet — add some to track streaks!
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitStreaks}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228 15% 18%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(237 10% 70%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(237 10% 70%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="streak" fill="hsl(210 80% 62%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div variants={fadeUp} className="glass rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/30"
            >
              <insight.icon className={`w-5 h-5 shrink-0 ${insight.color}`} />
              <span className="text-sm">{insight.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Statistics;
