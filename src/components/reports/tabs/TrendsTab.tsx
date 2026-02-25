import { useMemo } from "react";
import { ReportFilters } from "@/hooks/useReportFilters";
import { PickupFrequencyChart } from "@/components/reports/PickupFrequencyChart";
import { MoMComparisonTable } from "@/components/reports/MoMComparisonTable";
import { generatePickupFrequency, generateMoMComparison } from "@/lib/reportsMockData";
import { differenceInDays, format } from "date-fns";

interface TrendsTabProps {
  filters: ReportFilters;
}

export const TrendsTab = ({ filters }: TrendsTabProps) => {
  const frequencyData = useMemo(() => generatePickupFrequency(filters.from, filters.to),  [filters.from, filters.to]);
  const momData       = useMemo(() => generateMoMComparison(filters.from, filters.to),    [filters.from, filters.to]);

  const days = differenceInDays(filters.to, filters.from) + 1;
  const priorFrom = new Date(filters.from);
  priorFrom.setDate(priorFrom.getDate() - days);
  const priorTo = new Date(filters.from);
  priorTo.setDate(priorTo.getDate() - 1);

  return (
    <div className="space-y-6">
      {/* Period context banner */}
      <div className="bg-muted/40 rounded-xl border border-border px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-foreground font-medium">Current:</span>
          <span className="text-muted-foreground">
            {format(filters.from, "MMM d")} – {format(filters.to, "MMM d, yyyy")} ({days} days)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          <span className="text-foreground font-medium">Prior:</span>
          <span className="text-muted-foreground">
            {format(priorFrom, "MMM d")} – {format(priorTo, "MMM d, yyyy")} ({days} days)
          </span>
        </div>
      </div>

      {/* Frequency chart — full width */}
      <PickupFrequencyChart data={frequencyData} />

      {/* MoM table — full width */}
      <MoMComparisonTable data={momData} />
    </div>
  );
};
