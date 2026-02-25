import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LocationWasteData } from "@/lib/reportsMockData";

const GREENS = ["#008300", "#1a9a00", "#33b000", "#4dc700", "#66dd1a", "#80f333"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Waste: <span className="font-medium text-foreground">{Number(payload[0]?.value).toLocaleString()} kg</span>
      </p>
      <p className="text-muted-foreground">
        Pickups: <span className="font-medium text-foreground">{Number(payload[0]?.payload?.pickups).toLocaleString()}</span>
      </p>
    </div>
  );
};

interface LocationWasteChartProps {
  data: LocationWasteData[];
}

export const LocationWasteChart = ({ data }: LocationWasteChartProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Waste Collected per Location</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Total kg of waste collected, ranked highest to lowest</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="location"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="wasteKg" radius={[0, 4, 4, 0]} name="Waste (kg)">
              {data.map((_, i) => (
                <Cell key={i} fill={GREENS[i % GREENS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
