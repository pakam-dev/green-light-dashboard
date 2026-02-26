import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Dashboard (Home)
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
 * ── Endpoint 1 ───────────────────────────────────────────────────────
 * GET /dashboard/stats
 *   Response: { totalPickups, pendingPickups, completedPickups,
 *     totalUsers, newUsers, totalAggregators, revenue, revenueGrowth }
 *   — revenueGrowth is a percentage e.g. 12.4 (not 0.124)
 *   — used by: Dashboard home page KPI metric cards
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /dashboard/revenue
 *   Query: period ("7d"|"30d"|"3m"|"12m")
 *   Response: [ { month: string, revenue: number, expenses: number }, ... ]
 *   — sorted oldest → newest; used by Revenue vs Expenses chart
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * GET /dashboard/activity
 *   Query: limit (default 10)
 *   Response: [ { id, type, message, timestamp, user? }, ... ]
 *   — types: "pickup_completed", "pickup_cancelled", "loan_disbursed",
 *     "loan_repaid", "user_signup", "aggregator_signup", "topup",
 *     "material_purchase"
 *   — used by: Dashboard home page "Recent Activity" feed
 *
 * ── Endpoint 4 (legacy) ──────────────────────────────────────────────
 * GET /v2/dashboard/details
 *   Query: type, page  (see pickupsApi.ts for full type list)
 *   Response: { data: { data: Pickup[], total, page, pageSize } }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Platform-wide overview stats — used by the main dashboard home page.
 *
 * Backend MUST return:
 * {
 *   totalPickups:      number,  // total number of pickup schedules ever created
 *   pendingPickups:    number,  // count of pickups in "pending" status
 *   completedPickups:  number,  // count of pickups in "completed" status
 *   totalUsers:        number,  // total registered users on the platform
 *   newUsers:          number,  // new users registered in the current period
 *   totalAggregators:  number,  // total registered aggregators/collectors
 *   revenue:           number,  // total ₦ revenue in the current period
 *   revenueGrowth:     number,  // % revenue growth vs previous period (e.g. 12.4)
 * }
 */
export interface DashboardStats {
  totalPickups: number;
  pendingPickups: number;
  completedPickups: number;
  totalUsers: number;
  newUsers: number;
  totalAggregators: number;
  revenue: number;
  revenueGrowth: number;
}

/**
 * Monthly revenue vs expenses data — used by the home dashboard revenue chart.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   month:     string,  // short month label e.g. "Jan", "Feb"
 *   revenue:   number,  // ₦ total revenue for this month
 *   expenses:  number,  // ₦ total expenses for this month
 * }
 */
export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

/**
 * A single recent activity item — used by the home dashboard activity feed.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:         number,   // unique activity ID
 *   type:       string,   // activity category e.g. "pickup_completed", "loan_disbursed", "user_signup"
 *   message:    string,   // human-readable description e.g. "Pickup #1234 completed in Lagos"
 *   timestamp:  string,   // ISO 8601 timestamp
 *   user?:      string,   // optional — name of the user who triggered this activity
 * }
 */
export interface ActivityItem {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  user?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/dashboard/details?type=pendingSchedules&page=1
     *
     * Returns a paginated list of pending schedule records.
     * This is the legacy endpoint used by dashboard widgets that
     * show pending schedule counts/details.
     *
     * Query params (appended to the URL):
     *   type  — always "pendingSchedules" for this hook
     *   page  — page number (1-based)
     *
     * Expected response shape: see PickupsResponse in pickupsApi.ts
     *
     * Used by: Dashboard home page widgets showing pending schedule counts.
     */
    getPendingSchedules: builder.query<any, void>({
      query: () => "/v2/dashboard/details?type=pendingSchedules&page=1",
      providesTags: [{ type: "Dashboard", id: "STATS" }],
    }),

    /**
     * GET /dashboard/stats
     *
     * Returns the overall platform statistics for the home dashboard.
     *
     * Expected response: DashboardStats (see type above)
     *
     * Used by: Dashboard home page — top-level KPI metric cards.
     */
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      providesTags: [{ type: "Dashboard", id: "STATS" }],
    }),

    /**
     * GET /dashboard/revenue
     *
     * Returns monthly revenue vs expenses data for the home dashboard chart.
     *
     * Query params:
     *   period — time period filter e.g. "7d", "30d", "3m", "12m"
     *
     * Expected response: RevenueData[] (see type above)
     *   Array of monthly entries sorted oldest → newest.
     *
     * Used by: Dashboard home page — Revenue vs Expenses line/area chart.
     */
    getRevenueData: builder.query<RevenueData[], { period?: string }>({
      query: (params) => ({
        url: "/dashboard/revenue",
        params,
      }),
      providesTags: [{ type: "Dashboard", id: "REVENUE" }],
    }),

    /**
     * GET /dashboard/activity
     *
     * Returns a feed of recent platform activity items.
     *
     * Query params:
     *   limit — number of items to return (defaults to 10)
     *
     * Expected response: ActivityItem[] (see type above)
     *   Sorted newest → oldest. Include diverse activity types:
     *   pickup_completed, pickup_cancelled, loan_disbursed, loan_repaid,
     *   user_signup, aggregator_signup, topup, material_purchase
     *
     * Used by: Dashboard home page — "Recent Activity" feed/timeline.
     */
    getRecentActivity: builder.query<ActivityItem[], { limit?: number }>({
      query: (params) => ({
        url: "/dashboard/activity",
        params: params || { limit: 10 },
      }),
      providesTags: [{ type: "Dashboard", id: "ACTIVITY" }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRevenueDataQuery,
  useGetRecentActivityQuery,
  useGetPendingSchedulesQuery,
} = dashboardApi;
