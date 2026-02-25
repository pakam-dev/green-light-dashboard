import { TrendingUp, TrendingDown, Truck, Leaf, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportSummary } from "@/lib/reportsMockData";

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  icon: React.ElementType;
  iconBg: string;
}

const KpiCard = ({ label, value, delta, icon: Icon, iconBg }: KpiCardProps) => {
  const positive = delta >= 0;
  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <div className={cn("mt-1 flex items-center gap-1 text-sm font-medium", positive ? "text-green-600" : "text-destructive")}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{positive ? "+" : ""}{delta}% vs prior period</span>
        </div>
      </div>
    </div>
  );
};

interface ReportStatsSummaryProps {
  summary: ReportSummary;
}

export const ReportStatsSummary = ({ summary }: ReportStatsSummaryProps) => {
  const wasteDisplay =
    summary.totalWasteKg >= 1_000_000
      ? `${(summary.totalWasteKg / 1_000_000).toFixed(2)}M kg`
      : `${(summary.totalWasteKg / 1000).toFixed(1)}k kg`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Total Pickups"
        value={summary.totalPickups.toLocaleString()}
        delta={summary.pickupsDelta}
        icon={Truck}
        iconBg="bg-primary"
      />
      <KpiCard
        label="Waste Collected"
        value={wasteDisplay}
        delta={summary.wasteDelta}
        icon={Leaf}
        iconBg="bg-emerald-500"
      />
      <KpiCard
        label="Active Users"
        value={summary.activeUsers.toLocaleString()}
        delta={summary.usersDelta}
        icon={Users}
        iconBg="bg-blue-500"
      />
      <KpiCard
        label="Completion Rate"
        value={`${summary.completionRate}%`}
        delta={summary.completionDelta}
        icon={CheckCircle}
        iconBg="bg-amber-500"
      />
    </div>
  );
};
