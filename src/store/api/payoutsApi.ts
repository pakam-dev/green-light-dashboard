import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Wallet Payout Requests
 * ════════════════════════════════════════════════════════════════════
 *
 * Implement the REST endpoints below for a Node.js/Express backend.
 * Rules that apply to ALL endpoints:
 *
 *   AUTH      — Bearer JWT in Authorization header; return 401 if absent/invalid
 *   CURRENCY  — All monetary values in Nigerian Naira (₦), stored as integers
 *   TIMESTAMPS— ISO 8601 strings e.g. "2025-02-11T09:30:00Z"
 *   ERRORS    — { "message": "...", "status": <http_code> }
 *   PAGINATION— 1-based page numbers; always include total, page, pageSize in lists
 *   SORTING   — Default newest-first unless stated otherwise
 *
 * ── Endpoint 1 ───────────────────────────────────────────────────────
 * GET /v2/payouts/summary
 *   Response: { data: PayoutSummary }
 *   — aggregated counts and amounts across all statuses
 *   — used by: Payout page KPI hero cards
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /v2/payouts
 *   Query: page, pageSize, status ("pending"|"approved"|"paid"|"rejected"|"all")
 *   Response: { data: { data: PayoutRequest[], total, page, pageSize } }
 *   — sorted newest-first; filter by status when provided
 *   — used by: Payout page tabbed table
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * PATCH /v2/payouts/:id/approve
 *   Body: {} (empty or optional admin note)
 *   Response: { data: PayoutRequest }  — updated record with status "approved"
 *   — marks the payout as approved; sets processedAt timestamp
 *   — used by: Approve button on pending rows
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * PATCH /v2/payouts/:id/reject
 *   Body: { rejectionReason: string }
 *   Response: { data: PayoutRequest }  — updated record with status "rejected"
 *   — marks the payout as rejected; stores the reason; sets processedAt
 *   — used by: Reject button on pending rows
 *
 * ── Endpoint 5 ───────────────────────────────────────────────────────
 * PATCH /v2/payouts/:id/mark-paid
 *   Body: { reference: string }  — bank transfer reference / transaction ID
 *   Response: { data: PayoutRequest }  — updated record with status "paid"
 *   — marks an approved payout as paid; sets processedAt and reference
 *   — used by: Mark as Paid button on approved rows
 *
 * PayoutRequest object shape:
 * {
 *   id:               string,   // unique payout request ID
 *   userId:           string,   // requesting user's ID
 *   userName:         string,   // requesting user's full name
 *   userPhone:        string,   // user's phone number
 *   userEmail:        string,   // user's email address
 *   amount:           number,   // withdrawal amount in Naira (integer)
 *   bankName:         string,   // destination bank name e.g. "GTBank"
 *   accountNumber:    string,   // 10-digit NUBAN account number
 *   accountName:      string,   // account holder name (may differ from userName)
 *   status:           string,   // "pending" | "approved" | "paid" | "rejected"
 *   requestedAt:      string,   // ISO 8601 timestamp of request creation
 *   processedAt?:     string,   // ISO 8601 timestamp when approved/rejected/paid
 *   reference?:       string,   // bank transfer reference (only when paid)
 *   rejectionReason?: string,   // reason text (only when rejected)
 * }
 *
 * PayoutSummary object shape:
 * {
 *   totalRequests:  number,  // total payout requests ever submitted
 *   totalAmount:    number,  // total ₦ amount ever requested
 *   pendingCount:   number,
 *   pendingAmount:  number,
 *   approvedCount:  number,
 *   approvedAmount: number,
 *   paidCount:      number,
 *   paidAmount:     number,
 *   rejectedCount:  number,
 *   rejectedAmount: number,
 * }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

/**
 * A single wallet payout request submitted by a user.
 */
export interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  reference?: string;
  rejectionReason?: string;
}

/**
 * Aggregated payout summary used by the KPI cards.
 */
export interface PayoutSummary {
  totalRequests: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  paidCount: number;
  paidAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
}

export interface PayoutsResponse {
  data: {
    data: PayoutRequest[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface PayoutSummaryResponse {
  data: PayoutSummary;
}

export interface PayoutsParams {
  page?: number;
  pageSize?: number;
  status?: PayoutStatus | "all";
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const payoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/payouts/summary
     * Returns aggregated counts and amounts for all payout request statuses.
     * Used by: Payout page KPI hero cards.
     */
    getPayoutSummary: builder.query<PayoutSummaryResponse, void>({
      query: () => ({ url: "/v2/payouts/summary" }),
      providesTags: [{ type: "Dashboard", id: "PAYOUT_SUMMARY" }],
    }),

    /**
     * GET /v2/payouts
     * Returns paginated payout requests, optionally filtered by status.
     * Used by: Payout page tabbed table (All / Pending / Approved / Paid / Rejected).
     */
    getPayouts: builder.query<PayoutsResponse, PayoutsParams | void>({
      query: (params) => ({
        url: "/v2/payouts",
        params: params || {},
      }),
      providesTags: [{ type: "Dashboard", id: "PAYOUT_LIST" }],
    }),

    /**
     * PATCH /v2/payouts/:id/approve
     * Approves a pending payout request.
     * Used by: Approve button on pending rows.
     */
    approvePayoutRequest: builder.mutation<{ data: PayoutRequest }, string>({
      query: (id) => ({
        url: `/v2/payouts/${id}/approve`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: [
        { type: "Dashboard", id: "PAYOUT_LIST" },
        { type: "Dashboard", id: "PAYOUT_SUMMARY" },
      ],
    }),

    /**
     * PATCH /v2/payouts/:id/reject
     * Rejects a pending payout request with a reason.
     * Used by: Reject button on pending rows.
     */
    rejectPayoutRequest: builder.mutation<{ data: PayoutRequest }, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/v2/payouts/${id}/reject`,
        method: "PATCH",
        body: { rejectionReason },
      }),
      invalidatesTags: [
        { type: "Dashboard", id: "PAYOUT_LIST" },
        { type: "Dashboard", id: "PAYOUT_SUMMARY" },
      ],
    }),

    /**
     * PATCH /v2/payouts/:id/mark-paid
     * Marks an approved payout as paid with a bank transfer reference.
     * Used by: Mark as Paid button on approved rows.
     */
    markPayoutPaid: builder.mutation<{ data: PayoutRequest }, { id: string; reference: string }>({
      query: ({ id, reference }) => ({
        url: `/v2/payouts/${id}/mark-paid`,
        method: "PATCH",
        body: { reference },
      }),
      invalidatesTags: [
        { type: "Dashboard", id: "PAYOUT_LIST" },
        { type: "Dashboard", id: "PAYOUT_SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetPayoutSummaryQuery,
  useGetPayoutsQuery,
  useApprovePayoutRequestMutation,
  useRejectPayoutRequestMutation,
  useMarkPayoutPaidMutation,
} = payoutsApi;
