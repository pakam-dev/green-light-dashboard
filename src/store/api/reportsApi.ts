import { baseApi } from "./baseApi";
import { format } from "date-fns";

export interface ReportQueryParams {
  from: Date;
  to: Date;
  location: string;
}

function buildParams(p: ReportQueryParams) {
  return {
    startDate: format(p.from, "yyyy-MM-dd"),
    endDate: format(p.to, "yyyy-MM-dd"),
    location: p.location !== "all" ? p.location : undefined,
  };
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Overview ──────────────────────────────────────────────────────────
    getReportSummary: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/summary", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_SUMMARY" }],
    }),
    getPickupsByPeriod: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickups-by-period", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_PICKUPS" }],
    }),
    getWasteTrend: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/waste-trend", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_WASTE" }],
    }),
    getActivityHeatmap: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/activity-heatmap", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_HEATMAP" }],
    }),

    // ── Locations ─────────────────────────────────────────────────────────
    getWasteByLocation: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/waste-by-location", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_LOC_WASTE" }],
    }),
    getPickupsByLocation: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickups-by-location", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_LOC_PICKUPS" }],
    }),

    // ── Users ─────────────────────────────────────────────────────────────
    getUserActivityHeatmap: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/user-activity-heatmap", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_USER_HEATMAP" }],
    }),
    getUserGrowth: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/user-growth", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_USER_GROWTH" }],
    }),

    // ── Revenue ───────────────────────────────────────────────────────────
    getRevenueSummary: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/revenue-summary", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_REV_SUMMARY" }],
    }),
    getRevenueWeeklyTrend: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/revenue-trend", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_REV_TREND" }],
    }),

    // ── Trends ────────────────────────────────────────────────────────────
    getPickupFrequency: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickup-frequency", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_FREQUENCY" }],
    }),
    getMonthOnMonth: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/month-on-month", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_MOM" }],
    }),
  }),
});

export const {
  useGetReportSummaryQuery,
  useGetPickupsByPeriodQuery,
  useGetWasteTrendQuery,
  useGetActivityHeatmapQuery,
  useGetWasteByLocationQuery,
  useGetPickupsByLocationQuery,
  useGetUserActivityHeatmapQuery,
  useGetUserGrowthQuery,
  useGetRevenueSummaryQuery,
  useGetRevenueWeeklyTrendQuery,
  useGetPickupFrequencyQuery,
  useGetMonthOnMonthQuery,
} = reportsApi;
