import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FrequencyPoint } from "@/lib/reportsMockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Pickups: <span className="font-semibold text-primary">{payload[0]?.value}</span>
      </p>
    </div>
  );
};

interface PickupFrequencyChartProps {
  data: FrequencyPoint[];
}

export const PickupFrequencyChart = ({ data }: PickupFrequencyChartProps) => {
  // Only show every Nth label to avoid crowding when range is large
  const tickInterval = data.length > 60 ? 13 : data.length > 30 ? 6 : 2;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Pickup Frequency Over Time</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Daily pickup count — reveals weekday/weekend patterns and seasonal spikes
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#freqGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
              name="Pickups"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
