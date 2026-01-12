import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API configuration - update baseUrl when you have your actual API endpoint
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api", // Update this to your actual API base URL
    prepareHeaders: (headers) => {
      // Add auth token or other headers here if needed
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),
  tagTypes: ["Pickups", "Users", "Aggregators", "Dashboard"],
  endpoints: () => ({}),
});
