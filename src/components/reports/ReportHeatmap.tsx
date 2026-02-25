import { useMemo } from "react";
import { format, getDay, addDays } from "date-fns";
import { Info } from "lucide-react";
import { HeatmapDay } from "@/lib/reportsMockData";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Show every other day label; always show Mon (1) and Thu (4)
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHOW_DAY   = [false,  true, false,  false,  true, false, false];

function intensityStyle(value: number, max: number): React.CSSProperties {
  if (max === 0 || value === 0) return { backgroundColor: "#f3f4f6" };
  const pct = value / max;
  if (pct < 0.15) return { backgroundColor: "#dcfce7" };
  if (pct < 0.35) return { backgroundColor: "#86efac" };
  if (pct < 0.55) return { backgroundColor: "#4ade80" };
  if (pct < 0.75) return { backgroundColor: "#16a34a" };
  return { backgroundColor: "#008300" };
}

interface ReportHeatmapProps {
  data: HeatmapDay[];
}

export const ReportHeatmap = ({ data }: ReportHeatmapProps) => {
  const { grid, totalWeeks, maxValue, weekStartDates } = useMemo(() => {
    if (!data.length) return { grid: [], totalWeeks: 0, maxValue: 0, weekStartDates: [] };

    const maxValue   = Math.max(...data.map((d) => d.value));
    const totalWeeks = Math.max(...data.map((d) => d.weekIndex)) + 1;

    const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: totalWeeks }, () => null)
    );
    for (const day of data) {
      grid[day.dayOfWeek][day.weekIndex] = day;
    }

    // First day of each week column
    const weekStartDates: (Date | null)[] = Array.from({ length: totalWeeks }, (_, wi) => {
      const found = data.find((d) => d.weekIndex === wi && d.dayOfWeek === 1); // Monday
      return found ? found.date : (data.find((d) => d.weekIndex === wi)?.date ?? null);
    });

    return { grid, totalWeeks, maxValue, weekStartDates };
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Daily Pickup Activity</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[260px] text-xs leading-relaxed">
              <p className="font-semibold mb-1">How to read this chart</p>
              <p>Each <strong>cell</strong> is one calendar day. <strong>Rows</strong> are days of the week (Mon–Sun). <strong>Columns</strong> are weeks, labelled by the week's start date.</p>
              <p className="mt-1">Darker green = more pickups on that day. Grey = no activity or outside the selected range.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pickup frequency across the selected period — darker = more activity
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1 pt-6">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className="h-[14px] flex items-center text-[10px] text-muted-foreground w-7 leading-none"
                style={{ visibility: SHOW_DAY[i] ? "visible" : "hidden" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex flex-col">
            {/* Week-start date labels */}
            <div className="flex gap-1 mb-1 h-5">
              {Array.from({ length: totalWeeks }, (_, wi) => {
                const showLabel = wi % 4 === 0 && weekStartDates[wi];
                const weekStart = weekStartDates[wi];
                const weekEnd   = weekStart ? addDays(weekStart, 6) : null;

                return (
                  <div key={wi} className="w-[14px] text-[9px] text-muted-foreground leading-5">
                    {showLabel && weekStart ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default underline decoration-dotted decoration-muted-foreground/50 whitespace-nowrap">
                            {format(weekStart, "MMM d")}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <p className="font-semibold">Week starting {format(weekStart, "EEE d MMM yyyy")}</p>
                          {weekEnd && (
                            <p className="text-muted-foreground">Ends {format(weekEnd, "EEE d MMM yyyy")}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : ""}
                  </div>
                );
              })}
            </div>

            {/* Cell grid */}
            <div className="flex flex-col gap-1">
              {grid.map((row, dow) => (
                <div key={dow} className="flex gap-1">
                  {row.map((cell, wi) => (
                    <Tooltip key={wi}>
                      <TooltipTrigger asChild>
                        <div
                          className="h-[14px] w-[14px] rounded-[2px] cursor-default transition-opacity hover:opacity-80"
                          style={cell ? intensityStyle(cell.value, maxValue) : { backgroundColor: "#f9fafb" }}
                        />
                      </TooltipTrigger>
                      {cell && (
                        <TooltipContent className="text-xs">
                          <p className="font-semibold">{format(cell.date, "EEEE, MMM d yyyy")}</p>
                          <p className="mt-0.5">
                            {cell.value === 0
                              ? "No pickups recorded"
                              : <><strong>{cell.value}</strong> pickup{cell.value !== 1 ? "s" : ""}</>}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-muted-foreground">
          Each cell = 1 day &nbsp;·&nbsp; Rows = Mon–Sun &nbsp;·&nbsp; Column labels = week start date
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-1">Less active</span>
          {["#f3f4f6", "#dcfce7", "#86efac", "#4ade80", "#16a34a", "#008300"].map((bg) => (
            <div key={bg} className="h-[12px] w-[12px] rounded-[2px]" style={{ backgroundColor: bg }} />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">More active</span>
        </div>
      </div>
    </div>
  );
};
