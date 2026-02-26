import { DollarSign, TrendingUp, Zap, BarChart2 } from "lucide-react";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportFilters } from "@/hooks/useReportFilters";
import { RevenueAreaChart } from "@/components/reports/RevenueAreaChart";
import { MoMRevenueChart } from "@/components/reports/MoMRevenueChart";
import { RevenuePoint, MoMRevenuePoint } from "@/lib/reportsMockData";
import {
  useGetRevenueSummaryQuery,
  useGetRevenueWeeklyTrendQuery,
  useGetMonthOnMonthQuery,
  useGetReportSummaryQuery,
} from "@/store/api/reportsApi";

function formatNaira(v: number): string {
  if (v >= 1_000_000_000) return `₦${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000)     return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `₦${(v / 1_000).toFixed(0)}k`;
  return `₦${v}`;
}

interface RevenueKpiCardProps {
  label: string;
  value: string;
  delta: number;
  icon: React.ElementType;
  iconBg: string;
}

const RevenueKpiCard = ({ label, value, delta, icon: Icon, iconBg }: RevenueKpiCardProps) => {
  const positive = delta >= 0;
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", positive ? "text-green-600" : "text-destructive")}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {positive ? "+" : ""}{delta}% vs prior period
      </div>
    </div>
  );
};

interface RevenueTabProps {
  filters: ReportFilters;
}

export const RevenueTab = ({ filters }: RevenueTabProps) => {
  const { data: revSummaryRes } = useGetRevenueSummaryQuery(filters);
  const { data: weeklyRes     } = useGetRevenueWeeklyTrendQuery(filters);
  const { data: momRes        } = useGetMonthOnMonthQuery(filters);
  const { data: overviewRes   } = useGetReportSummaryQuery(filters);

  const weeklyData: RevenuePoint[] = (weeklyRes?.data ?? []).map((r: any) => ({
    week:    r.week,
    revenue: (r.schedules ?? 0) + (r.loans ?? 0) + (r.instantBuy ?? 0),
  }));

  const momData: MoMRevenuePoint[] = (momRes?.data ?? []).map((r: any) => ({
    month:    r.metric,
    current:  r.current,
    previous: r.previous,
  }));

  const totalRevenue = revSummaryRes?.totalRevenue ?? 0;
  const growth       = revSummaryRes?.growth       ?? 0;
  const totalPickups = overviewRes?.totalPickups    ?? 0;
  const totalWaste   = overviewRes?.totalWaste      ?? 0;

  const summary = {
    totalRevenue,
    totalRevenueDelta:  growth,
    revenuePerPickup:   totalPickups > 0 ? Math.round(totalRevenue / totalPickups) : 0,
    perPickupDelta:     0,
    revenuePerKg:       totalWaste   > 0 ? Math.round(totalRevenue / totalWaste)   : 0,
    perKgDelta:         0,
    revenueGrowth:      growth,
    growthDelta:        0,
  };

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueKpiCard
          label="Total Revenue"
          value={formatNaira(summary.totalRevenue)}
          delta={summary.totalRevenueDelta}
          icon={DollarSign}
          iconBg="bg-primary"
        />
        <RevenueKpiCard
          label="Revenue / Pickup"
          value={formatNaira(summary.revenuePerPickup)}
          delta={summary.perPickupDelta}
          icon={Zap}
          iconBg="bg-amber-500"
        />
        <RevenueKpiCard
          label="Revenue / kg"
          value={`₦${summary.revenuePerKg}`}
          delta={summary.perKgDelta}
          icon={BarChart2}
          iconBg="bg-blue-500"
        />
        <RevenueKpiCard
          label="Revenue Growth"
          value={`${summary.revenueGrowth}%`}
          delta={summary.growthDelta}
          icon={TrendingUp}
          iconBg="bg-violet-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueAreaChart data={weeklyData} />
        <MoMRevenueChart data={momData} />
      </div>
    </div>
  );
};
