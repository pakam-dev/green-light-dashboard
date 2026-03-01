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
  Plus,
  Pencil,
  Package,
  Trash2,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
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
  useGetLoanProductsQuery,
  useCreateLoanProductMutation,
  useUpdateLoanProductMutation,
  useDeleteLoanProductMutation,
  useGetLoanProvidersQuery,
  useCreateLoanProviderMutation,
  useUpdateLoanProviderMutation,
  useDeleteLoanProviderMutation,
  Loan,
  LoanStatus,
  LoanProduct,
  LoanProvider,
} from "@/store/api/loanApi";
import {
  MOCK_LOAN_SUMMARY,
  MOCK_LOAN_MONTHLY,
  MOCK_LOAN_LOCATION,
  MOCK_LOAN_PRODUCTS,
  MOCK_LOAN_PROVIDERS,
  MOCK_LOANS,
} from "@/mock/mockData";

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
    key: "provider",
    header: "Provider",
    render: (row) => (
      <span className="text-sm text-muted-foreground">{row.provider ?? "—"}</span>
    ),
  },
  {
    key: "loanProduct",
    header: "Loan Product",
    render: (row) => row.loanProduct
      ? <Badge variant="outline" className="text-xs capitalize">{row.loanProduct}</Badge>
      : <span className="text-sm text-muted-foreground">—</span>,
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
  return loans.map((l) => ({
    ...l,
    borrowerName: l.borrower?.name ?? "",
    borrowerPhone: l.borrower?.phone ?? "",
    provider: l.provider,
    loanProduct: l.loanProduct,
  }));
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
  const apiLoans = data?.data?.data ?? [];
  const loans = apiLoans.length > 0
    ? apiLoans
    : (MOCK_LOANS as Loan[]).filter((l) => status === "all" || l.status === status);
  return <LoanTable loans={loans} isLoading={isLoading} emptyMessage={emptyMessage} />;
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

const EMPTY_FORM = { name: "", provider: "", interestRate: "", minAmount: "", maxAmount: "", tenure: "", description: "" };
const EMPTY_PROVIDER_FORM = { name: "", description: "", contactEmail: "", contactPhone: "" };

const LoanPage = () => {
  const [period, setPeriod] = useState("12m");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  // ── Shared delete confirm state ──────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "provider" | "product"; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Loan Providers state ─────────────────────────────────────────────────
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider]       = useState<LoanProvider | null>(null);
  const [providerForm, setProviderForm]             = useState(EMPTY_PROVIDER_FORM);
  const [providerSaving, setProviderSaving]         = useState(false);

  const { data: providersRes, isLoading: providersLoading } = useGetLoanProvidersQuery();
  const [createLoanProvider] = useCreateLoanProviderMutation();
  const [updateLoanProvider] = useUpdateLoanProviderMutation();
  const [deleteLoanProvider] = useDeleteLoanProviderMutation();

  const providers = (providersRes?.data?.length ? providersRes.data : MOCK_LOAN_PROVIDERS) as LoanProvider[];

  function openProviderDialog(provider: LoanProvider | null) {
    setEditingProvider(provider);
    setProviderForm(
      provider
        ? {
            name:         provider.name,
            description:  provider.description ?? "",
            contactEmail: provider.contactEmail ?? "",
            contactPhone: provider.contactPhone ?? "",
          }
        : EMPTY_PROVIDER_FORM,
    );
    setProviderDialogOpen(true);
  }

  async function handleProviderSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProviderSaving(true);
    const payload = {
      name:         providerForm.name.trim(),
      description:  providerForm.description.trim() || undefined,
      contactEmail: providerForm.contactEmail.trim() || undefined,
      contactPhone: providerForm.contactPhone.trim() || undefined,
      isActive:     editingProvider ? editingProvider.isActive : true,
    };
    try {
      if (editingProvider) {
        await updateLoanProvider({ id: editingProvider.id, data: payload }).unwrap();
      } else {
        await createLoanProvider(payload).unwrap();
      }
      setProviderDialogOpen(false);
    } finally {
      setProviderSaving(false);
    }
  }

  // ── Loan Products state ──────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [saving, setSaving]                 = useState(false);
  const [productToggling, setProductToggling] = useState<string | null>(null);

  const { data: productsRes, isLoading: productsLoading } = useGetLoanProductsQuery();
  const [createLoanProduct] = useCreateLoanProductMutation();
  const [updateLoanProduct] = useUpdateLoanProductMutation();
  const [deleteLoanProduct] = useDeleteLoanProductMutation();

  const products = (productsRes?.data?.length ? productsRes.data : MOCK_LOAN_PRODUCTS) as LoanProduct[];

  function openDialog(product: LoanProduct | null) {
    setEditingProduct(product);
    setForm(
      product
        ? {
            name:         product.name,
            provider:     product.provider,
            interestRate: String(product.interestRate),
            minAmount:    String(product.minAmount),
            maxAmount:    String(product.maxAmount),
            tenure:       product.tenure,
            description:  product.description ?? "",
          }
        : EMPTY_FORM,
    );
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name:         form.name.trim(),
      provider:     form.provider.trim(),
      interestRate: parseFloat(form.interestRate) || 0,
      minAmount:    parseInt(form.minAmount, 10) || 0,
      maxAmount:    parseInt(form.maxAmount, 10) || 0,
      tenure:       form.tenure.trim(),
      description:  form.description.trim() || undefined,
    };
    try {
      if (editingProduct) {
        await updateLoanProduct({ id: editingProduct.id, data: payload }).unwrap();
      } else {
        await createLoanProduct(payload).unwrap();
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleProduct(product: LoanProduct) {
    setProductToggling(product.id);
    try {
      await updateLoanProduct({ id: product.id, data: { isActive: !product.isActive } }).unwrap();
    } finally {
      setProductToggling(null);
    }
  }

  // ── Shared delete handler ────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "provider") {
        await deleteLoanProvider(deleteTarget.id).unwrap();
      } else {
        await deleteLoanProduct(deleteTarget.id).unwrap();
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const { data: summaryRes, isLoading: summaryLoading } = useGetLoanSummaryQuery();
  const summary = summaryRes?.data ?? MOCK_LOAN_SUMMARY;

  const { data: monthlyTrendRes } = useGetLoanMonthlyTrendQuery();
  const { data: locationRes }     = useGetLoanLocationStatsQuery();

  const monthlyData  = monthlyTrendRes?.data?.length  ? monthlyTrendRes.data  : MOCK_LOAN_MONTHLY;
  const locationData = locationRes?.data?.length      ? locationRes.data      : MOCK_LOAN_LOCATION;

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

      {/* ── Loan Providers ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Loan Providers</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage lending institutions available on the platform</p>
          </div>
          <button
            onClick={() => openProviderDialog(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Provider
          </button>
        </div>

        {providersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <Building2 className="h-8 w-8 opacity-30" />
            <p className="text-sm">No loan providers yet</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providers.map((provider) => (
                  <tr key={provider.id} className={`hover:bg-muted/30 transition-colors ${!provider.isActive ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{provider.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                      {provider.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      <div className="text-xs space-y-0.5">
                        {provider.contactEmail && <p>{provider.contactEmail}</p>}
                        {provider.contactPhone && <p>{provider.contactPhone}</p>}
                        {!provider.contactEmail && !provider.contactPhone && "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        provider.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {provider.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={() =>
                            updateLoanProvider({ id: provider.id, data: { isActive: !provider.isActive } })
                          }
                        />
                        <button
                          onClick={() => openProviderDialog(provider)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ kind: "provider", id: provider.id, name: provider.name })}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Loan Products ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Loan Products</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Configure available loan products and their terms</p>
          </div>
          <button
            onClick={() => openDialog(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Product
          </button>
        </div>

        {productsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <Package className="h-8 w-8 opacity-30" />
            <p className="text-sm">No loan products yet</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Interest Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Min Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Max Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Tenure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-muted/30 transition-colors ${product.isActive === false ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">{product.provider}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell tabular-nums">{product.interestRate}% p.a.</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell tabular-nums">{naira(product.minAmount)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell tabular-nums">{naira(product.maxAmount)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.tenure}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        product.isActive === false
                          ? "bg-gray-100 text-gray-500 border-gray-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {product.isActive === false ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={product.isActive !== false}
                          disabled={productToggling === product.id}
                          onCheckedChange={() => handleToggleProduct(product)}
                        />
                        <button
                          onClick={() => openDialog(product)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ kind: "product", id: product.id, name: product.name })}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Loan Provider Dialog ─────────────────────────────────────────────── */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Loan Provider" : "New Loan Provider"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProviderSubmit} className="space-y-4 mt-2">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Provider Name <span className="text-red-500">*</span></label>
              <input
                required
                value={providerForm.name}
                onChange={(e) => setProviderForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. First Bank Nigeria"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description <span className="text-muted-foreground/60">(optional)</span></label>
              <textarea
                rows={3}
                value={providerForm.description}
                onChange={(e) => setProviderForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this provider…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Contact Email + Phone (2 cols) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Email</label>
                <input
                  type="email"
                  value={providerForm.contactEmail}
                  onChange={(e) => setProviderForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="contact@bank.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={providerForm.contactPhone}
                  onChange={(e) => setProviderForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="e.g. 08012345678"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setProviderDialogOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={providerSaving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {providerSaving ? "Saving…" : editingProvider ? "Save Changes" : "Create Provider"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Loan Product Dialog ──────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Loan Product" : "New Loan Product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name <span className="text-red-500">*</span></label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Business Loan"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Provider <span className="text-red-500">*</span></label>
              <select
                required
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Select a provider…</option>
                {providers.filter((p) => p.isActive).map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Interest Rate + Tenure (2 cols) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.interestRate}
                  onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))}
                  placeholder="e.g. 12.5"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tenure</label>
                <input
                  value={form.tenure}
                  onChange={(e) => setForm((f) => ({ ...f, tenure: e.target.value }))}
                  placeholder="e.g. 12 months"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Min + Max Amount (2 cols) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Min Amount (₦)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minAmount}
                  onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
                  placeholder="e.g. 50000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Max Amount (₦)</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxAmount}
                  onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))}
                  placeholder="e.g. 5000000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description <span className="text-muted-foreground/60">(optional)</span></label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this loan product…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Shared delete AlertDialog ────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deleteTarget?.kind}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
