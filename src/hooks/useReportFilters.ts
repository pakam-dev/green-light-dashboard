import { useState, useCallback } from "react";
import { subDays, format, parseISO, isValid } from "date-fns";
import { useSearchParams } from "react-router-dom";

export interface ReportFilters {
  from: Date;
  to: Date;
  location: string;
  activeTab: string;
}

export const LOCATIONS = [
  { value: "all", label: "All Locations" },
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "port-harcourt", label: "Port Harcourt" },
  { value: "ibadan", label: "Ibadan" },
  { value: "kano", label: "Kano" },
];

export const PRESET_RANGES = [
  { label: "Last 7 days",   days: 7   },
  { label: "Last 30 days",  days: 30  },
  { label: "Last 90 days",  days: 90  },
  { label: "Last 6 months", days: 180 },
  { label: "Last year",     days: 365 },
];

export const REPORT_TABS = [
  { value: "overview",  label: "Overview"  },
  { value: "locations", label: "Locations" },
  { value: "users",     label: "Users"     },
  { value: "revenue",   label: "Revenue"   },
  { value: "trends",    label: "Trends"    },
];

function safeParseDate(str: string | null, fallback: Date): Date {
  if (!str) return fallback;
  const d = parseISO(str);
  return isValid(d) ? d : fallback;
}

export const useReportFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialFilters = (): ReportFilters => ({
    from: safeParseDate(searchParams.get("from"), subDays(new Date(), 30)),
    to: safeParseDate(searchParams.get("to"), new Date()),
    location: searchParams.get("location") ?? "all",
    activeTab: searchParams.get("tab") ?? "overview",
  });

  const [filters, setFilters] = useState<ReportFilters>(getInitialFilters);

  const updateFilters = useCallback(
    (updates: Partial<ReportFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...updates };
        setSearchParams(
          {
            from: format(next.from, "yyyy-MM-dd"),
            to: format(next.to, "yyyy-MM-dd"),
            location: next.location,
            tab: next.activeTab,
          },
          { replace: true }
        );
        return next;
      });
    },
    [setSearchParams]
  );

  const setActiveTab = useCallback(
    (tab: string) => updateFilters({ activeTab: tab }),
    [updateFilters]
  );

  /** Encode current filters + active tab as a base64 share token */
  const getShareToken = useCallback((): string => {
    const payload = {
      from: format(filters.from, "yyyy-MM-dd"),
      to: format(filters.to, "yyyy-MM-dd"),
      location: filters.location,
      tab: filters.activeTab,
    };
    return btoa(JSON.stringify(payload));
  }, [filters]);

  return { filters, updateFilters, setActiveTab, getShareToken };
};

/** Decode a share token — used by PublicReportPage */
export function decodeShareToken(token: string): ReportFilters | null {
  try {
    const payload = JSON.parse(atob(token));
    return {
      from: safeParseDate(payload.from, subDays(new Date(), 30)),
      to: safeParseDate(payload.to, new Date()),
      location: payload.location ?? "all",
      activeTab: payload.tab ?? "overview",
    };
  } catch {
    return null;
  }
}
