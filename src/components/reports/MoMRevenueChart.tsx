import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { MoMRevenuePoint } from "@/lib/reportsMockData";

function formatNaira(v: number): string {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}k`;
  return `₦${v}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const current  = payload.find((p: any) => p.dataKey === "current")?.value  ?? 0;
  const previous = payload.find((p: any) => p.dataKey === "previous")?.value ?? 0;
  const pct = previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : "N/A";
  const positive = current >= previous;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <p className="text-muted-foreground">
        Current: <span className="font-medium text-foreground">{formatNaira(current)}</span>
      </p>
      <p className="text-muted-foreground">
        Previous: <span className="font-medium text-foreground">{formatNaira(previous)}</span>
      </p>
      <p className={`mt-1 text-xs font-semibold ${positive ? "text-primary" : "text-destructive"}`}>
        {positive ? "▲" : "▼"} {pct}% change
      </p>
    </div>
  );
};

interface MoMRevenueChartProps {
  data: MoMRevenuePoint[];
}

export const MoMRevenueChart = ({ data }: MoMRevenueChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Month-on-Month Revenue</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Current month vs previous month revenue comparison</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNaira}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              formatter={(v) => <span className="text-muted-foreground capitalize">{v}</span>}
            />
            <Bar dataKey="current"  fill="#008300" radius={[4, 4, 0, 0]} name="current" />
            <Bar dataKey="previous" fill="#86efac" radius={[4, 4, 0, 0]} name="previous" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
