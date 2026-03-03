import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, X, CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const PRIORITY_OPTIONS = ["high", "medium", "low"] as const;
const CATEGORY_OPTIONS = ["work", "study", "health"] as const;

type Priority = typeof PRIORITY_OPTIONS[number];
type Category = typeof CATEGORY_OPTIONS[number];

interface TaskDraft { title: string; priority: Priority; category: Category }
interface HabitDraft { name: string }

const priorityColor: Record<Priority, string> = {
    high: "bg-destructive/20 text-destructive border-destructive/30",
    medium: "bg-accent/20 text-accent border-accent/30",
    low: "bg-success/20 text-success border-success/30",
};

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [saving, setSaving] = useState(false);

    // Tasks
    const [tasks, setTasks] = useState<TaskDraft[]>([]);
    const [taskInput, setTaskInput] = useState("");
    const [taskPriority, setTaskPriority] = useState<Priority>("medium");
    const [taskCategory, setTaskCategory] = useState<Category>("work");

    // Habits
    const [habits, setHabits] = useState<HabitDraft[]>([]);
    const [habitInput, setHabitInput] = useState("");

    const addTask = () => {
        if (!taskInput.trim()) return;
        setTasks((prev) => [...prev, { title: taskInput.trim(), priority: taskPriority, category: taskCategory }]);
        setTaskInput("");
    };

    const addHabit = () => {
        if (!habitInput.trim()) return;
        setHabits((prev) => [...prev, { name: habitInput.trim() }]);
        setHabitInput("");
    };

    const saveAndGo = async () => {
        if (!user) return;
        setSaving(true);
        try {
            if (tasks.length > 0) {
                const { error } = await supabase.from("tasks").insert(
                    tasks.map((t) => ({ ...t, user_id: user.id }))
                );
                if (error) throw error;
            }
            if (habits.length > 0) {
                const { error } = await supabase.from("habits").insert(
                    habits.map((h) => ({ name: h.name, user_id: user.id }))
                );
                if (error) throw error;
            }
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10 -top-24 -right-24"
                style={{ background: "hsl(var(--glow-purple) / 0.3)" }}
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="w-full max-w-2xl glass-strong rounded-2xl p-8 glow-purple relative z-10"
            >
                {/* Header */}
                <motion.div variants={fadeUp} className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center glow-purple mx-auto mb-4">
                        <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="font-display text-3xl font-bold">
                        Welcome to <span className="text-gradient-purple">LemeOcus</span> 🎯
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Set up your daily routine — tasks and habits you want to crush every single day.
                    </p>
                </motion.div>

                {/* Step indicator */}
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8 justify-center">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <button
                                onClick={() => setStep(s as 1 | 2)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s
                                        ? "bg-primary text-primary-foreground glow-purple"
                                        : step > s
                                            ? "bg-success/20 text-success border border-success/30"
                                            : "bg-secondary/50 text-muted-foreground"
                                    }`}
                            >
                                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                            </button>
                            <span className={`text-sm ${step === s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                {s === 1 ? "Daily Tasks" : "Daily Habits"}
                            </span>
                            {s < 2 && <div className="w-8 h-px bg-border/50" />}
                        </div>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                Add tasks you want to complete daily. These will reset every morning.
                            </p>

                            {/* Task input */}
                            <div className="flex gap-2">
                                <input
                                    value={taskInput}
                                    onChange={(e) => setTaskInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                                    placeholder="e.g. Review notes, Morning run..."
                                    className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                                    autoFocus
                                />
                                <button
                                    onClick={addTask}
                                    className="bg-primary/10 text-primary px-3 py-2.5 rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {PRIORITY_OPTIONS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setTaskPriority(p)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${taskPriority === p ? priorityColor[p] : "bg-secondary/30 text-muted-foreground border-border/30"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <div className="w-px bg-border/30" />
                                {CATEGORY_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setTaskCategory(c)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${taskCategory === c
                                                ? "bg-primary/20 text-primary border-primary/30"
                                                : "bg-secondary/30 text-muted-foreground border-border/30"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {/* Task list */}
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                <AnimatePresence>
                                    {tasks.map((t, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30"
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-accent" : "bg-success"
                                                }`} />
                                            <span className="flex-1 text-sm">{t.title}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{t.category}</span>
                                            <button onClick={() => setTasks(tasks.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {tasks.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No tasks yet — add one above!</p>
                                )}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                Next: Add Habits <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="habits"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                Add habits to track daily. Streaks build automatically as you check them off.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    value={habitInput}
                                    onChange={(e) => setHabitInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addHabit()}
                                    placeholder="e.g. Meditate, Exercise, Read 20 pages..."
                                    className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                                    autoFocus
                                />
                                <button
                                    onClick={addHabit}
                                    className="bg-primary/10 text-primary px-3 py-2.5 rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                <AnimatePresence>
                                    {habits.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30"
                                        >
                                            <div className="w-5 h-5 rounded-full border-2 border-primary/40 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary/60" />
                                            </div>
                                            <span className="flex-1 text-sm">{h.name}</span>
                                            <button onClick={() => setHabits(habits.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {habits.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No habits yet — add one above!</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-secondary/50 text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={saveAndGo}
                                    disabled={saving || (tasks.length === 0 && habits.length === 0)}
                                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 glow-purple"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {saving ? "Saving..." : "Let me focus! 🎯"}
                                </button>
                            </div>
                            {tasks.length === 0 && habits.length === 0 && (
                                <button
                                    onClick={() => navigate("/dashboard", { replace: true })}
                                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip for now →
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Onboarding;
