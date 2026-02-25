import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendPoint } from "@/lib/reportsMockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

interface ReportLineChartProps {
  data: TrendPoint[];
}

export const ReportLineChart = ({ data }: ReportLineChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Weekly Trends</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Waste collected (kg) and new user registrations per week</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="waste"
              orientation="left"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <YAxis
              yAxisId="users"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
            <Line
              yAxisId="waste"
              type="monotone"
              dataKey="wasteKg"
              stroke="#008300"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#008300" }}
              name="Waste (kg)"
            />
            <Line
              yAxisId="users"
              type="monotone"
              dataKey="newUsers"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#3b82f6" }}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
