import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { RevenuePoint } from "@/lib/reportsMockData";

function formatNaira(v: number): string {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}k`;
  return `₦${v}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-primary">{formatNaira(payload[0]?.value)}</span>
      </p>
    </div>
  );
};

interface RevenueAreaChartProps {
  data: RevenuePoint[];
}

export const RevenueAreaChart = ({ data }: RevenueAreaChartProps) => {
  const avg = data.length
    ? data.reduce((s, d) => s + d.revenue, 0) / data.length
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Weekly Revenue</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Revenue trend — dashed line shows period average ({formatNaira(avg)}/week)
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#008300" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#008300" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="week"
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
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avg}
              stroke="#9ca3af"
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#008300"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#008300" }}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
