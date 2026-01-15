import { baseApi } from "./baseApi";

/* ---------------- TYPES ---------------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse {
  message: string;
}

/* ---------------- API ---------------- */

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- LOGIN ---------- */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/v2/admin/login",
        method: "POST",
        body,
      }),
    }),

    /* ----- FORGOT PASSWORD ----- */
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    /* ----- RESET PASSWORD ----- */
    resetPassword: builder.mutation<ApiResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

/* ---------------- HOOKS ---------------- */

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
