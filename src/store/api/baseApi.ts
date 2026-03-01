import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API configuration - update baseUrl when you have your actual API endpoint
// export const baseURL = process.env.REACT_APP_TEST_URL;

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api-revamp.pakam.ng/collector/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Pickups", "Users", "Aggregators", "Dashboard"],
  endpoints: () => ({}),
});
