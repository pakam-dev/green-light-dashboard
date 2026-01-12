import { baseApi } from "./baseApi";

// Types
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

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  user?: string;
}

// Dashboard API endpoints
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      providesTags: [{ type: "Dashboard", id: "STATS" }],
    }),

    // Get revenue chart data
    getRevenueData: builder.query<RevenueData[], { period?: string }>({
      query: (params) => ({
        url: "/dashboard/revenue",
        params,
      }),
      providesTags: [{ type: "Dashboard", id: "REVENUE" }],
    }),

    // Get recent activity
    getRecentActivity: builder.query<ActivityItem[], { limit?: number }>({
      query: (params) => ({
        url: "/dashboard/activity",
        params: params || { limit: 10 },
      }),
      providesTags: [{ type: "Dashboard", id: "ACTIVITY" }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetDashboardStatsQuery,
  useGetRevenueDataQuery,
  useGetRecentActivityQuery,
} = dashboardApi;
