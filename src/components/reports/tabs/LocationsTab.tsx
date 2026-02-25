import { useMemo } from "react";
import { MapPin, TrendingUp, Award, AlertCircle } from "lucide-react";
import { ReportFilters } from "@/hooks/useReportFilters";
import { LocationWasteChart } from "@/components/reports/LocationWasteChart";
import { LocationPickupsChart } from "@/components/reports/LocationPickupsChart";
import {
  LocationWasteData,
  generateWasteByLocation,
  generatePickupsByLocation,
} from "@/lib/reportsMockData";
import { useGetWasteByLocationQuery } from "@/store/api/reportsApi";

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
      r.location ?? r.locationName ?? r.name ?? r.city ?? "Unknown",
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
  // Real API call
  const { data: apiData, isSuccess } = useGetWasteByLocationQuery(filters);

  // Fallback mock data — generated when API has no data
  const mockWasteData = useMemo(
    () => generateWasteByLocation(filters.from, filters.to),
    [filters.from, filters.to]
  );
  const pickupsData = useMemo(
    () => generatePickupsByLocation(filters.from, filters.to),
    [filters.from, filters.to]
  );

  // Prefer real API data; fall back to mock
  const wasteData: LocationWasteData[] = useMemo(() => {
    if (isSuccess && apiData) {
      const normalised = normaliseWasteByLocation(apiData);
      if (normalised.length > 0) return normalised;
    }
    return mockWasteData;
  }, [isSuccess, apiData, mockWasteData]);

  const top = wasteData[0];
  const bottom = wasteData[wasteData.length - 1];
  const bestCompletion = [...pickupsData].sort((a, b) => {
    const rA = a.completed / (a.completed + a.missed);
    const rB = b.completed / (b.completed + b.missed);
    return rB - rA;
  })[0];
  const bcRate = bestCompletion
    ? (
        (bestCompletion.completed /
          (bestCompletion.completed + bestCompletion.missed)) *
        100
      ).toFixed(1)
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
              {top?.location}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {top ? `${(top.wasteKg / 1000).toFixed(1)}k kg collected` : "—"}
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
              {bestCompletion?.location}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bcRate}% completion
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
              {bottom?.location}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bottom
                ? `${(bottom.wasteKg / 1000).toFixed(1)}k kg — lowest volume`
                : "—"}
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
