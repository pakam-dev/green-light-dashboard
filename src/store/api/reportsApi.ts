import { baseApi } from "./baseApi";
import { format } from "date-fns";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Reports
 * ════════════════════════════════════════════════════════════════════
 *
 * Implement the REST endpoints below for a Node.js/Express backend
 * (or any framework). Rules that apply to ALL endpoints:
 *
 *   AUTH      — Bearer JWT in Authorization header; return 401 if absent/invalid
 *   CURRENCY  — All monetary values in Nigerian Naira (₦), stored as integers
 *   TIMESTAMPS— ISO 8601 strings e.g. "2025-02-11T09:30:00Z"
 *   ERRORS    — { "message": "...", "status": <http_code> }
 *   PAGINATION— 1-based page numbers; always include total, page, pageSize in lists
 *   SORTING   — Default newest-first unless stated otherwise
 *
 * All report endpoints share these query params:
 *   startDate — "YYYY-MM-DD" (inclusive)
 *   endDate   — "YYYY-MM-DD" (inclusive)
 *   location  — Nigerian state name, omitted for nationwide
 *
 * ── Endpoint 1 ───────────────────────────────────────────────────────
 * GET /v2/reports/summary
 *   Response: { totalPickups, completedPickups, totalWaste (kg),
 *               totalUsers, revenue }
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /v2/reports/pickups-by-period
 *   Response: { data: [ { period, completed, cancelled, pending }, ... ] }
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * GET /v2/reports/waste-trend
 *   Response: { data: [ { period, wasteKg }, ... ] }
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * GET /v2/reports/activity-heatmap
 *   Response: { data: [ { day, hour, count }, ... ] }  (168 entries: 7×24)
 *
 * ── Endpoint 5 ───────────────────────────────────────────────────────
 * GET /dashboard/analytics/waste-by-location
 *   Response: { data: [ { state, wasteKg }, ... ] }  sorted descending
 *
 * ── Endpoint 6 ───────────────────────────────────────────────────────
 * GET /v2/reports/pickups-by-location
 *   Response: { data: [ { state, count, completedPct }, ... ] }
 *
 * ── Endpoint 7 ───────────────────────────────────────────────────────
 * GET /v2/reports/user-activity-heatmap
 *   Same shape as activity-heatmap, scoped to user events
 *
 * ── Endpoint 8 ───────────────────────────────────────────────────────
 * GET /v2/reports/user-growth
 *   Response: { data: [ { period, newUsers, totalUsers }, ... ] }
 *
 * ── Endpoint 9 ───────────────────────────────────────────────────────
 * GET /v2/reports/revenue-summary
 *   Response: { totalRevenue, schedules, loans, instantBuy, growth }
 *
 * ── Endpoint 10 ──────────────────────────────────────────────────────
 * GET /v2/reports/revenue-trend
 *   Response: { data: [ { week, schedules, loans, instantBuy }, ... ] }
 *
 * ── Endpoint 11 ──────────────────────────────────────────────────────
 * GET /v2/reports/pickup-frequency
 *   Response: { data: [ { frequency, users }, ... ] }
 *
 * ── Endpoint 12 ──────────────────────────────────────────────────────
 * GET /v2/reports/month-on-month
 *   Response: { data: [ { metric, current, previous, changePct }, ... ] }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query parameters shared by all report endpoints.
 *
 * Frontend converts these to the query string format expected by the backend:
 *   startDate: "YYYY-MM-DD"
 *   endDate:   "YYYY-MM-DD"
 *   location:  Nigerian state name (omitted when "all" to return nationwide data)
 */
export interface ReportQueryParams {
  from: Date;
  to: Date;
  location: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildParams(p: ReportQueryParams) {
  return {
    startDate: format(p.from, "yyyy-MM-dd"),
    endDate: format(p.to, "yyyy-MM-dd"),
    location: p.location !== "all" ? p.location : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All report endpoints follow the same pattern:
 *
 * Query params (URL query string):
 *   startDate  — "YYYY-MM-DD" — inclusive start of date range
 *   endDate    — "YYYY-MM-DD" — inclusive end of date range
 *   location   — Nigerian state name OR omitted for nationwide
 *
 * Responses use `any` type because the Reports page uses raw Recharts data arrays.
 * Backend should return arrays of objects suitable for Recharts charts.
 * See individual endpoint comments for expected shapes.
 */
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Overview ──────────────────────────────────────────────────────────────

    /**
     * GET /v2/reports/summary
     *
     * Returns high-level report metrics for the selected date range and location.
     *
     * Expected response:
     * {
     *   totalPickups:    number,   // total schedules in range
     *   completedPickups: number,  // completed schedules in range
     *   totalWaste:      number,   // kg of waste collected
     *   totalUsers:      number,   // unique users active in range
     *   revenue:         number,   // ₦ total revenue in range
     * }
     *
     * Used by: Reports page — summary stats cards at the top.
     */
    getReportSummary: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/summary", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_SUMMARY" }],
    }),

    /**
     * GET /v2/reports/pickups-by-period
     *
     * Returns pickup counts aggregated by sub-period within the date range.
     *
     * Expected response:
     * {
     *   data: [
     *     { period: "Jan 25", completed: 842, cancelled: 91, pending: 34 },
     *     { period: "Feb 25", completed: 978, cancelled: 87, pending: 42 },
     *     ...
     *   ]
     * }
     *
     * Used by: Reports page — "Pickups by Period" BarChart.
     */
    getPickupsByPeriod: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickups-by-period", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_PICKUPS" }],
    }),

    /**
     * GET /v2/reports/waste-trend
     *
     * Returns total waste collected (kg) over time within the date range.
     *
     * Expected response:
     * {
     *   data: [
     *     { period: "Jan 25", wasteKg: 42800 },
     *     { period: "Feb 25", wasteKg: 49600 },
     *     ...
     *   ]
     * }
     *
     * Used by: Reports page — "Waste Collection Trend" AreaChart.
     */
    getWasteTrend: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/waste-trend", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_WASTE" }],
    }),

    /**
     * GET /v2/reports/activity-heatmap
     *
     * Returns a day-of-week × hour-of-day heatmap of schedule activity.
     *
     * Expected response:
     * {
     *   data: [
     *     { day: "Mon", hour: 8,  count: 42 },
     *     { day: "Mon", hour: 9,  count: 87 },
     *     { day: "Tue", hour: 8,  count: 51 },
     *     ...  // all 7 days × 24 hours = 168 entries
     *   ]
     * }
     *
     * Used by: Reports page — "Activity Heatmap" calendar heat grid.
     */
    getActivityHeatmap: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/activity-heatmap", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_HEATMAP" }],
    }),

    // ── Locations ─────────────────────────────────────────────────────────────

    /**
     * GET /dashboard/analytics/waste-by-location
     *
     * Returns total waste collected (kg) grouped by Nigerian state.
     *
     * Expected response:
     * {
     *   data: [
     *     { state: "Lagos",  wasteKg: 184200 },
     *     { state: "Rivers", wasteKg: 93400  },
     *     ...  // sorted descending by wasteKg
     *   ]
     * }
     *
     * Used by: Reports page — "Waste by Location" choropleth or bar chart.
     */
    getWasteByLocation: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/dashboard/analytics/waste-by-location", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_LOC_WASTE" }],
    }),

    /**
     * GET /v2/reports/pickups-by-location
     *
     * Returns pickup counts grouped by Nigerian state.
     *
     * Expected response:
     * {
     *   data: [
     *     { state: "Lagos",       count: 5842, completedPct: 91.2 },
     *     { state: "Abuja (FCT)", count: 3201, completedPct: 88.4 },
     *     ...  // sorted descending by count
     *   ]
     * }
     *
     * Used by: Reports page — "Pickups by Location" ranked bar/map chart.
     */
    getPickupsByLocation: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickups-by-location", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_LOC_PICKUPS" }],
    }),

    // ── Users ─────────────────────────────────────────────────────────────────

    /**
     * GET /v2/reports/user-activity-heatmap
     *
     * Returns a day × hour heatmap of user signups and activity.
     *
     * Same shape as getActivityHeatmap but scoped to user events
     * (signups, logins, profile updates).
     *
     * Used by: Reports page — "User Activity Heatmap".
     */
    getUserActivityHeatmap: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/user-activity-heatmap", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_USER_HEATMAP" }],
    }),

    /**
     * GET /v2/reports/user-growth
     *
     * Returns cumulative user registration count over time.
     *
     * Expected response:
     * {
     *   data: [
     *     { period: "Jan 25", newUsers: 284, totalUsers: 12480 },
     *     { period: "Feb 25", newUsers: 319, totalUsers: 12799 },
     *     ...
     *   ]
     * }
     *
     * Used by: Reports page — "User Growth" AreaChart.
     */
    getUserGrowth: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/user-growth", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_USER_GROWTH" }],
    }),

    // ── Revenue ───────────────────────────────────────────────────────────────

    /**
     * GET /v2/reports/revenue-summary
     *
     * Returns revenue KPI summary for the selected date range.
     *
     * Expected response:
     * {
     *   totalRevenue:   number,  // ₦ total revenue
     *   schedules:      number,  // ₦ from schedules
     *   loans:          number,  // ₦ from loan interest
     *   instantBuy:     number,  // ₦ from InstantBuy fees
     *   growth:         number,  // % growth vs previous equivalent period
     * }
     *
     * Used by: Reports page — Revenue summary KPI cards.
     */
    getRevenueSummary: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/revenue-summary", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_REV_SUMMARY" }],
    }),

    /**
     * GET /v2/reports/revenue-trend
     *
     * Returns weekly revenue broken down by segment for the date range.
     *
     * Expected response:
     * {
     *   data: [
     *     { week: "Week 1", schedules: 4200000, loans: 2100000, instantBuy: 1300000 },
     *     { week: "Week 2", schedules: 4800000, loans: 2400000, instantBuy: 1500000 },
     *     ...
     *   ]
     * }
     *
     * Used by: Reports page — "Revenue Trend" stacked AreaChart or BarChart.
     */
    getRevenueWeeklyTrend: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/revenue-trend", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_REV_TREND" }],
    }),

    // ── Trends ────────────────────────────────────────────────────────────────

    /**
     * GET /v2/reports/pickup-frequency
     *
     * Returns pickup frequency per user (how often users request pickups).
     *
     * Expected response:
     * {
     *   data: [
     *     { frequency: "Once",      users: 3240 },
     *     { frequency: "2-5x",      users: 2180 },
     *     { frequency: "6-10x",     users: 1420 },
     *     { frequency: "11+ times", users:  840 },
     *   ]
     * }
     *
     * Used by: Reports page — "Pickup Frequency" distribution chart.
     */
    getPickupFrequency: builder.query<any, ReportQueryParams>({
      query: (p) => ({ url: "/v2/reports/pickup-frequency", params: buildParams(p) }),
      providesTags: [{ type: "Dashboard", id: "REPORT_FREQUENCY" }],
    }),

    /**
     * GET /v2/reports/month-on-month
     *
     * Returns month-over-month comparison data for key metrics.
     *
     * Expected response:
     * {
     *   data: [
     *     { metric: "Pickups",      current: 8420, previous: 7680, changePct: 9.6  },
     *     { metric: "Revenue",      current: 42000000, previous: 38000000, changePct: 10.5 },
     *     { metric: "Users",        current: 12799, previous: 12480, changePct: 2.6  },
     *     { metric: "Waste (kg)",   current: 492000, previous: 448000, changePct: 9.8  },
     *   ]
     * }
     *
     * Used by: Reports page — "Month-on-Month Comparison" table or bar chart.
     */
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
