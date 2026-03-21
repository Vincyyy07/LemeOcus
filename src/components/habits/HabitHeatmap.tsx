import { subDays, format, eachDayOfInterval } from "date-fns";

interface Props {
  data: { date: string; count: number }[];
  totalHabits: number;
}

const getColor = (count: number, total: number) => {
  if (!count || !total) return "heatmap-empty";
  const r = count / total;
  if (r >= 1)    return "heatmap-4";
  if (r >= 0.66) return "heatmap-3";
  if (r >= 0.33) return "heatmap-2";
  return "heatmap-1";
};

export const HabitHeatmap = ({ data, totalHabits }: Props) => {
  const today = new Date();
  // Build last 30 days as an ordered array
  const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const countMap = new Map(data.map((d) => [d.date, d.count]));

  const activeDays = data.filter((d) => d.count > 0).length;
  const consistency = Math.round((activeDays / 30) * 100);

  return (
    <div className="space-y-2">
      {/* Grid: 30 cells, 10 per row */}
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = countMap.get(key) ?? 0;
          const cls = getColor(count, totalHabits);
          const label = `${format(day, "MMM d")} — ${count} habit${count !== 1 ? "s" : ""} done`;
          return (
            <div
              key={key}
              title={label}
              className={`w-4 h-4 rounded-[3px] cursor-default transition-all duration-150 hover:ring-1 hover:ring-primary/60 ${cls}`}
            />
          );
        })}
      </div>

      {/* Compact footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{format(subDays(today, 29), "MMM d")} – {format(today, "MMM d")}</span>
        <div className="flex items-center gap-2">
          <span>{activeDays} active days</span>
          <span>·</span>
          <span>{consistency}% consistent</span>
          {/* Legend dots */}
          <div className="flex items-center gap-0.5 ml-1">
            {(["heatmap-empty","heatmap-1","heatmap-2","heatmap-3","heatmap-4"] as const).map((c) => (
              <div key={c} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
