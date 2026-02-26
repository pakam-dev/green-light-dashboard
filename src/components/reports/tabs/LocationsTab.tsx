import { MapPin, TrendingUp, Award, AlertCircle } from "lucide-react";
import { ReportFilters } from "@/hooks/useReportFilters";
import { LocationWasteChart } from "@/components/reports/LocationWasteChart";
import { LocationPickupsChart } from "@/components/reports/LocationPickupsChart";
import { LocationWasteData, LocationPickupsData } from "@/lib/reportsMockData";
import { useGetWasteByLocationQuery, useGetPickupsByLocationQuery } from "@/store/api/reportsApi";

interface LocationsTabProps {
  filters: ReportFilters;
}

/** Normalise whatever shape the backend returns into LocationWasteData[]. */
function normaliseWasteByLocation(raw: any): LocationWasteData[] {
  const rows: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  return rows.map((r) => ({
    location:
      r.location ?? r.locationName ?? r.name ?? r.city ?? r.state ?? "Unknown",
    wasteKg:
      r.wasteKg ??
      r.totalWaste ??
      r.wasteCollected ??
      r.waste_kg ??
      r.total_waste ??
      0,
    pickups:
      r.pickups ??
      r.totalPickups ??
      r.pickupCount ??
      r.total_pickups ??
      r.pickup_count ??
      0,
  }));
}

export const LocationsTab = ({ filters }: LocationsTabProps) => {
  const { data: apiWasteData  } = useGetWasteByLocationQuery(filters);
  const { data: pickupsLocRes } = useGetPickupsByLocationQuery(filters);

  const wasteData: LocationWasteData[] = normaliseWasteByLocation(apiWasteData);

  const pickupsData: LocationPickupsData[] = (pickupsLocRes?.data ?? []).map((r: any) => ({
    location:  r.state,
    completed: Math.round(r.count * (r.completedPct / 100)),
    missed:    Math.round(r.count * (1 - r.completedPct / 100)),
  }));

  const top    = wasteData[0];
  const bottom = wasteData[wasteData.length - 1];

  const bestCompletion = pickupsData.length > 0
    ? [...pickupsData].sort((a, b) => {
        const totA = a.completed + a.missed;
        const totB = b.completed + b.missed;
        const rA   = totA > 0 ? a.completed / totA : 0;
        const rB   = totB > 0 ? b.completed / totB : 0;
        return rB - rA;
      })[0]
    : undefined;

  const bcRate = bestCompletion
    ? (() => {
        const tot = bestCompletion.completed + bestCompletion.missed;
        return tot > 0 ? ((bestCompletion.completed / tot) * 100).toFixed(1) : "0";
      })()
    : "0";

  return (
    <div className="space-y-6">
      {/* Location KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Location</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {top?.location ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {top ? `${(top.wasteKg / 1000).toFixed(1)}k kg collected` : "No data yet"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Best Completion Rate</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {bestCompletion?.location ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bestCompletion ? `${bcRate}% completion` : "No data yet"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Needs Attention</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {bottom?.location ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bottom
                ? `${(bottom.wasteKg / 1000).toFixed(1)}k kg — lowest volume`
                : "No data yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LocationWasteChart data={wasteData} />
        <LocationPickupsChart data={pickupsData} />
      </div>
    </div>
  );
};
