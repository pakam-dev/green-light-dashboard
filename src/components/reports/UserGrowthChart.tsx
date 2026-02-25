import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UserGrowthPoint } from "@/lib/reportsMockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color ?? entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">User Growth</h3>
        <p className="text-sm text-muted-foreground mt-0.5">New weekly registrations (bars) vs cumulative total (line)</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="new"
              orientation="left"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="total"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              formatter={(v) => <span className="text-muted-foreground">{v}</span>}
            />
            <Bar
              yAxisId="new"
              dataKey="newUsers"
              fill="#86efac"
              radius={[3, 3, 0, 0]}
              name="New Users"
              barSize={14}
            />
            <Line
              yAxisId="total"
              type="monotone"
              dataKey="total"
              stroke="#008300"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#008300" }}
              name="Total Users"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
