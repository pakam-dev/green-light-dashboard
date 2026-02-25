import { ReportFilters } from "@/hooks/useReportFilters";
import { ReportStatsSummary } from "@/components/reports/ReportStatsSummary";
import { ReportBarChart } from "@/components/reports/ReportBarChart";
import { ReportLineChart } from "@/components/reports/ReportLineChart";
import { ReportHeatmap } from "@/components/reports/ReportHeatmap";
import {
  generateSummary,
  generatePickupsByMonth,
  generateWeeklyTrend,
  generateDailyActivity,
} from "@/lib/reportsMockData";
import { useMemo } from "react";

interface OverviewTabProps {
  filters: ReportFilters;
}

export const OverviewTab = ({ filters }: OverviewTabProps) => {
  const summary     = useMemo(() => generateSummary(filters.from, filters.to),          [filters.from, filters.to]);
  const barData     = useMemo(() => generatePickupsByMonth(filters.from, filters.to),   [filters.from, filters.to]);
  const lineData    = useMemo(() => generateWeeklyTrend(filters.from, filters.to),      [filters.from, filters.to]);
  const heatmapData = useMemo(() => generateDailyActivity(filters.from, filters.to),    [filters.from, filters.to]);

  return (
    <div className="space-y-6">
      <ReportStatsSummary summary={summary} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportBarChart data={barData} />
        <ReportLineChart data={lineData} />
      </div>
      <ReportHeatmap data={heatmapData} />
    </div>
  );
};
