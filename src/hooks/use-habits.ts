import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches habits and automatically resets any habit that was marked done
 * before today back to undone — so habits must be completed every day.
 * If a habit was missed yesterday, its streak should probably reset,
 * but for now this just resets the `done` status.
 */
export const useHabits = () => {
    return useQuery({
        queryKey: ["habits"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("habits")
                .select("*")
                .order("created_at", { ascending: true });
            if (error) throw error;

            // Daily reset: compare using local midnight to handle timezones correctly
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            const toReset = data.filter((h) => {
                if (!h.done) return false;

                // We use updated_at to check when it was last marked done
                const habitDate = new Date(h.updated_at);
                habitDate.setHours(0, 0, 0, 0);

                return habitDate < todayMidnight;
            });

            if (toReset.length > 0) {
                const ids = toReset.map((h) => h.id);

                // Reset the 'done' status for today
                // Note: We might also want to reset the streak to 0 here if it's been > 48 hours,
                // but for simple daily reset, we just toggle `done` back to false
                await supabase.from("habits").update({ done: false }).in("id", ids);

                // Return locally updated data so UI reflects the reset instantly
                return data.map((h) =>
                    ids.includes(h.id) ? { ...h, done: false } : h
                );
            }

            return data;
        },
    });
};
