import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Award, AlertCircle, Flame, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { subDays, format } from "date-fns";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// Get all days in the current month up to today
const getDaysInMonth = () => {
    const days: string[] = [];
    const d = new Date(currentYear, currentMonth, 1);
    while (d <= today && d.getMonth() === currentMonth) {
        days.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
    }
    return days;
};

const MONTH_LABEL = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const Reports = () => {
    const { user } = useAuth();
    const days = useMemo(() => getDaysInMonth(), []);

    const { data: tasks = [], isLoading: tl } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data, error } = await supabase.from("tasks").select("*").order("created_at");
            if (error) throw error;
            return data;
        },
    });

    const { data: habits = [], isLoading: hl } = useQuery({
        queryKey: ["habits"],
        queryFn: async () => {
            const { data, error } = await supabase.from("habits").select("*").order("created_at");
            if (error) throw error;
            return data;
        },
    });

    const { data: taskLogs = [], isLoading: tll } = useQuery({
        queryKey: ["task_logs", currentYear, currentMonth],
        queryFn: async () => {
            const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
            const endDate = today.toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("task_logs")
                .select("*")
                .gte("date", startDate)
                .lte("date", endDate);
            if (error) throw error;
            return data;
        },
    });

    const { data: habitLogs = [], isLoading: hll } = useQuery({
        queryKey: ["habit_logs_90d"],
        queryFn: async () => {
            // Fetch 90 days for heatmap; current month for the report stats
            const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
            const endDate = today.toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("habit_logs")
                .select("*")
                .gte("date", since)
                .lte("date", endDate);
            if (error) throw error;
            return data;
        },
    });

    // Filter current-month logs for report stats
    const currentMonthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const habitLogsThisMonth = habitLogs.filter((l) => l.date >= currentMonthStart);

    // Aggregate 90-day logs for heatmap (count habits done per day)
    const heatmapData = useMemo(() => {
        const map = new Map<string, number>();
        for (const log of habitLogs.filter(l => l.done)) {
            map.set(log.date, (map.get(log.date) ?? 0) + 1);
        }
        return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    }, [habitLogs]);

    if (tl || hl || tll || hll) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const totalItems = tasks.length + habits.length;
    const totalSlots = days.length * totalItems;

    // Per-task stats
    const taskStats = tasks.map((task) => {
        const logs = taskLogs.filter((l) => l.task_id === task.id);
        const doneCount = logs.filter((l) => l.done).length;
        const missedCount = days.length - doneCount;
        const rate = days.length > 0 ? Math.round((doneCount / days.length) * 100) : 0;
        return { ...task, doneCount, missedCount, rate, logs };
    });

    // Per-habit stats (current month)
    const habitStats = habits.map((habit) => {
        const logs = habitLogsThisMonth.filter((l) => l.habit_id === habit.id);
        const doneCount = logs.filter((l) => l.done).length;
        const missedCount = days.length - doneCount;
        const rate = days.length > 0 ? Math.round((doneCount / days.length) * 100) : 0;
        return { ...habit, doneCount, missedCount, rate, logs };
    });

    // Overall stats
    const totalDone = [...taskStats, ...habitStats].reduce((a, s) => a + s.doneCount, 0);
    const overallRate = totalSlots > 0 ? Math.round((totalDone / totalSlots) * 100) : 0;

    // Pros (>= 80%) and Cons (< 50%)
    const allStats = [...taskStats, ...habitStats];
    const pros = allStats.filter((s) => s.rate >= 80).sort((a, b) => b.rate - a.rate);
    const cons = allStats.filter((s) => s.rate < 50).sort((a, b) => a.rate - b.rate);
    const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longest_streak)) : 0;

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">Monthly Report</h1>
                    <p className="text-muted-foreground text-sm mt-1">{MONTH_LABEL} — {days.length} days tracked</p>
                </div>
                <div className="glass rounded-none px-6 py-3 text-center glow-purple">
                    <p className="text-3xl font-bold font-display text-gradient-purple">{overallRate}%</p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
            </motion.div>

            {/* Summary cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Days Tracked", value: days.length, icon: CheckCircle2, color: "text-primary" },
                    { label: "Total Done", value: totalDone, icon: TrendingUp, color: "text-success" },
                    { label: "Total Missed", value: totalSlots - totalDone, icon: XCircle, color: "text-destructive" },
                    { label: "Best Streak", value: `${bestStreak}d`, icon: Flame, color: "text-accent" },
                ].map((s) => (
                    <div key={s.label} className="glass rounded-none p-4">
                        <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                        <p className="text-2xl font-bold font-display">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Pros and Cons */}
            {(pros.length > 0 || cons.length > 0) && (
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pros.length > 0 && (
                        <div className="glass rounded-none p-5 border border-success/20">
                            <h2 className="font-display text-base font-semibold flex items-center gap-2 mb-3 text-success">
                                <Award className="w-4 h-4" /> You're Crushing It 💪
                            </h2>
                            <div className="space-y-2">
                                {pros.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm">
                                        <span className="text-foreground">{("title" in p ? p.title : p.name) as string}</span>
                                        <span className="text-success font-medium">{p.rate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {cons.length > 0 && (
                        <div className="glass rounded-none p-5 border border-destructive/20">
                            <h2 className="font-display text-base font-semibold flex items-center gap-2 mb-3 text-destructive">
                                <AlertCircle className="w-4 h-4" /> Needs Attention ⚠️
                            </h2>
                            <div className="space-y-2">
                                {cons.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm">
                                        <span className="text-foreground">{("title" in p ? p.title : p.name) as string}</span>
                                        <span className="text-destructive font-medium">{p.rate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Task calendar grid */}
            {taskStats.length > 0 && (
                <motion.div variants={fadeUp} className="glass rounded-none p-6">
                    <h2 className="font-display text-lg font-semibold mb-4">Tasks — Daily Checklist</h2>
                    <CalendarGrid items={taskStats} days={days} keyField="task_id" />
                </motion.div>
            )}

            {/* Habit heatmap */}
            {habits.length > 0 && (
                <motion.div variants={fadeUp} className="glass rounded-none p-6">
                    <h2 className="font-display text-lg font-semibold mb-4">Habits — Consistency Heatmap</h2>
                    <HabitHeatmap data={heatmapData} totalHabits={habits.length} />
                </motion.div>
            )}

            {tasks.length === 0 && habits.length === 0 && (
                <motion.div variants={fadeUp} className="glass rounded-none p-12 text-center">
                    <p className="text-muted-foreground">No data yet — add tasks and habits to start tracking!</p>
                </motion.div>
            )}
        </motion.div>
    );
};

// Calendar grid component: rows = items, columns = days
const CalendarGrid = ({
    items,
    days,
    keyField,
}: {
    items: any[];
    days: string[];
    keyField: "task_id" | "habit_id";
}) => {
    const shortDays = days.map((d) => new Date(d + "T12:00:00").getDate());

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr>
                        <th className="text-left text-muted-foreground font-medium py-2 pr-4 min-w-[120px]">Name</th>
                        {shortDays.map((d, i) => (
                            <th key={i} className="text-center text-muted-foreground font-medium py-2 px-1 w-7">{d}</th>
                        ))}
                        <th className="text-center text-muted-foreground font-medium py-2 px-2">Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-t border-border/20">
                            <td className="py-2 pr-4 text-sm font-medium truncate max-w-[140px]">
                                {item.title ?? item.name}
                            </td>
                            {days.map((day) => {
                                const log = item.logs?.find((l: any) => l.date === day);
                                const done = log?.done ?? false;
                                const isToday = day === new Date().toISOString().split("T")[0];
                                return (
                                    <td key={day} className="text-center py-2 px-1">
                                        <div className={cn(
                                            "w-5 h-5 rounded-md mx-auto flex items-center justify-center",
                                            done ? "bg-success/20 border border-success/40" : "bg-secondary/40 border border-border/20",
                                            isToday && "ring-1 ring-primary/50"
                                        )}>
                                            {done
                                                ? <CheckCircle2 className="w-3 h-3 text-success" />
                                                : <XCircle className="w-3 h-3 text-muted-foreground/30" />}
                                        </div>
                                    </td>
                                );
                            })}
                            <td className="text-center py-2 px-2">
                                <span className={cn("font-bold", item.rate >= 80 ? "text-success" : item.rate >= 50 ? "text-accent" : "text-destructive")}>
                                    {item.rate}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reports;
