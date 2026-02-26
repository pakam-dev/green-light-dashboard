import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — InstantBuy
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
 * GET /v2/instant-buy/summary
 *   Response: { data: { totalFunded, totalPayments, totalReversals,
 *     netWalletBalance, activeWallets, totalTransactions, successRate,
 *     avgTransactionValue } }
 *   — successRate is a percentage e.g. 94.2 (not 0.942)
 *
 * ── Endpoint 2 ───────────────────────────────────────────────────────
 * GET /v2/instant-buy/transactions
 *   Query: page, pageSize, type ("topup"|"payment"|"reversal"|"all"), status, search
 *   Response: { data: { data: Transaction[], total, page, pageSize } }
 *   — Payment transactions include: materials[], images[], totalWeight, address
 *
 * ── Endpoint 3 ───────────────────────────────────────────────────────
 * GET /v2/instant-buy/monthly-trend
 *   Response: { data: [ { month: "Mar 24", topups, payments, reversals }, ... ] }
 *   — 12 entries oldest → newest
 *
 * ── Endpoint 4 ───────────────────────────────────────────────────────
 * GET /v2/instant-buy/daily-volume
 *   Response: { data: [ { day: "27 Jan", transactions: number }, ... ] }
 *   — 30 entries (last 30 days), oldest → newest
 *
 * ── Endpoint 5 ───────────────────────────────────────────────────────
 * GET /v2/instant-buy/location-stats
 *   Response: { data: [ { state: string, count: number, amount: number }, ... ] }
 *   — sorted descending by count, top 10 Nigerian states
 *   — used by "Top Material Purchase Locations" ranked bar chart
 *
 * Transaction object shape:
 * { id, reference, userName, userPhone, userEmail?, type, amount,
 *   balanceBefore?, balanceAfter?, status, description?, createdAt,
 *   materials?: [{name, kg, pricePerKg}], images?: string[],
 *   totalWeight?, address? }
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three transaction types on the InstantBuy platform.
 *   topup   — user loads money into their wallet
 *   payment — user spends wallet balance to pay for collected waste (Material Purchase)
 *   reversal — a previously failed payment is reversed/refunded
 */
export type TxType   = "topup" | "payment" | "reversal";

/**
 * Lifecycle states for a transaction.
 */
export type TxStatus = "successful" | "failed" | "pending" | "reversed";

/**
 * A single waste material line item within a Material Purchase transaction.
 *
 * Backend MUST return:
 * {
 *   name:        string,  // material category e.g. "PET Bottles", "Cardboard"
 *   kg:          number,  // weight collected in kilograms
 *   pricePerKg:  number,  // price per kilogram in Naira
 * }
 */
export interface WasteMaterial {
  name: string;
  kg: number;
  pricePerKg: number;
}

/**
 * A single InstantBuy transaction record.
 *
 * Backend MUST return each item in this shape:
 * {
 *   id:              string,           // unique transaction ID
 *   reference:       string,           // payment reference e.g. "IB-2025-001234"
 *   userName:        string,           // full name of the wallet owner
 *   userPhone:       string,           // phone number e.g. "08012345678"
 *   userEmail?:      string,           // optional email address
 *   type:            TxType,           // "topup" | "payment" | "reversal"
 *   amount:          number,           // transaction amount in Naira
 *   balanceBefore?:  number,           // wallet balance before this transaction
 *   balanceAfter?:   number,           // wallet balance after this transaction
 *   status:          TxStatus,         // "successful" | "failed" | "pending" | "reversed"
 *   description?:    string,           // optional transaction description/narration
 *   createdAt:       string,           // ISO 8601 timestamp
 *
 *   // ── Fields present ONLY when type === "payment" (Material Purchase) ───
 *   materials?:      WasteMaterial[],  // list of waste materials purchased
 *   images?:         string[],         // URLs of photos taken at point of collection
 *   totalWeight?:    number,           // total kg across all materials in this transaction
 *   address?:        string,           // collection point address
 * }
 */
export interface Transaction {
  id: string;
  reference: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  type: TxType;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  status: TxStatus;
  description?: string;
  createdAt: string;
  // ── Payment-specific fields (present when type === "payment") ──
  materials?: WasteMaterial[];
  images?: string[];
  totalWeight?: number;
  address?: string;
}

/**
 * Paginated list response for transaction queries.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     data:      Transaction[],  // array of transactions for the current page
 *     total:     number,         // total matching transactions (for pagination)
 *     page:      number,         // current page (1-based)
 *     pageSize:  number,         // records per page
 *   }
 * }
 */
export interface InstantBuyTransactionsResponse {
  data: {
    data: Transaction[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * High-level InstantBuy platform summary used by the KPI cards.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     totalFunded:          number,  // total Naira loaded into wallets (all top-ups)
 *     totalPayments:        number,  // total Naira spent on material purchases
 *     totalReversals:       number,  // total Naira reversed/refunded
 *     netWalletBalance:     number,  // totalFunded − totalPayments − totalReversals
 *     activeWallets:        number,  // count of wallets with at least 1 transaction
 *     totalTransactions:    number,  // total count of all transactions
 *     successRate:          number,  // % of successful transactions e.g. 94.2 (not 0.942)
 *     avgTransactionValue:  number,  // average transaction amount in Naira
 *   }
 * }
 *
 * Used by: InstantBuy page — top KPI cards:
 *   Total Funded | Total Payments | Active Wallets | Success Rate | Avg Transaction Value
 */
export interface InstantBuySummary {
  totalFunded: number;
  totalPayments: number;
  totalReversals: number;
  netWalletBalance: number;
  activeWallets: number;
  totalTransactions: number;
  successRate: number;
  avgTransactionValue: number;
}

export interface InstantBuySummaryResponse {
  data: InstantBuySummary;
}

export interface InstantBuyParams {
  page?: number;
  pageSize?: number;
  type?: TxType | "all";
  status?: TxStatus | "all";
  search?: string;
}

/**
 * A single month's InstantBuy volume — used by the Monthly Activity chart.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   month:      string,  // short month label e.g. "Mar 24", "Feb 25"
 *   topups:     number,  // total Naira loaded via top-ups in this month
 *   payments:   number,  // total Naira spent on material purchases in this month
 *   reversals:  number,  // total Naira reversed in this month
 * }
 */
export interface InstantBuyMonthlyData {
  month: string;
  topups: number;
  payments: number;
  reversals: number;
}

/**
 * Response wrapper for the InstantBuy monthly trend endpoint.
 *
 * Backend MUST return:
 * {
 *   data: InstantBuyMonthlyData[]  // 12 entries, oldest → newest
 * }
 *
 * Used by: InstantBuy page — "Monthly Activity" AreaChart (top-ups vs material purchases).
 */
export interface InstantBuyMonthlyTrendResponse {
  data: InstantBuyMonthlyData[];
}

/**
 * A single day's transaction volume — used by the Daily Transaction Volume bar chart.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   day:           string,  // short day label e.g. "01 Feb", "02 Feb"
 *   transactions:  number,  // count of transactions on this day
 * }
 */
export interface InstantBuyDailyData {
  day: string;
  transactions: number;
}

/**
 * Response wrapper for the InstantBuy daily volume endpoint.
 *
 * Backend MUST return:
 * {
 *   data: InstantBuyDailyData[]  // 30 entries (last 30 days), oldest → newest
 * }
 *
 * Used by: InstantBuy page — "Daily Transaction Volume" BarChart.
 */
export interface InstantBuyDailyVolumeResponse {
  data: InstantBuyDailyData[];
}

/**
 * A single location stat for material purchase activity.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   state:   string,  // Nigerian state name e.g. "Lagos", "Abuja (FCT)"
 *   count:   number,  // number of material purchase (payment) transactions from this state
 *   amount:  number,  // total Naira value of purchases from this state
 * }
 */
export interface PurchaseLocationStat {
  state: string;
  count: number;
  amount: number;
}

/**
 * Response wrapper for the InstantBuy location stats endpoint.
 *
 * Backend MUST return:
 * {
 *   data: PurchaseLocationStat[]  // sorted descending by count, top 10 states recommended
 * }
 *
 * Used by: InstantBuy page — "Top Material Purchase Locations" ranked bar chart.
 * The top state is highlighted with a gold trophy badge.
 */
export interface PurchaseLocationStatsResponse {
  data: PurchaseLocationStat[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const instantBuyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/instant-buy/summary
     *
     * Returns the overall InstantBuy platform summary for KPI cards.
     *
     * Used by: InstantBuy page — top KPI hero cards:
     *   Total Funded | Total Material Purchases | Active Wallets | Success Rate | Avg Value
     * Also drives the mini-stats row:
     *   Avg Transaction | Top-ups % | Material Purchase % | Total Users
     */
    getInstantBuySummary: builder.query<InstantBuySummaryResponse, void>({
      query: () => ({ url: "/v2/instant-buy/summary" }),
      providesTags: [{ type: "Dashboard", id: "IB_SUMMARY" }],
    }),

    /**
     * GET /v2/instant-buy/transactions
     *
     * Returns a paginated, filterable list of ALL transaction types (top-ups, payments, reversals).
     * Query params: page, pageSize, type ("topup"|"payment"|"reversal"|"all"), status, search
     *
     * Used by: InstantBuy page — transaction log table (All / Top-ups / Material Purchases / Reversals tabs).
     * The "Material Purchases" tab uses expandable rows to show:
     *   - Waste materials breakdown (name, kg, price/kg)
     *   - Total weight
     *   - Collection point address
     *   - Photos (images array — full URLs)
     */
    getInstantBuyTransactions: builder.query<
      InstantBuyTransactionsResponse,
      InstantBuyParams | void
    >({
      query: (params) => ({ url: "/v2/instant-buy/transactions", params: params || {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }) => ({ type: "Pickups" as const, id })),
              { type: "Pickups", id: "IB_TXN_LIST" },
            ]
          : [{ type: "Pickups", id: "IB_TXN_LIST" }],
    }),

    /**
     * GET /v2/instant-buy/transactions?type=<type>
     *
     * Same as getInstantBuyTransactions but pre-filtered by transaction type.
     *
     * Used by: InstantBuy page — filtered tabs in the transaction log.
     */
    getInstantBuyTransactionsByType: builder.query<
      InstantBuyTransactionsResponse,
      TxType | "all"
    >({
      query: (type) => ({
        url: "/v2/instant-buy/transactions",
        params: type === "all" ? {} : { type },
      }),
      providesTags: (result, error, type) => [
        { type: "Pickups", id: `IB_TXN_${type}` },
      ],
    }),

    /**
     * GET /v2/instant-buy/monthly-trend
     *
     * Returns 12 months of InstantBuy volume data for the trend chart.
     *
     * Expected response:
     * {
     *   data: [
     *     { month: "Mar 24", topups: 4500000, payments: 3510000, reversals: 67500  },
     *     { month: "Apr 24", topups: 4920000, payments: 3837600, reversals: 73800  },
     *     ...  // 12 entries, oldest → newest
     *     { month: "Feb 25", topups: 9800000, payments: 7644000, reversals: 147000 },
     *   ]
     * }
     *
     * Used by: InstantBuy page — "Monthly Activity" AreaChart (top-ups vs material purchases).
     */
    getInstantBuyMonthlyTrend: builder.query<InstantBuyMonthlyTrendResponse, void>({
      query: () => ({ url: "/v2/instant-buy/monthly-trend" }),
      providesTags: [{ type: "Dashboard", id: "IB_MONTHLY_TREND" }],
    }),

    /**
     * GET /v2/instant-buy/daily-volume
     *
     * Returns 30 days of daily transaction counts for the volume bar chart.
     *
     * Expected response:
     * {
     *   data: [
     *     { day: "27 Jan", transactions: 142 },
     *     { day: "28 Jan", transactions: 189 },
     *     ...  // 30 entries, oldest → newest
     *     { day: "25 Feb", transactions: 224 },
     *   ]
     * }
     *
     * Used by: InstantBuy page — "Daily Transaction Volume" BarChart.
     */
    getInstantBuyDailyVolume: builder.query<InstantBuyDailyVolumeResponse, void>({
      query: () => ({ url: "/v2/instant-buy/daily-volume" }),
      providesTags: [{ type: "Dashboard", id: "IB_DAILY_VOLUME" }],
    }),

    /**
     * GET /v2/instant-buy/location-stats
     *
     * Returns material purchase activity grouped by Nigerian state.
     *
     * Expected response:
     * {
     *   data: [
     *     { state: "Lagos",       count: 428, amount: 3724000 },
     *     { state: "Abuja (FCT)", count: 274, amount: 2384800 },
     *     { state: "Rivers",      count: 196, amount: 1705200 },
     *     ...  // sorted descending by count, top 10 states
     *   ]
     * }
     *
     * Used by: InstantBuy page — "Top Material Purchase Locations" ranked bar chart.
     * The top state gets a gold trophy badge. Bars scale relative to the #1 state.
     */
    getInstantBuyLocationStats: builder.query<PurchaseLocationStatsResponse, void>({
      query: () => ({ url: "/v2/instant-buy/location-stats" }),
      providesTags: [{ type: "Dashboard", id: "IB_LOCATION_STATS" }],
    }),
  }),
});

export const {
  useGetInstantBuySummaryQuery,
  useGetInstantBuyTransactionsQuery,
  useGetInstantBuyTransactionsByTypeQuery,
  useGetInstantBuyMonthlyTrendQuery,
  useGetInstantBuyDailyVolumeQuery,
  useGetInstantBuyLocationStatsQuery,
} = instantBuyApi;
