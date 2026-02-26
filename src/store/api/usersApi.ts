import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Users
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
 * GET /users
 *   Query: page, pageSize, search (name/email/phone), role, status
 *   Response: { data: User[], total, page, pageSize }
 *   NOTE: data is at top level, NOT nested under a "data" key
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /users/:id
 *   Response: User (single object, not wrapped)
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * POST /users
 *   Body: { name, email, phone, role, ... }
 *   Response: User (the newly created record with id and createdAt)
 *   — Validate email/phone uniqueness; hash password if provided
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * PATCH /users/:id
 *   Body: Partial<User> (only fields to update)
 *   Response: User (updated record)
 *
 * ── Endpoint 5 ───────────────────────────────────────────────────────
 * DELETE /users/:id
 *   Response: 204 No Content
 *   — Deactivate/reassign linked schedules & loans; log deletion for audit
 *
 * User object shape:
 * { id: number, name, email, phone, role, createdAt, status: "active"|"inactive" }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single platform user record.
 *
 * Backend MUST return each user in this shape:
 * {
 *   id:         number,               // unique user ID
 *   name:       string,               // full name of the user
 *   email:      string,               // user's email address
 *   phone:      string,               // user's phone number e.g. "08012345678"
 *   role:       string,               // user role e.g. "user", "aggregator", "admin"
 *   createdAt:  string,               // ISO 8601 timestamp of account creation
 *   status:     "active" | "inactive" // account status
 * }
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  status: "active" | "inactive";
}

/**
 * Paginated list response for user queries.
 *
 * Backend MUST return:
 * {
 *   data:      User[],  // array of users for the current page
 *   total:     number,  // total matching users (for pagination)
 *   page:      number,  // current page (1-based)
 *   pageSize:  number,  // records per page
 * }
 *
 * NOTE: Unlike most other list endpoints, this response wraps data at the
 * top level (not nested under a "data" key). Keep this consistent.
 *
 * Used by: Users page — paginated user table.
 */
export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Query parameters for filtering and paginating users.
 */
export interface UsersParams {
  page?: number;
  pageSize?: number;
  search?: string;    // free-text search on name, email, or phone
  role?: string;      // filter by role: "user" | "aggregator" | "admin"
  status?: string;    // filter by status: "active" | "inactive"
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /users
     *
     * Returns a paginated, searchable list of all platform users.
     * Query params: page, pageSize, search, role, status
     *
     * Expected response: UsersResponse (see type above)
     *
     * Used by: Users page — main user data table with search and status filtering.
     */
    getUsers: builder.query<UsersResponse, UsersParams | void>({
      query: (params) => ({
        url: "/users",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    /**
     * GET /users/:id
     *
     * Returns a single user record by their ID.
     *
     * Expected response: User (see type above — not wrapped)
     *
     * Used by: User detail/profile views.
     */
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    /**
     * POST /users
     *
     * Creates a new user account.
     *
     * Request body: Partial<User> — provide name, email, phone, role at minimum.
     * Response: the newly created User object with its assigned id and createdAt.
     *
     * Backend should:
     *   1. Validate that email/phone is unique
     *   2. Hash any password if provided
     *   3. Return the full created user object
     *
     * Used by: User management — "Add User" form/dialog.
     */
    createUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    /**
     * PATCH /users/:id
     *
     * Partially updates an existing user's profile.
     *
     * Request body: Partial<User> — only the fields to update.
     * Response: the updated User object.
     *
     * Used by: User management — "Edit User" form/dialog.
     */
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    /**
     * DELETE /users/:id
     *
     * Permanently deletes a user account.
     *
     * Response: 204 No Content (no body)
     *
     * Backend should also:
     *   - Deactivate or reassign any active schedules/loans linked to this user
     *   - Log the deletion for audit purposes
     *
     * Used by: User management — "Delete User" confirmation dialog.
     */
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
