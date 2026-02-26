import { baseApi } from "./baseApi";

/*
 * ════════════════════════════════════════════════════════════════════
 * BACKEND AGENT PROMPT — Financials
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
 * GET /v2/financials/summary
 *   Query (optional): period ("30d"|"3m"|"6m"|"12m"), startDate, endDate
 *   Response: { data: {
 *     totalRevenue, operatingCosts, netProfit, profitMarginPct, momGrowthPct,
 *     monthly: [ { month, schedules, loans, instantBuy, totalRevenue,
 *                  operatingCosts, netProfit } ],  // 12 entries oldest→newest
 *     segments: {
 *       schedules:  { revenue, growthPct, completedCount?, revenuePerSchedule?,
 *                     totalWasteKg? },
 *       loans:      { revenue, growthPct, loanBook?, nplRatio?, collectionRate? },
 *       instantBuy: { revenue, growthPct, gmv?, takeRate?, activeWallets? },
 *     },
 *     costBreakdown: [ { label, amount, pct } ],  // ordered by descending pct
 *   } }
 *   — profitMarginPct, momGrowthPct, growthPct, nplRatio, takeRate are
 *     percentages e.g. 34.2 (not 0.342)
 *   — used by: Financials page — ALL sections (KPI cards, charts, segment
 *     cards, P&L income statement)
 * ════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monthly revenue breakdown by segment — used by the stacked BarChart and P&L AreaChart.
 *
 * Backend MUST return each monthly entry in this shape:
 * {
 *   month:          string,  // short month label e.g. "Jan", "Feb"
 *   schedules:      number,  // ₦ revenue earned from completed waste schedules
 *   loans:          number,  // ₦ interest income collected from loans
 *   instantBuy:     number,  // ₦ fee income from InstantBuy transactions
 *   totalRevenue:   number,  // schedules + loans + instantBuy (should match the sum)
 *   operatingCosts: number,  // total operating costs for this month (optional, can be 0)
 *   netProfit:      number,  // totalRevenue − operatingCosts
 * }
 */
export interface MonthlySegmentRevenue {
  month: string;
  schedules: number;
  loans: number;
  instantBuy: number;
  totalRevenue: number;
  operatingCosts: number;
  netProfit: number;
}

/**
 * Per-segment KPI summary — used by the Segment Performance cards.
 *
 * Backend MUST return each segment's summary in this shape:
 * {
 *   revenue:    number,  // total ₦ revenue for this segment over the selected period
 *   growthPct:  number,  // month-over-month growth % (positive = growth, negative = decline)
 *
 *   // ── Schedules-specific (include when segment === "schedules") ──
 *   completedCount?:     number,  // number of completed pickup/dropoff schedules
 *   revenuePerSchedule?: number,  // revenue ÷ completedCount
 *   totalWasteKg?:       number,  // total kilograms of waste collected
 *
 *   // ── Loans-specific (include when segment === "loans") ──
 *   loanBook?:       number,  // total outstanding loan principal in ₦
 *   nplRatio?:       number,  // non-performing loan ratio % e.g. 3.2 (not 0.032)
 *   collectionRate?: number,  // repayment collection rate % e.g. 92.4 (not 0.924)
 *
 *   // ── InstantBuy-specific (include when segment === "instantBuy") ──
 *   gmv?:          number,  // gross merchandise value (total wallet top-ups) in ₦
 *   takeRate?:     number,  // platform take rate % e.g. 1.8 (not 0.018)
 *   activeWallets?: number, // count of wallets with activity in the period
 * }
 */
export interface SegmentSummary {
  revenue: number;
  growthPct: number;
  // Schedules-specific
  completedCount?: number;
  revenuePerSchedule?: number;
  totalWasteKg?: number;
  // Loans-specific
  loanBook?: number;
  nplRatio?: number;
  collectionRate?: number;
  // InstantBuy-specific
  gmv?: number;
  takeRate?: number;
  activeWallets?: number;
}

/**
 * A single cost category item — used by potential future cost breakdown views.
 *
 * Backend MUST return each entry in this shape:
 * {
 *   label:   string,  // cost category name e.g. "Operations & Logistics"
 *   amount:  number,  // ₦ amount for this category
 *   pct:     number,  // percentage of total costs e.g. 35.0 (not 0.35)
 * }
 */
export interface CostBreakdownItem {
  label: string;
  amount: number;
  pct: number;
}

/**
 * The full financials summary — returned by GET /v2/financials/summary.
 *
 * Backend MUST return:
 * {
 *   data: {
 *     totalRevenue:    number,  // total ₦ revenue across ALL segments for the period
 *     operatingCosts:  number,  // total ₦ operating costs for the period
 *     netProfit:       number,  // totalRevenue − operatingCosts
 *     profitMarginPct: number,  // netProfit / totalRevenue × 100, e.g. 34.2 (not 0.342)
 *     momGrowthPct:    number,  // month-over-month total revenue growth %, e.g. 4.7
 *
 *     monthly: MonthlySegmentRevenue[],  // 12 monthly entries, oldest → newest
 *
 *     segments: {
 *       schedules:  SegmentSummary,  // Schedules segment KPIs (with completedCount, totalWasteKg)
 *       loans:      SegmentSummary,  // Loans segment KPIs (with loanBook, nplRatio, collectionRate)
 *       instantBuy: SegmentSummary,  // InstantBuy segment KPIs (with gmv, takeRate, activeWallets)
 *     },
 *
 *     costBreakdown: CostBreakdownItem[],  // ordered by descending pct; sum should = 100%
 *   }
 * }
 *
 * Used by: Financials page — ALL sections:
 *   - KPI cards (Total Revenue, Net Profit, Profit Margin %, MoM Growth %)
 *   - Monthly Revenue by Segment stacked BarChart
 *   - Revenue Mix donut PieChart (schedules / loans / instantBuy proportions)
 *   - P&L Trend AreaChart (totalRevenue vs netProfit lines)
 *   - P&L Income Statement (current month breakdown: schedules, loans, instantBuy → total → profit)
 *   - Segment Performance cards (one card per segment with KPIs)
 */
export interface FinancialsSummary {
  totalRevenue: number;
  operatingCosts: number;
  netProfit: number;
  profitMarginPct: number;
  momGrowthPct: number;
  monthly: MonthlySegmentRevenue[];
  segments: {
    schedules: SegmentSummary;
    loans: SegmentSummary;
    instantBuy: SegmentSummary;
  };
  costBreakdown: CostBreakdownItem[];
}

export interface FinancialsSummaryResponse {
  data: FinancialsSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const financialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /v2/financials/summary
     *
     * Returns the full cross-segment financial overview for the Financials page.
     *
     * Query params (optional — pass through to backend for filtering):
     *   period    — "30d" | "3m" | "6m" | "12m"  (defaults to "12m")
     *   startDate — ISO date string e.g. "2024-03-01"
     *   endDate   — ISO date string e.g. "2025-02-25"
     *
     * The frontend currently ignores these query params (uses seed data),
     * but the backend should honour them for future live integration.
     *
     * Used by: Financials page — entire page (KPIs, charts, segment cards, income statement).
     */
    getFinancialsSummary: builder.query<FinancialsSummaryResponse, void>({
      query: () => ({ url: "/v2/financials/summary" }),
      providesTags: [{ type: "Dashboard", id: "FINANCIALS_SUMMARY" }],
    }),
  }),
});

export const { useGetFinancialsSummaryQuery } = financialsApi;
