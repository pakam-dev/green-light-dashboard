import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Authentication
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
 * POST /v2/admin/login
 *   Body: { email, password }
 *   Success: { data: { _id, firstname, lastname, fullname, email, phone,
 *     othernames, address, roles, displayRole, token } }
 *   Failure: { message: string, status: 401 }
 *   — token is a JWT Bearer token stored in Redux/localStorage
 *   — sent as "Authorization: Bearer <token>" on all subsequent requests
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * POST /auth/forgot-password
 *   Body: { email }
 *   Success: { message: "Reset link sent to your email" }
 *   — Generate time-limited reset token (1 hour); send reset link via email
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * POST /auth/reset-password
 *   Body: { token, password, confirmPassword }
 *   Success: { message: "Password updated successfully" }
 *   — Validate token (exists + not expired), hash new password, invalidate token
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Request body for admin login.
 *
 * Frontend sends:
 * {
 *   email:     string,  // registered admin email address
 *   password:  string,  // admin password (plain text over HTTPS)
 * }
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response from POST /v2/admin/login on successful authentication.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     _id:          string,  // unique user ID in the database
 *     firstname:    string,  // admin's first name
 *     lastname:     string,  // admin's last name
 *     fullname:     string,  // admin's full display name (firstname + lastname)
 *     email:        string,  // admin's email address
 *     phone:        string,  // admin's phone number
 *     othernames:   string,  // any other names (middle name etc.)
 *     address:      string,  // admin's address
 *     roles:        string,  // raw role string e.g. "admin", "super_admin"
 *     displayRole:  string,  // human-readable role label e.g. "Administrator"
 *     token:        string,  // JWT Bearer token — stored in localStorage/Redux and sent
 *                            // as "Authorization: Bearer <token>" on all subsequent requests
 *   }
 * }
 *
 * On failure (wrong password, not found, suspended):
 * {
 *   message: string,  // error description e.g. "Invalid credentials"
 *   status:  number,  // HTTP status code e.g. 401
 * }
 *
 * Used by: Login page — on successful login, token is stored and user is redirected to /dashboard.
 */
export interface LoginResponse {
  data: {
    _id: string;
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    phone: string;
    othernames: string;
    address: string;
    roles: string;
    displayRole: string;
    token: string;
  };
}

/**
 * Request body for the forgot-password flow.
 *
 * Frontend sends:
 * {
 *   email:  string,  // the admin's registered email address
 * }
 *
 * Backend should trigger a password reset email to this address.
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Request body for the reset-password flow.
 *
 * Frontend sends:
 * {
 *   token:            string,  // the reset token received via email link
 *   password:         string,  // new password chosen by the user
 *   confirmPassword:  string,  // must match password (frontend validates this too)
 * }
 *
 * Backend should validate that token is valid/unexpired and that passwords match,
 * then update the user's password and invalidate the token.
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Generic success response for mutations that return only a message.
 *
 * Backend MUST return:
 * {
 *   message:  string,  // success message e.g. "Reset email sent", "Password updated"
 * }
 */
export interface ApiResponse {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * POST /v2/admin/login
     *
     * Authenticates an admin user and returns a JWT token.
     *
     * Request body: { email, password }
     * Response:     LoginResponse (see type above)
     *
     * On success: store the token from data.token in Redux auth slice / localStorage.
     * On error:   display the error message to the user.
     *
     * Used by: Login page — the sign-in form.
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/v2/admin/login",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /auth/forgot-password
     *
     * Triggers a password reset email to the provided address.
     *
     * Request body: { email }
     * Response:     { message: "Reset link sent to your email" }
     *
     * Backend should:
     *   1. Check that the email belongs to an active admin account
     *   2. Generate a time-limited reset token (e.g. 1 hour expiry)
     *   3. Send a reset link to the email address
     *
     * Used by: Forgot Password page.
     */
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /auth/reset-password
     *
     * Resets the admin's password using the token from the email link.
     *
     * Request body: { token, password, confirmPassword }
     * Response:     { message: "Password updated successfully" }
     *
     * Backend should:
     *   1. Validate the token (exists + not expired)
     *   2. Confirm password === confirmPassword
     *   3. Hash and save the new password
     *   4. Invalidate/delete the reset token
     *
     * Used by: Reset Password page (accessed via email link).
     */
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

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
