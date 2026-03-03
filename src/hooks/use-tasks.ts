import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getTodayStr = () => new Date().toISOString().split("T")[0];

/**
 * Fetches tasks and automatically resets any task that was marked done
 * before today back to undone — so tasks recur every day.
 */
export const useTasks = () => {
    return useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;

            // Daily reset: compare using local midnight to handle timezones correctly
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            const toReset = data.filter((t) => {
                if (!t.done) return false;
                const taskDate = new Date(t.updated_at);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate < todayMidnight;
            });

            if (toReset.length > 0) {
                const ids = toReset.map((t) => t.id);
                await supabase.from("tasks").update({ done: false }).in("id", ids);
                // Return locally updated data so UI reflects the reset instantly
                return data.map((t) =>
                    ids.includes(t.id) ? { ...t, done: false } : t
                );
            }

            return data;
        },
    });
};

/**
 * Write a task_log entry for today — called when user toggles a task.
 * Uses upsert so there's always exactly one row per task per day.
 */
export const logTaskCompletion = async (
    taskId: string,
    userId: string,
    done: boolean
) => {
    await supabase.from("task_logs").upsert(
        { task_id: taskId, user_id: userId, date: getTodayStr(), done },
        { onConflict: "task_id,date" }
    );
};
