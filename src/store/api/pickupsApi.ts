import { baseApi } from "./baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface wasteCategory {
  catId: string;
  name: string;
}

export interface Pickup {
  id: string;
  scheduleCreator: string;
  createdAt: string;
  address: string;
  categories: wasteCategory[];
  phone: string;
  quantity: string;
  /** Coordinates sent by backend — present on real data, optional during transition */
  lat?: number | string;
  long?: number | string;
}

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

// ── URL helper ─────────────────────────────────────────────────────────────

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

// ── Endpoints ──────────────────────────────────────────────────────────────

export const pickupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all pickups with pagination
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

    // Get single pickup by ID
    getPickupById: builder.query<Pickup, number>({
      query: (id) => `/pickups/${id}`,
      providesTags: (result, error, id) => [{ type: "Pickups", id }],
    }),

    // Legacy — kept for compatibility
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

    // Schedules by type (pickup | dropoff) AND status (pending | completed | cancelled)
    getSchedulesByTypeAndStatus: builder.query<PickupsResponse, ScheduleQueryArg>({
      query: ({ scheduleType, status }) => ({
        url: scheduleUrl(scheduleType, status),
      }),
      providesTags: (result, error, { scheduleType, status }) => [
        { type: "Pickups", id: `${scheduleType}_${status}` },
      ],
    }),
  }),
});

export const {
  useGetPickupsQuery,
  useGetPickupByStatusQuery,
  useGetPickupByIdQuery,
  useGetSchedulesByTypeAndStatusQuery,
} = pickupsApi;
