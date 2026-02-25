import { useMemo } from "react";
import { Users, UserPlus, RefreshCw, Activity } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportFilters } from "@/hooks/useReportFilters";
import { UserActivityHeatmap } from "@/components/reports/UserActivityHeatmap";
import { UserGrowthChart } from "@/components/reports/UserGrowthChart";
import {
  generateUserActivityHeatmap,
  generateUserGrowth,
  generateUsersSummary,
} from "@/lib/reportsMockData";

interface UsersTabProps {
  filters: ReportFilters;
}

interface UserKpiCardProps {
  label: string;
  value: string;
  delta: number;
  icon: React.ElementType;
  iconBg: string;
}

const UserKpiCard = ({ label, value, delta, icon: Icon, iconBg }: UserKpiCardProps) => {
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

export const UsersTab = ({ filters }: UsersTabProps) => {
  const summary      = useMemo(() => generateUsersSummary(filters.from, filters.to),        [filters.from, filters.to]);
  const heatmapData  = useMemo(() => generateUserActivityHeatmap(filters.from, filters.to), [filters.from, filters.to]);
  const growthData   = useMemo(() => generateUserGrowth(filters.from, filters.to),          [filters.from, filters.to]);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UserKpiCard
          label="New Users"
          value={summary.newUsers.toLocaleString()}
          delta={summary.newUsersDelta}
          icon={UserPlus}
          iconBg="bg-primary"
        />
        <UserKpiCard
          label="Active Users"
          value={summary.activeUsers.toLocaleString()}
          delta={summary.activeUsersDelta}
          icon={Users}
          iconBg="bg-blue-500"
        />
        <UserKpiCard
          label="Retention Rate"
          value={`${summary.retentionRate}%`}
          delta={summary.retentionDelta}
          icon={RefreshCw}
          iconBg="bg-violet-500"
        />
        <UserKpiCard
          label="Avg Pickups / User"
          value={`${summary.avgPickupsPerUser}`}
          delta={summary.avgPickupsDelta}
          icon={Activity}
          iconBg="bg-amber-500"
        />
      </div>

      {/* User activity heatmap — full width */}
      <UserActivityHeatmap data={heatmapData} from={filters.from} to={filters.to} />

      {/* User growth chart */}
      <UserGrowthChart data={growthData} />
    </div>
  );
};
