import { baseApi } from "./baseApi";

// Types
export interface Pickup {
  id: number;
  location: string;
  phone: string;
  createdDate: string;
  pickupDate: string;
  status?: string;
}

export interface PickupsResponse {
  data: Pickup[];
  total: number;
  page: number;
  pageSize: number;
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
              ...result.data.map(({ id }) => ({ type: "Pickups" as const, id })),
              { type: "Pickups", id: "LIST" },
            ]
          : [{ type: "Pickups", id: "LIST" }],
    }),

    // Get single pickup by ID
    getPickupById: builder.query<Pickup, number>({
      query: (id) => `/pickups/${id}`,
      providesTags: (result, error, id) => [{ type: "Pickups", id }],
    }),

    // Create a new pickup
    createPickup: builder.mutation<Pickup, Partial<Pickup>>({
      query: (body) => ({
        url: "/pickups",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Pickups", id: "LIST" }],
    }),

    // Update a pickup
    updatePickup: builder.mutation<Pickup, { id: number; data: Partial<Pickup> }>({
      query: ({ id, data }) => ({
        url: `/pickups/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Pickups", id },
        { type: "Pickups", id: "LIST" },
      ],
    }),

    // Delete a pickup
    deletePickup: builder.mutation<void, number>({
      query: (id) => ({
        url: `/pickups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Pickups", id },
        { type: "Pickups", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPickupsQuery,
  useGetPickupByIdQuery,
  useCreatePickupMutation,
  useUpdatePickupMutation,
  useDeletePickupMutation,
} = pickupsApi;
