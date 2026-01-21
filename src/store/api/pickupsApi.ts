import { baseApi } from "./baseApi";

// Types

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
}

export interface PickupsResponse {
  data:{
    data: Pickup[];
    total: number;
    page: number;
    pageSize: number;    
  }

}

export interface PickupsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: Record<string, string>;
}

// Pickups API endpoints
export const pickupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all pickups with pagination
    getPickups: builder.query<PickupsResponse, PickupsParams | void>({
      query: (params) => ({
        url: "/pickups",
        params: params || {},
      }),
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

    // Get single pickup by status
    getPickupByStatus: builder.query<PickupsResponse, string>({
      query: (status) => ({
        url: status === 'pending' ? `/v2/dashboard/details?type=pendingSchedules&page=1` :
        status === 'completed' ? `/v2/dashboard/details?type=totalCompleted&page=1`:
        status === 'missed' ? `/v2/dashboard/details?type=missedPickups&page=1`:
        `/pickups/status/${status}`,
      }),
      providesTags: (result, error, status) => [{ type: "Pickups", status }],
    }),

  }),
});

// Export hooks for usage in components
export const {
  useGetPickupsQuery,
  useGetPickupByStatusQuery,
  useGetPickupByIdQuery
} = pickupsApi;
