import { ReportFilters } from "@/hooks/useReportFilters";
import { ReportStatsSummary } from "@/components/reports/ReportStatsSummary";
import { ReportBarChart } from "@/components/reports/ReportBarChart";
import { ReportLineChart } from "@/components/reports/ReportLineChart";
import { ReportHeatmap } from "@/components/reports/ReportHeatmap";
import { ReportSummary, PickupBarData, TrendPoint } from "@/lib/reportsMockData";
import {
  useGetReportSummaryQuery,
  useGetPickupsByPeriodQuery,
  useGetWasteTrendQuery,
} from "@/store/api/reportsApi";

interface OverviewTabProps {
  filters: ReportFilters;
}

export const OverviewTab = ({ filters }: OverviewTabProps) => {
  const { data: summaryRes } = useGetReportSummaryQuery(filters);
  const { data: pickupsRes } = useGetPickupsByPeriodQuery(filters);
  const { data: wasteRes   } = useGetWasteTrendQuery(filters);

  const summary: ReportSummary = {
    totalPickups:    summaryRes?.totalPickups ?? 0,
    totalWasteKg:    summaryRes?.totalWaste   ?? 0,
    activeUsers:     summaryRes?.totalUsers   ?? 0,
    completionRate:  summaryRes?.totalPickups
      ? (summaryRes.completedPickups / summaryRes.totalPickups) * 100
      : 0,
    pickupsDelta:    0,
    wasteDelta:      0,
    usersDelta:      0,
    completionDelta: 0,
  };

  const barData: PickupBarData[] = (pickupsRes?.data ?? []).map((r: any) => ({
    month:     r.period,
    completed: r.completed,
    missed:    r.cancelled,
    pending:   r.pending,
  }));

  const lineData: TrendPoint[] = (wasteRes?.data ?? []).map((r: any) => ({
    week:     r.period,
    wasteKg:  r.wasteKg,
    newUsers: 0,
  }));

  return (
    <div className="space-y-6">
      <ReportStatsSummary summary={summary} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportBarChart data={barData} />
        <ReportLineChart data={lineData} />
      </div>
      <ReportHeatmap data={[]} />
    </div>
  );
};
