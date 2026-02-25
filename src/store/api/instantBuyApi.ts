import { baseApi } from "./baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export type TxType   = "topup" | "payment" | "reversal";
export type TxStatus = "successful" | "failed" | "pending" | "reversed";

export interface WasteMaterial {
  name: string;
  kg: number;
  pricePerKg: number;
}

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

export interface InstantBuyTransactionsResponse {
  data: {
    data: Transaction[];
    total: number;
    page: number;
    pageSize: number;
  };
}

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

// ── Endpoints ──────────────────────────────────────────────────────────────

export const instantBuyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstantBuySummary: builder.query<InstantBuySummaryResponse, void>({
      query: () => ({ url: "/v2/instant-buy/summary" }),
      providesTags: [{ type: "Dashboard", id: "IB_SUMMARY" }],
    }),

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
  }),
});

export const {
  useGetInstantBuySummaryQuery,
  useGetInstantBuyTransactionsQuery,
  useGetInstantBuyTransactionsByTypeQuery,
} = instantBuyApi;
