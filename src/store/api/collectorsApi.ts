import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Collectors
 * ════════════════════════════════════════════════════════════════════
 *
 * Implement the REST endpoints below for a Node.js/Express backend.
 * Rules that apply to ALL endpoints:
 *
 *   AUTH      — Bearer JWT in Authorization header; return 401 if absent/invalid
 *   TIMESTAMPS— ISO 8601 strings e.g. "2025-02-11T09:30:00Z"
 *   ERRORS    — { "message": "...", "status": <http_code> }
 *
 * ── Endpoint 1 ───────────────────────────────────────────────────────
 * GET /v2/collectors/summary
 *   Response: { data: CollectorSummary }
 *   — aggregated counts; completedToday is sum of all collectors' completedToday
 *   — used by: Collectors page KPI cards
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /v2/collectors
 *   Query: page, pageSize
 *   Response: { data: { data: Collector[], total, page, pageSize } }
 *   — sorted by status priority: on-assignment → online → offline
 *   — used by: Collectors page map + table
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * PATCH /v2/collectors/:id
 *   Body: { isActive?: boolean }   — used to enable or disable a collector
 *   Response: { data: Collector }  — updated collector record
 *   — used by: enable/disable toggle on the collectors table
 *
 * Collector object shape:
 * {
 *   id:               string,   // unique collector ID
 *   name:             string,   // collector's full name
 *   phone:            string,   // collector's phone number
 *   email:            string,   // collector's email address
 *   status:           string,   // "online" | "offline" | "on-assignment"
 *   isActive:         boolean,  // whether the collector account is enabled
 *   lat?:             number,   // current GPS latitude (omit if offline/unknown)
 *   lng?:             number,   // current GPS longitude (omit if offline/unknown)
 *   currentAddress?:  string,   // human-readable current location
 *   completedToday:   number,   // schedules completed today
 *   totalCompleted:   number,   // all-time completed schedules
 *   lastSeen:         string,   // ISO 8601 timestamp of last GPS ping
 *   assignedScheduleId?: string // schedule ID if on-assignment
 * }
 *
 * CollectorSummary object shape:
 * {
 *   totalCollectors:   number,
 *   onlineCount:       number,
 *   onAssignmentCount: number,
 *   offlineCount:      number,
 *   completedToday:    number,
 * }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CollectorStatus = "online" | "offline" | "on-assignment";

export interface Collector {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CollectorStatus;
  isActive: boolean;
  lat?: number;
  lng?: number;
  currentAddress?: string;
  completedToday: number;
  totalCompleted: number;
  lastSeen: string;
  assignedScheduleId?: string;
}

export interface CollectorSummary {
  totalCollectors: number;
  onlineCount: number;
  onAssignmentCount: number;
  offlineCount: number;
  completedToday: number;
}

export interface CollectorsResponse {
  data: {
    data: Collector[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface CollectorSummaryResponse {
  data: CollectorSummary;
}

export interface CollectorsParams {
  page?: number;
  pageSize?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const collectorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/collectors/summary
     * Returns aggregated collector counts and today's completion total.
     * Used by: Collectors page KPI cards.
     */
    getCollectorSummary: builder.query<CollectorSummaryResponse, void>({
      query: () => ({ url: "/v2/collectors/summary" }),
      providesTags: [{ type: "Dashboard", id: "COLLECTOR_SUMMARY" }],
    }),

    /**
     * GET /v2/collectors
     * Returns all collectors with their current status and GPS location.
     * Used by: Collectors page map pins and table.
     */
    getCollectors: builder.query<CollectorsResponse, CollectorsParams | void>({
      query: (params) => ({
        url: "/v2/collectors",
        params: params || {},
      }),
      providesTags: [{ type: "Dashboard", id: "COLLECTOR_LIST" }],
    }),

    /**
     * PATCH /v2/collectors/:id
     * Enables or disables a collector account.
     * Used by: enable/disable toggle on the collectors table.
     */
    updateCollector: builder.mutation<{ data: Collector }, { id: string; data: Partial<Pick<Collector, "isActive">> }>({
      query: ({ id, data }) => ({
        url: `/v2/collectors/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: "Dashboard", id: "COLLECTOR_LIST" },
        { type: "Dashboard", id: "COLLECTOR_SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetCollectorSummaryQuery,
  useGetCollectorsQuery,
  useUpdateCollectorMutation,
} = collectorsApi;
