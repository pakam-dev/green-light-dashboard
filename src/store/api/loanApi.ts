import { baseApi } from "./baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export type LoanStatus =
  | "pending"
  | "active"
  | "repaid"
  | "defaulted"
  | "rejected";

export interface LoanBorrower {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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
}

export interface LoansResponse {
  data: {
    data: Loan[];
    total: number;
    page: number;
    pageSize: number;
  };
}

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

// ── Endpoints ──────────────────────────────────────────────────────────────

export const loanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoanSummary: builder.query<LoanSummaryResponse, void>({
      query: () => ({ url: "/v2/loans/summary" }),
      providesTags: [{ type: "Dashboard", id: "LOAN_SUMMARY" }],
    }),

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
  }),
});

export const {
  useGetLoanSummaryQuery,
  useGetLoansQuery,
  useGetLoansByStatusQuery,
} = loanApi;
