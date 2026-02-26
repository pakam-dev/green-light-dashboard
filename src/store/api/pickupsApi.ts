import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Schedules / Pickups & Dropoffs
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
 * GET /v2/dashboard/details
 *   Query: type ("pendingSchedules"|"totalCompleted"|"cancelledSchedules"|
 *                "pendingDropoffs"|"completedDropoffs"|"cancelledDropoffs"), page
 *   Response: { data: { data: Pickup[], total: number, page: number, pageSize: number } }
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /pickups
 *   Query: page, pageSize, search, filter (key-value)
 *   Response: { data: { data: Pickup[], total: number, page: number, pageSize: number } }
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * GET /pickups/:id
 *   Response: Pickup (single record, not wrapped)
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * GET /v2/schedules/location-stats
 *   Query: type ("pickup"|"dropoff")
 *   Response: { data: [ { state: string, count: number }, ... ] }
 *   — sorted descending by count, top 10 Nigerian states recommended
 *   — used by "Top Pickup Locations" and "Top Dropoff Locations" panels
 *
 * Pickup object shape (all endpoints):
 * {
 *   id, scheduleCreator, createdAt, address, categories: [{catId, name}],
 *   phone, quantity, lat?, long?, images?: string[], collectorName?, notes?
 * }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface wasteCategory {
  catId: string;
  name: string;
}

/**
 * A single pickup or drop-off schedule record.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:               string,          // unique schedule ID
 *   scheduleCreator:  string,          // full name of user who created the schedule
 *   createdAt:        string,          // ISO 8601 timestamp e.g. "2025-02-11T10:00:00Z"
 *   address:          string,          // human-readable pickup/dropoff address
 *   categories:       [                // waste types in this schedule
 *                       { catId: string, name: string },
 *                       ...
 *                     ],
 *   phone:            string,          // user's phone number
 *   quantity:         string,          // e.g. "3 bags", "25 kg"
 *   lat?:             number | string, // GPS latitude  (optional)
 *   long?:            number | string, // GPS longitude (optional)
 *   images?:          string[],        // array of image URLs captured at collection point
 *   collectorName?:   string,          // name of assigned collector/agent
 *   notes?:           string,          // any extra remarks
 * }
 */
export interface Pickup {
  id: string;
  scheduleCreator: string;
  createdAt: string;
  address: string;
  categories: wasteCategory[];
  phone: string;
  quantity: string;
  lat?: number | string;
  long?: number | string;
  images?: string[];
  collectorName?: string;
  notes?: string;
}

/**
 * Paginated list response wrapper used by all schedule list endpoints.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     data:      Pickup[],  // array of schedule records for the current page
 *     total:     number,    // total records matching the filter (for pagination)
 *     page:      number,    // current page number (1-based)
 *     pageSize:  number,    // records per page
 *   }
 * }
 */
export interface PickupsResponse {
  data: {
    data: Pickup[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface PickupsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: Record<string, string>;
}

export type ScheduleType   = "pickup" | "dropoff";
export type ScheduleStatus = "pending" | "completed" | "cancelled";

export interface ScheduleQueryArg {
  scheduleType: ScheduleType;
  status: ScheduleStatus;
}

/**
 * A single location stat entry returned by the location-stats endpoint.
 *
 * Backend MUST return:
 * {
 *   state: string,  // Nigerian state name e.g. "Lagos", "Abuja (FCT)"
 *   count: number,  // number of schedules originating from this state
 * }
 */
export interface ScheduleLocationStat {
  state: string;
  count: number;
}

/**
 * Response wrapper for the schedule location-stats endpoint.
 *
 * Backend MUST return:
 * {
 *   data: ScheduleLocationStat[]   // sorted descending by count
 * }
 *
 * Used by: Schedules page — "Top Pickup Locations" and "Top Dropoff Locations" panels.
 * The frontend renders a ranked bar list. At minimum 5 entries expected; 10 recommended.
 */
export interface ScheduleLocationStatsResponse {
  data: ScheduleLocationStat[];
}

// ─────────────────────────────────────────────────────────────────────────────
// URL HELPER
// ─────────────────────────────────────────────────────────────────────────────

function scheduleUrl(scheduleType: ScheduleType, status: ScheduleStatus): string {
  if (scheduleType === "pickup") {
    if (status === "pending")   return "/v2/dashboard/details?type=pendingSchedules&page=1";
    if (status === "completed") return "/v2/dashboard/details?type=totalCompleted&page=1";
    if (status === "cancelled") return "/v2/dashboard/details?type=cancelledSchedules&page=1";
  }
  if (scheduleType === "dropoff") {
    if (status === "pending")   return "/v2/dashboard/details?type=pendingDropoffs&page=1";
    if (status === "completed") return "/v2/dashboard/details?type=completedDropoffs&page=1";
    if (status === "cancelled") return "/v2/dashboard/details?type=cancelledDropoffs&page=1";
  }
  return "/pickups";
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const pickupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /pickups
     *
     * Returns a paginated list of all pickups regardless of status.
     * Query params: page, pageSize, search, filter (key-value pairs)
     */
    getPickups: builder.query<PickupsResponse, PickupsParams | void>({
      query: (params) => ({ url: "/pickups", params: params || {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }) => ({ type: "Pickups" as const, id })),
              { type: "Pickups", id: "LIST" },
            ]
          : [{ type: "Pickups", id: "LIST" }],
    }),

    /**
     * GET /pickups/:id
     *
     * Returns a single pickup record by its ID.
     */
    getPickupById: builder.query<Pickup, number>({
      query: (id) => `/pickups/${id}`,
      providesTags: (result, error, id) => [{ type: "Pickups", id }],
    }),

    /** Legacy endpoint — kept for compatibility with existing dashboard widgets. */
    getPickupByStatus: builder.query<PickupsResponse, string>({
      query: (status) => ({
        url:
          status === "pending"   ? "/v2/dashboard/details?type=pendingSchedules&page=1"
        : status === "completed" ? "/v2/dashboard/details?type=totalCompleted&page=1"
        : status === "missed"    ? "/v2/dashboard/details?type=missedPickups&page=1"
        : status === "cancelled" ? "/v2/dashboard/details?type=cancelledSchedules&page=1"
        : `/pickups/status/${status}`,
      }),
      providesTags: (result, error, status) => [{ type: "Pickups", id: `legacy_${status}` }],
    }),

    /**
     * GET /v2/dashboard/details?type=<scheduleType>&status=<status>
     *
     * Drives the Schedules page table. Returns paginated Pickup records filtered
     * by schedule type (pickup | dropoff) and status (pending | completed | cancelled).
     *
     * Used by: Schedules page — each status tab (Pending / Completed / Cancelled)
     *   within the Pickups and Dropoffs main tabs.
     *
     * The table renders: Creator name, Phone, Address, Waste categories,
     * Quantity, Created date — and expands to show Images + full details.
     */
    getSchedulesByTypeAndStatus: builder.query<PickupsResponse, ScheduleQueryArg>({
      query: ({ scheduleType, status }) => ({
        url: scheduleUrl(scheduleType, status),
      }),
      providesTags: (result, error, { scheduleType, status }) => [
        { type: "Pickups", id: `${scheduleType}_${status}` },
      ],
    }),

    /**
     * GET /v2/schedules/location-stats?type=pickup|dropoff
     *
     * Returns the number of schedules grouped by Nigerian state.
     * Used by: Schedules page — "Top Pickup Locations" & "Top Dropoff Locations" panels.
     *
     * Query params:
     *   type: "pickup" | "dropoff"
     *
     * Expected response:
     * {
     *   data: [
     *     { state: "Lagos",       count: 1842 },
     *     { state: "Abuja (FCT)", count: 1205 },
     *     { state: "Rivers",      count:  934 },
     *     ...  // sorted descending by count, top 10 states
     *   ]
     * }
     */
    getScheduleLocationStats: builder.query<ScheduleLocationStatsResponse, { type: ScheduleType }>({
      query: ({ type }) => ({
        url: "/v2/schedules/location-stats",
        params: { type },
      }),
      providesTags: (result, error, { type }) => [
        { type: "Dashboard", id: `SCHED_LOC_${type}` },
      ],
    }),
  }),
});

export const {
  useGetPickupsQuery,
  useGetPickupByStatusQuery,
  useGetPickupByIdQuery,
  useGetSchedulesByTypeAndStatusQuery,
  useGetScheduleLocationStatsQuery,
} = pickupsApi;
