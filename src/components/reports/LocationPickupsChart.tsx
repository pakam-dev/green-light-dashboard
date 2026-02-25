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
import { LocationPickupsData } from "@/lib/reportsMockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const completed = payload.find((p: any) => p.dataKey === "completed")?.value ?? 0;
  const missed = payload.find((p: any) => p.dataKey === "missed")?.value ?? 0;
  const total = completed + missed;
  const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-border text-xs text-muted-foreground">
        Completion rate: <span className="font-semibold text-primary">{rate}%</span>
      </div>
    </div>
  );
};

interface LocationPickupsChartProps {
  data: LocationPickupsData[];
}

export const LocationPickupsChart = ({ data }: LocationPickupsChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Pickup Performance by Location</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Completed vs missed pickups across all cities</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDashboard="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="location"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              formatter={(v) => <span className="text-muted-foreground capitalize">{v}</span>}
            />
            <Bar dataKey="completed" fill="#008300" radius={[4, 4, 0, 0]} name="completed" />
            <Bar dataKey="missed"    fill="#ef4444" radius={[4, 4, 0, 0]} name="missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
