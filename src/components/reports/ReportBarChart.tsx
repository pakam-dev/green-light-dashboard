import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PickupBarData } from "@/lib/reportsMockData";

const COLORS = {
  completed: "#008300",
  missed: "#ef4444",
  pending: "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

interface ReportBarChartProps {
  data: PickupBarData[];
}

export const ReportBarChart = ({ data }: ReportBarChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Pickups by Status</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Monthly breakdown of completed, missed and pending pickups</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="30%">
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
              tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              formatter={(value) => <span className="text-muted-foreground capitalize">{value}</span>}
            />
            <Bar dataKey="completed" fill={COLORS.completed} radius={[4, 4, 0, 0]} name="completed" />
            <Bar dataKey="missed"    fill={COLORS.missed}    radius={[4, 4, 0, 0]} name="missed" />
            <Bar dataKey="pending"   fill={COLORS.pending}   radius={[4, 4, 0, 0]} name="pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
