import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoMRow } from "@/lib/reportsMockData";

function formatValue(value: number, fmt: MoMRow["format"]): string {
  switch (fmt) {
    case "kg":
      return value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(2)}M kg`
        : `${(value / 1000).toFixed(1)}k kg`;
    case "naira":
      return value >= 1_000_000
        ? `₦${(value / 1_000_000).toFixed(1)}M`
        : `₦${(value / 1000).toFixed(0)}k`;
    case "percent":
      return `${value}%`;
    default:
      return Number(value).toLocaleString();
  }
}

interface MoMComparisonTableProps {
  data: MoMRow[];
}

export const MoMComparisonTable = ({ data }: MoMComparisonTableProps) => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-base font-semibold text-foreground">Month-on-Month Comparison</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Current period vs equivalent prior period across all key metrics
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border bg-muted/30">
              <th className="text-left font-medium text-muted-foreground px-6 py-3">Metric</th>
              <th className="text-right font-medium text-muted-foreground px-6 py-3">Current Period</th>
              <th className="text-right font-medium text-muted-foreground px-6 py-3">Prior Period</th>
              <th className="text-right font-medium text-muted-foreground px-6 py-3">Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const positive = row.change > 0;
              const neutral  = row.change === 0;
              return (
                <tr
                  key={row.metric}
                  className={cn(
                    "border-t border-border transition-colors hover:bg-muted/20",
                    i % 2 === 0 ? "bg-white" : "bg-muted/10"
                  )}
                >
                  <td className="px-6 py-4 font-medium text-foreground">{row.metric}</td>
                  <td className="px-6 py-4 text-right font-semibold text-foreground">
                    {formatValue(row.current as number, row.format)}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {formatValue(row.previous as number, row.format)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        neutral  && "bg-muted text-muted-foreground",
                        positive && "bg-green-50 text-green-700",
                        !positive && !neutral && "bg-red-50 text-red-600"
                      )}
                    >
                      {neutral  && <Minus className="h-3 w-3" />}
                      {positive && <TrendingUp className="h-3 w-3" />}
                      {!positive && !neutral && <TrendingDown className="h-3 w-3" />}
                      {positive ? "+" : ""}{row.change}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
