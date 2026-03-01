import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Loans
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
 * GET /v2/loans/summary
 *   Response: { data: { totalLoans, activeLoans, pendingLoans, repaidLoans,
 *     defaultedLoans, totalDisbursed, totalRepaid, repaymentRate } }
 *   — repaymentRate is a percentage e.g. 87.4 (not 0.874)
 *   — used by: Loan page KPI hero cards
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /v2/loans
 *   Query: page, pageSize, search, status ("pending"|"active"|"repaid"|"defaulted"|"rejected"|"all")
 *   Response: { data: { data: Loan[], total, page, pageSize } }
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * GET /v2/loans/monthly-trend
 *   Response: { data: [ { month: "Mar 24", disbursed, collected, loans }, ... ] }
 *   — 12 entries oldest → newest; used by Monthly Portfolio Activity chart
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * GET /v2/loans/location-stats
 *   Response: { data: [ { state: string, count: number, amount: number }, ... ] }
 *   — sorted descending by count, top 10 Nigerian states
 *   — used by "Loan Requests by Location" ranked bar chart
 *
 * Loan object shape:
 * { id, borrower: { id, name, email, phone }, amount, amountRepaid, balance,
 *   status, purpose?, disbursedAt?, dueDate?, createdAt,
 *   provider?: string, loanProduct?: string }
 *
 * ── Endpoint 5 ───────────────────────────────────────────────────────
 * GET /v2/loan-products
 *   Response: { data: LoanProduct[] }
 *   — returns all configured loan products, newest-first
 *   — used by: Loan page — Loan Products section
 *
 * ── Endpoint 6 ───────────────────────────────────────────────────────
 * POST /v2/loan-products
 *   Body: { name, provider, interestRate, minAmount, maxAmount, tenure, description? }
 *   Response: { data: LoanProduct }  — the newly created product
 *   — name and provider are required; interestRate is a float (e.g. 12.5 for 12.5%)
 *   — minAmount / maxAmount in Naira (integer); tenure is a free-text string e.g. "12 months"
 *
 * ── Endpoint 7 ───────────────────────────────────────────────────────
 * PATCH /v2/loan-products/:id
 *   Body: Partial<{ name, provider, interestRate, minAmount, maxAmount, tenure, description, isActive }>
 *   Response: { data: LoanProduct }  — the updated product
 *
 * ── Endpoint 8 ───────────────────────────────────────────────────────
 * DELETE /v2/loan-products/:id
 *   Response: { message: "Deleted" }  — 204 or 200 with message
 *   — permanently deletes the loan product
 *
 * LoanProduct object shape:
 * { id, name, provider, interestRate, minAmount, maxAmount, tenure, description?, isActive, createdAt }
 *
 * ── Endpoint 9 ────────────────────────────────────────────────────────
 * GET /v2/loan-providers
 *   Response: { data: LoanProvider[] }
 *   — returns all loan providers, newest-first
 *   — used by: Loan page — Loan Providers section
 *
 * ── Endpoint 10 ───────────────────────────────────────────────────────
 * POST /v2/loan-providers
 *   Body: { name, description?, contactEmail?, contactPhone?, isActive }
 *   Response: { data: LoanProvider }  — the newly created provider
 *   — name is required; isActive defaults to true
 *
 * ── Endpoint 11 ───────────────────────────────────────────────────────
 * PATCH /v2/loan-providers/:id
 *   Body: Partial<{ name, description, contactEmail, contactPhone, isActive }>
 *   Response: { data: LoanProvider }  — the updated provider
 *   — also used to toggle isActive (enable/disable)
 *
 * ── Endpoint 12 ───────────────────────────────────────────────────────
 * DELETE /v2/loan-providers/:id
 *   Response: { message: "Deleted" }  — 204 or 200 with message
 *   — permanently deletes the loan provider
 *
 * LoanProvider object shape:
 * { id, name, description?, contactEmail?, contactPhone?, isActive, createdAt }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type LoanStatus =
  | "pending"
  | "active"
  | "repaid"
  | "defaulted"
  | "rejected";

/**
 * Individual borrower details embedded inside each Loan record.
 *
 * Backend MUST return:
 * {
 *   id:     string,  // unique user ID
 *   name:   string,  // full name of borrower
 *   email:  string,  // borrower's email address
 *   phone:  string,  // borrower's phone number e.g. "08012345678"
 * }
 */
export interface LoanBorrower {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * A single loan record.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:            string,       // unique loan ID
 *   borrower:      LoanBorrower, // embedded borrower object (see above)
 *   amount:        number,       // total loan principal disbursed in Naira (kobo-free)
 *   amountRepaid:  number,       // total amount repaid so far in Naira
 *   balance:       number,       // outstanding balance = amount − amountRepaid
 *   status:        LoanStatus,   // "pending" | "active" | "repaid" | "defaulted" | "rejected"
 *   purpose?:      string,       // optional loan purpose description
 *   disbursedAt?:  string,       // ISO 8601 timestamp when loan was disbursed
 *   dueDate?:      string,       // ISO 8601 timestamp for repayment due date
 *   createdAt:     string,       // ISO 8601 timestamp when application was created
 * }
 */
export interface Loan {
  id: string;
  borrower: LoanBorrower;
  amount: number;
  amountRepaid: number;
  balance: number;
  status: LoanStatus;
  purpose?: string;
  disbursedAt?: string;
  dueDate?: string;
  createdAt: string;
  provider?: string;
  loanProduct?: string;
}

/**
 * Paginated list response for loan queries.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     data:      Loan[],  // array of loan records for the current page
 *     total:     number,  // total matching records (for pagination)
 *     page:      number,  // current page (1-based)
 *     pageSize:  number,  // records per page
 *   }
 * }
 */
export interface LoansResponse {
  data: {
    data: Loan[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * High-level loan portfolio summary used by the KPI cards on the Loan page.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     totalLoans:       number,  // total number of loans ever created
 *     activeLoans:      number,  // count of currently active loans
 *     pendingLoans:     number,  // count of pending (not yet disbursed) applications
 *     repaidLoans:      number,  // count of fully repaid loans
 *     defaultedLoans:   number,  // count of defaulted loans
 *     totalDisbursed:   number,  // total Naira disbursed across all loans (principal)
 *     totalRepaid:      number,  // total Naira repaid across all loans
 *     repaymentRate:    number,  // percentage e.g. 87.4 (not 0.874)
 *   }
 * }
 *
 * Used by: Loan page — KPI cards (Portfolio Value, Outstanding, Recovery, PAR, Avg Loan).
 */
export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  repaidLoans: number;
  defaultedLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  repaymentRate: number;
}

export interface LoanSummaryResponse {
  data: LoanSummary;
}

export interface LoansParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LoanStatus | "all";
}

/**
 * A single month's loan activity — used by the Monthly Portfolio Activity chart.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   month:      string,  // short month label e.g. "Jan 25", "Feb 25"
 *   disbursed:  number,  // total Naira disbursed in this month
 *   collected:  number,  // total Naira collected/repaid in this month
 *   loans:      number,  // number of new loans originated in this month
 * }
 */
export interface LoanMonthlyData {
  month: string;
  disbursed: number;
  collected: number;
  loans: number;
}

/**
 * Response wrapper for the loan monthly trend endpoint.
 *
 * Backend MUST return:
 * {
 *   data: LoanMonthlyData[]  // 12 entries (one per month), oldest first
 * }
 *
 * Used by: Loan page — "Monthly Portfolio Activity" AreaChart and "New Loans Originated" BarChart.
 *
 * Tip: return exactly 12 months going back from today (e.g. Mar 24 → Feb 25).
 */
export interface LoanMonthlyTrendResponse {
  data: LoanMonthlyData[];
}

/**
 * A single location entry used by the "Loan Requests by Location" ranked bar list.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   state:   string,  // Nigerian state name e.g. "Lagos", "Abuja (FCT)"
 *   count:   number,  // number of loan applications from this state
 *   amount:  number,  // total Naira amount of all loans from this state
 * }
 */
export interface LoanLocationStat {
  state: string;
  count: number;
  amount: number;
}

/**
 * Response wrapper for the loan location stats endpoint.
 *
 * Backend MUST return:
 * {
 *   data: LoanLocationStat[]  // sorted descending by count, top 10 states recommended
 * }
 *
 * Used by: Loan page — "Loan Requests by Location" section with ranked progress bars.
 * The top location is highlighted with a gold trophy badge.
 */
export interface LoanLocationStatsResponse {
  data: LoanLocationStat[];
}

/**
 * A configured loan product available on the platform.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:            string,   // unique product ID
 *   name:          string,   // product name e.g. "Business Loan"
 *   provider:      string,   // lending institution / provider name
 *   interestRate:  number,   // annual interest rate as a float e.g. 12.5
 *   minAmount:     number,   // minimum loan amount in Naira
 *   maxAmount:     number,   // maximum loan amount in Naira
 *   tenure:        string,   // repayment period e.g. "12 months"
 *   description?:  string,   // optional product description
 *   isActive?:     boolean,  // whether product is currently enabled
 *   createdAt:     string,   // ISO 8601 creation timestamp
 * }
 */
export interface LoanProduct {
  id: string;
  name: string;
  provider: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  tenure: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface LoanProductsResponse {
  data: LoanProduct[];
}

/**
 * A loan provider (lending institution) registered on the platform.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:             string,   // unique provider ID
 *   name:           string,   // provider / institution name
 *   description?:   string,   // optional description
 *   contactEmail?:  string,   // contact email
 *   contactPhone?:  string,   // contact phone number
 *   isActive:       boolean,  // whether provider is currently enabled
 *   createdAt:      string,   // ISO 8601 creation timestamp
 * }
 */
export interface LoanProvider {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoanProvidersResponse {
  data: LoanProvider[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const loanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/loans/summary
     *
     * Returns the overall loan portfolio summary: totals, counts, and repayment rate.
     *
     * Used by: Loan page — 5 KPI hero cards at the top.
     *   Card 1: Total Portfolio Value = totalDisbursed
     *   Card 2: Outstanding Balance   = totalDisbursed − totalRepaid
     *   Card 3: Total Recovered       = totalRepaid (+ repaymentRate %)
     *   Card 4: Portfolio at Risk     = defaultedLoans / totalLoans × 100
     *   Card 5: Avg. Loan Size        = totalDisbursed / totalLoans
     */
    getLoanSummary: builder.query<LoanSummaryResponse, void>({
      query: () => ({ url: "/v2/loans/summary" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_SUMMARY" }],
    }),

    /**
     * GET /v2/loans
     *
     * Returns a paginated list of all loans regardless of status.
     * Query params: page, pageSize, search, status
     *
     * Used by: Loan page — "All Loans" tab in the Loan Records table.
     */
    getLoans: builder.query<LoansResponse, LoansParams | void>({
      query: (params) => ({
        url: "/v2/loans",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }) => ({
                type: "Pickups" as const,
                id,
              })),
              { type: "Pickups", id: "LOAN_LIST" },
            ]
          : [{ type: "Pickups", id: "LOAN_LIST" }],
    }),

    /**
     * GET /v2/loans?status=<status>  OR  GET /v2/loans  (when status === "all")
     *
     * Returns loans filtered by status for the tabbed table on the Loan page.
     *
     * Used by: Loan page — each status tab (All / Pending / Active / Repaid / Defaulted).
     * The table renders: Borrower name/phone, Loan Amount, Repayment Progress bar,
     * Balance (red if > 0), Status badge, Disbursed date, Due date.
     */
    getLoansByStatus: builder.query<LoansResponse, LoanStatus | "all">({
      query: (status) => ({
        url:
          status === "all"
            ? "/v2/loans"
            : `/v2/loans?status=${status}`,
      }),
      providesTags: (result, error, status) => [
        { type: "Pickups", id: `LOAN_${status}` },
      ],
    }),

    /**
     * GET /v2/loans/monthly-trend
     *
     * Returns 12 months of loan activity data for the trend charts.
     *
     * Expected response:
     * {
     *   data: [
     *     { month: "Mar 24", disbursed: 3800000, collected: 2950000, loans: 62 },
     *     { month: "Apr 24", disbursed: 4100000, collected: 3200000, loans: 67 },
     *     ...  // 12 entries, oldest → newest
     *     { month: "Feb 25", disbursed: 6200000, collected: 5100000, loans: 95 },
     *   ]
     * }
     *
     * Used by:
     *   - Loan page — "Monthly Portfolio Activity" AreaChart (disbursed vs collected lines)
     *   - Loan page — "New Loans Originated" BarChart (loans count per month)
     */
    getLoanMonthlyTrend: builder.query<LoanMonthlyTrendResponse, void>({
      query: () => ({ url: "/v2/loans/monthly-trend" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_MONTHLY_TREND" }],
    }),

    /**
     * GET /v2/loans/location-stats
     *
     * Returns the number of loan requests grouped by Nigerian state.
     *
     * Expected response:
     * {
     *   data: [
     *     { state: "Lagos",       count: 312, amount: 8736000 },
     *     { state: "Abuja (FCT)", count: 248, amount: 6944000 },
     *     { state: "Rivers",      count: 186, amount: 5208000 },
     *     ...  // sorted descending by count, top 10 states
     *   ]
     * }
     *
     * Used by: Loan page — "Loan Requests by Location" ranked bar chart.
     * The top state gets a gold trophy badge. Bars scale relative to the #1 state.
     */
    getLoanLocationStats: builder.query<LoanLocationStatsResponse, void>({
      query: () => ({ url: "/v2/loans/location-stats" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_LOCATION_STATS" }],
    }),

    /**
     * GET /v2/loan-products
     *
     * Returns all configured loan products, newest-first.
     * Used by: Loan page — Loan Products section (list, create, edit, delete, toggle).
     */
    getLoanProducts: builder.query<LoanProductsResponse, void>({
      query: () => ({ url: "/v2/loan-products" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_PRODUCTS" }],
    }),

    /**
     * POST /v2/loan-products
     *
     * Creates a new loan product.
     * Body: { name, provider, interestRate, minAmount, maxAmount, tenure, description? }
     */
    createLoanProduct: builder.mutation<{ data: LoanProduct }, Omit<LoanProduct, "id" | "createdAt">>({
      query: (body) => ({
        url: "/v2/loan-products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PRODUCTS" }],
    }),

    /**
     * PATCH /v2/loan-products/:id
     *
     * Updates an existing loan product (including toggling isActive).
     * Body: Partial<{ name, provider, interestRate, minAmount, maxAmount, tenure, description, isActive }>
     */
    updateLoanProduct: builder.mutation<{ data: LoanProduct }, { id: string; data: Partial<Omit<LoanProduct, "id" | "createdAt">> }>({
      query: ({ id, data }) => ({
        url: `/v2/loan-products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PRODUCTS" }],
    }),

    /**
     * DELETE /v2/loan-products/:id
     *
     * Permanently deletes a loan product.
     */
    deleteLoanProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/loan-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PRODUCTS" }],
    }),

    /**
     * GET /v2/loan-providers
     *
     * Returns all loan providers, newest-first.
     * Used by: Loan page — Loan Providers section (list, create, edit, delete, toggle).
     */
    getLoanProviders: builder.query<LoanProvidersResponse, void>({
      query: () => ({ url: "/v2/loan-providers" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_PROVIDERS" }],
    }),

    /**
     * POST /v2/loan-providers
     *
     * Creates a new loan provider.
     * Body: { name, description?, contactEmail?, contactPhone?, isActive }
     */
    createLoanProvider: builder.mutation<{ data: LoanProvider }, Omit<LoanProvider, "id" | "createdAt">>({
      query: (body) => ({
        url: "/v2/loan-providers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PROVIDERS" }],
    }),

    /**
     * PATCH /v2/loan-providers/:id
     *
     * Updates a loan provider (including toggling isActive for enable/disable).
     * Body: Partial<{ name, description, contactEmail, contactPhone, isActive }>
     */
    updateLoanProvider: builder.mutation<{ data: LoanProvider }, { id: string; data: Partial<Omit<LoanProvider, "id" | "createdAt">> }>({
      query: ({ id, data }) => ({
        url: `/v2/loan-providers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PROVIDERS" }],
    }),

    /**
     * DELETE /v2/loan-providers/:id
     *
     * Permanently deletes a loan provider.
     */
    deleteLoanProvider: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/loan-providers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LOAN_PROVIDERS" }],
    }),
  }),
});

export const {
  useGetLoanSummaryQuery,
  useGetLoansQuery,
  useGetLoansByStatusQuery,
  useGetLoanMonthlyTrendQuery,
  useGetLoanLocationStatsQuery,
  useGetLoanProductsQuery,
  useCreateLoanProductMutation,
  useUpdateLoanProductMutation,
  useDeleteLoanProductMutation,
  useGetLoanProvidersQuery,
  useCreateLoanProviderMutation,
  useUpdateLoanProviderMutation,
  useDeleteLoanProviderMutation,
} = loanApi;
