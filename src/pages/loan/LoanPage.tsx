import { useState, useMemo } from "react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Banknote,
  Wallet,
  ArrowUpRight,
  MapPin,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReusableDataTable, TableColumn } from "@/components/dashboard/ReusableDataTable";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useGetLoanSummaryQuery,
  useGetLoansByStatusQuery,
  useGetLoanMonthlyTrendQuery,
  useGetLoanLocationStatsQuery,
  Loan,
  LoanStatus,
} from "@/store/api/loanApi";

// ── Formatters ───────────────────────────────────────────────────────────────

function naira(val: number) {
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000)     return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)         return `₦${(val / 1_000).toFixed(0)}k`;
  return `₦${val.toLocaleString()}`;
}
function nairaFull(val: number) {
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

// ── Portfolio health donut ───────────────────────────────────────────────────

const DONUT_COLORS = {
  active:    "#2563eb",
  repaid:    "#16a34a",
  pending:   "#d97706",
  defaulted: "#dc2626",
};

const CustomDonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-2.5 text-sm">
      <span className="font-semibold capitalize">{d.name}</span>
      <span className="ml-2 text-muted-foreground tabular-nums">{d.value.toLocaleString()} loans</span>
    </div>
  );
};

const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}:{" "}
          <span className="font-medium" style={{ color: p.color }}>
            {naira(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LoanStatus, string> = {
  pending:   "bg-amber-50  text-amber-600  border-amber-200",
  active:    "bg-blue-50   text-blue-600   border-blue-200",
  repaid:    "bg-green-50  text-green-700  border-green-200",
  defaulted: "bg-red-50    text-red-600    border-red-200",
  rejected:  "bg-gray-100  text-gray-500   border-gray-200",
};

const StatusBadge = ({ status }: { status: LoanStatus }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
    {status}
  </span>
);

// ── Repayment bar ─────────────────────────────────────────────────────────────

const RepaymentBar = ({ repaid, total }: { repaid: number; total: number }) => {
  const pct = total > 0 ? Math.min((repaid / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
};

// ── Table columns ─────────────────────────────────────────────────────────────

const columns: TableColumn<Loan>[] = [
  {
    key: "borrower",
    header: "Borrower",
    render: (row) => (
      <div>
        <p className="font-medium text-foreground text-sm">{row.borrower?.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{row.borrower?.phone ?? ""}</p>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Loan Amount",
    render: (row) => <span className="font-semibold tabular-nums">{nairaFull(row.amount)}</span>,
  },
  {
    key: "amountRepaid",
    header: "Repayment Progress",
    render: (row) => (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground tabular-nums">
          {nairaFull(row.amountRepaid)} of {nairaFull(row.amount)}
        </p>
        <RepaymentBar repaid={row.amountRepaid} total={row.amount} />
      </div>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    render: (row) => (
      <span className={`tabular-nums font-semibold ${row.balance > 0 ? "text-red-500" : "text-green-600"}`}>
        {nairaFull(row.balance)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "disbursedAt",
    header: "Disbursed",
    render: (row) => <span className="text-sm text-muted-foreground">{fmtDate(row.disbursedAt)}</span>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (row) => <span className="text-sm text-muted-foreground">{fmtDate(row.dueDate)}</span>,
  },
];

interface FlatLoan extends Loan { borrowerName: string; borrowerPhone: string; }
function flattenLoans(loans: Loan[]): FlatLoan[] {
  return loans.map((l) => ({ ...l, borrowerName: l.borrower?.name ?? "", borrowerPhone: l.borrower?.phone ?? "" }));
}

// ── Loan table ────────────────────────────────────────────────────────────────

const LoanTable = ({ loans, isLoading, emptyMessage }: { loans: Loan[]; isLoading: boolean; emptyMessage: string }) => {
  const flat = useMemo(() => flattenLoans(loans), [loans]);
  const tableState = useDataTable({ data: flat, searchableFields: ["borrowerName", "borrowerPhone"], initialPageSize: 10 });
  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns as TableColumn<FlatLoan>[]}
      searchPlaceholder="Search by name or phone…"
      emptyMessage={emptyMessage}
      showFilter={true}
      showExport={true}
      showRefresh={true}
    />
  );
};

// ── Tab config ────────────────────────────────────────────────────────────────

type TabValue = "all" | LoanStatus;

const TABS: { value: TabValue; label: string; emptyMessage: string }[] = [
  { value: "all",       label: "All Loans", emptyMessage: "No loan records found"        },
  { value: "pending",   label: "Pending",   emptyMessage: "No pending loan applications" },
  { value: "active",    label: "Active",    emptyMessage: "No active loans"              },
  { value: "repaid",    label: "Repaid",    emptyMessage: "No repaid loans"              },
  { value: "defaulted", label: "Defaulted", emptyMessage: "No defaulted loans"          },
];

const TabContent = ({ status, emptyMessage }: { status: TabValue; emptyMessage: string }) => {
  const { data, isLoading } = useGetLoansByStatusQuery(status);
  return <LoanTable loans={data?.data?.data ?? []} isLoading={isLoading} emptyMessage={emptyMessage} />;
};

// ── KPI Hero Card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: string; up: boolean } | null;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
  isLoading: boolean;
}

const KpiCard = ({ label, value, sub, trend, icon: Icon, iconBg, iconColor, highlight, isLoading }: KpiCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm flex flex-col gap-3 ${
    highlight ? "bg-primary border-primary/20" : "bg-white border-border"
  }`}>
    <div className="flex items-start justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? "bg-white/15" : iconBg}`}>
        <Icon className={`h-5 w-5 ${highlight ? "text-white" : iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          trend.up
            ? highlight ? "bg-white/20 text-white" : "bg-green-50 text-green-700"
            : highlight ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
        }`}>
          {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value}
        </div>
      )}
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-medium uppercase tracking-wide ${highlight ? "text-white/70" : "text-muted-foreground"}`}>
        {label}
      </p>
      {isLoading ? (
        <div className={`mt-1.5 h-8 w-32 animate-pulse rounded ${highlight ? "bg-white/20" : "bg-muted"}`} />
      ) : (
        <p className={`text-2xl font-bold tabular-nums mt-0.5 ${highlight ? "text-white" : "text-foreground"}`}>
          {value}
        </p>
      )}
      {sub && !isLoading && (
        <p className={`text-xs mt-1 ${highlight ? "text-white/60" : "text-muted-foreground"}`}>{sub}</p>
      )}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const LoanPage = () => {
  const [period, setPeriod] = useState("12m");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const { data: summaryRes, isLoading: summaryLoading } = useGetLoanSummaryQuery();
  const summary = summaryRes?.data;

  const { data: monthlyTrendRes } = useGetLoanMonthlyTrendQuery();
  const { data: locationRes }     = useGetLoanLocationStatsQuery();

  const monthlyData  = monthlyTrendRes?.data ?? [];
  const locationData = locationRes?.data     ?? [];

  // Portfolio health donut data (from real summary)
  const donutData = useMemo(
    () => [
      { name: "Active",    value: summary?.activeLoans    ?? 0, color: DONUT_COLORS.active    },
      { name: "Repaid",    value: summary?.repaidLoans    ?? 0, color: DONUT_COLORS.repaid    },
      { name: "Pending",   value: summary?.pendingLoans   ?? 0, color: DONUT_COLORS.pending   },
      { name: "Defaulted", value: summary?.defaultedLoans ?? 0, color: DONUT_COLORS.defaulted },
    ],
    [summary]
  );

  const outstanding   = (summary?.totalDisbursed ?? 0) - (summary?.totalRepaid ?? 0);
  const par           = summary?.totalLoans
    ? ((summary.defaultedLoans / summary.totalLoans) * 100).toFixed(1)
    : "0.0";
  const avgLoan       = summary?.totalLoans
    ? (summary.totalDisbursed / summary.totalLoans)
    : 0;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Loan Portfolio</h1>
            <p className="text-sm text-muted-foreground">Platform-wide loan performance overview</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
        </div>
      </div>

      {/* ── Hero KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Portfolio Value"
          value={naira(summary?.totalDisbursed ?? 0)}
          sub={`${(summary?.totalLoans ?? 0).toLocaleString()} total loans issued`}
          trend={{ value: "12.4%", up: true }}
          icon={Landmark}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          highlight={true}
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Outstanding Balance"
          value={naira(outstanding)}
          sub="Active + pending balance"
          trend={null}
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Total Recovered"
          value={naira(summary?.totalRepaid ?? 0)}
          sub={`${(summary?.repaymentRate ?? 0).toFixed(1)}% repayment rate`}
          trend={{ value: "2.1%", up: true }}
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Portfolio at Risk"
          value={`${par}%`}
          sub={`${summary?.defaultedLoans ?? 0} defaulted loans`}
          trend={{ value: "0.3%", up: false }}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Avg. Loan Size"
          value={naira(avgLoan)}
          sub={`${summary?.activeLoans ?? 0} active borrowers`}
          trend={null}
          icon={Banknote}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          isLoading={summaryLoading}
        />
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Disbursement vs Collection trend — 2/3 width */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground">Monthly Portfolio Activity</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Loan disbursements vs. repayments collected
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#008300" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#008300" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={naira} width={64} />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-muted-foreground capitalize">{v}</span>}
                />
                <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#008300" strokeWidth={2.5}
                  fill="url(#disbursedGrad)" dot={false} activeDot={{ r: 4, fill: "#008300" }} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#2563eb" strokeWidth={2.5}
                  fill="url(#collectedGrad)" dot={false} activeDot={{ r: 4, fill: "#2563eb" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio health donut — 1/3 width */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Portfolio Health</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Loan status distribution</p>
          </div>

          {/* Donut */}
          <div className="flex-1 flex items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{d.name}</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {summaryLoading
                      ? "—"
                      : d.value.toLocaleString()
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Monthly new loans bar chart ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">New Loans Originated</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Number of new loans issued per month</p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), "Loans"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.07)" }}
              />
              <Bar dataKey="loans" name="New Loans" fill="#008300" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Location breakdown ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-foreground">Loan Requests by Location</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Top states ranked by number of loan requests</p>
          </div>
          {/* Top location badge — only shown when data is available */}
          {locationData.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wide">Top Location</p>
                <p className="text-sm font-bold text-amber-700">{locationData[0].state}</p>
              </div>
            </div>
          )}
        </div>

        {locationData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {locationData.map((loc, i) => {
                const barPct = (loc.count / (locationData[0]?.count ?? 1)) * 100;
                const isTop  = i === 0;
                return (
                  <div key={loc.state} className="flex items-center gap-3">
                    {/* Rank */}
                    <span className={`w-5 text-xs font-bold shrink-0 text-right ${isTop ? "text-amber-500" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    {/* Icon */}
                    <MapPin className={`h-3.5 w-3.5 shrink-0 ${isTop ? "text-amber-500" : "text-muted-foreground"}`} />
                    {/* State name */}
                    <span className={`w-32 text-sm shrink-0 ${isTop ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {loc.state}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, background: isTop ? "#d97706" : "#008300" }}
                      />
                    </div>
                    {/* Count */}
                    <span className="w-10 text-right text-sm font-semibold tabular-nums text-foreground shrink-0">
                      {loc.count}
                    </span>
                    {/* Amount */}
                    <span className="w-20 text-right text-xs text-muted-foreground tabular-nums shrink-0">
                      {naira(loc.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-right">
              Total: {locationData.reduce((s, l) => s + l.count, 0).toLocaleString()} requests · {naira(locationData.reduce((s, l) => s + l.amount, 0))}
            </p>
          </>
        )}
      </div>

      {/* ── Loan records table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">Loan Records</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detailed list of all loan activities and repayment status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="h-10 bg-muted/50 border border-border rounded-xl p-1 flex-wrap gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4 focus-visible:outline-none">
              <TabContent status={tab.value} emptyMessage={tab.emptyMessage} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default LoanPage;
