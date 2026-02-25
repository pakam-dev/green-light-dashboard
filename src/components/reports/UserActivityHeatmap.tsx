import { useMemo, useState } from "react";
import { eachWeekOfInterval, format, addDays } from "date-fns";
import { Info, Search, X } from "lucide-react";
import { UserActivityRow } from "@/lib/reportsMockData";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function cellStyle(value: number, max: number): React.CSSProperties {
  if (max === 0 || value === 0) return { backgroundColor: "#f3f4f6" };
  const pct = value / max;
  if (pct < 0.2) return { backgroundColor: "#dcfce7" };
  if (pct < 0.4) return { backgroundColor: "#86efac" };
  if (pct < 0.6) return { backgroundColor: "#4ade80" };
  if (pct < 0.8) return { backgroundColor: "#16a34a" };
  return { backgroundColor: "#008300" };
}

/** Highlight the matching portion of a name string */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-foreground rounded-[2px] px-0">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface UserActivityHeatmapProps {
  data: UserActivityRow[];
  from: Date;
  to: Date;
}

export const UserActivityHeatmap = ({ data, from, to }: UserActivityHeatmapProps) => {
  const [query, setQuery] = useState("");

  const weeks = useMemo(
    () => eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 }),
    [from, to]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.userName.toLowerCase().includes(q));
  }, [data, query]);

  const hasQuery   = query.trim().length > 0;
  const noResults  = hasQuery && filtered.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      {/* Header row: title + info icon + search */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">User Activity Heatmap</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[260px] text-xs leading-relaxed">
                <p className="font-semibold mb-1">How to read this chart</p>
                <p>Each <strong>row</strong> is a user. Each <strong>column</strong> is one week. The <strong>colour</strong> of a cell shows how many pickups that user made that week — darker green means more activity.</p>
                <p className="mt-1">Column labels show the <strong>week starting date</strong> (e.g. "Jan 26" = the week that begins on January 26).</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Weekly pickup activity for the top 15 most active users
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search user…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {hasQuery && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Result count when searching */}
      {hasQuery && !noResults && (
        <p className="mb-3 text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {data.length} users matching <span className="font-semibold text-foreground">"{query.trim()}"</span>
        </p>
      )}

      {/* Key */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] bg-muted-foreground/20 border border-border" />
          0 pickups
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "#86efac" }} />
          Low activity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "#4ade80" }} />
          Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: "#008300" }} />
          High activity
        </span>
        <span className="text-muted-foreground/70 italic">Colour is relative to each user's own max</span>
      </div>

      {/* Empty state */}
      {noResults ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground">
            No results for <span className="font-semibold">"{query.trim()}"</span>.{" "}
            <button onClick={() => setQuery("")} className="text-primary underline hover:no-underline">
              Clear search
            </button>
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate" style={{ borderSpacing: "3px" }}>
            <thead>
              <tr>
                <th className="text-left text-muted-foreground font-medium pb-2 pr-4 w-36">
                  User
                  {hasQuery && (
                    <span className="ml-1.5 font-normal text-muted-foreground/60">({filtered.length})</span>
                  )}
                </th>
                {weeks.map((w, i) => {
                  const weekEnd = addDays(w, 6);
                  return (
                    <th key={i} className="text-center text-muted-foreground font-normal pb-2 min-w-[28px]">
                      {i % 2 === 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default underline decoration-dotted decoration-muted-foreground/50">
                              {format(w, "MMM d")}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            <p className="font-semibold">Week of {format(w, "MMM d, yyyy")}</p>
                            <p className="text-muted-foreground">
                              {format(w, "EEE d MMM")} – {format(weekEnd, "EEE d MMM yyyy")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : ""}
                    </th>
                  );
                })}
                <th className="text-right text-muted-foreground font-medium pb-2 pl-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const rowMax = Math.max(...row.weeks, 1);
                return (
                  <tr key={row.userId} className="group">
                    <td className="pr-4 py-0.5 font-medium text-foreground truncate max-w-[140px]">
                      <HighlightMatch text={row.userName} query={query.trim()} />
                    </td>
                    {row.weeks.map((val, wi) => {
                      const weekStart = weeks[wi];
                      const weekEnd   = weekStart ? addDays(weekStart, 6) : null;
                      return (
                        <td key={wi} className="py-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="h-[22px] w-[22px] rounded-[3px] mx-auto cursor-default transition-opacity hover:opacity-75"
                                style={cellStyle(val, rowMax)}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              <p className="font-semibold">{row.userName}</p>
                              {weekStart && weekEnd && (
                                <p className="text-muted-foreground">
                                  {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
                                </p>
                              )}
                              <p className="mt-0.5">
                                {val === 0
                                  ? "No pickups this week"
                                  : <><strong>{val}</strong> pickup{val !== 1 ? "s" : ""} this week</>}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="pl-3 py-0.5 text-right font-semibold text-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">{row.total}</span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {row.total} total pickups across all weeks
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
