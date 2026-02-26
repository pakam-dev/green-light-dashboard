import { useState, useMemo, Fragment, useEffect, useCallback } from "react";
import {
  CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle,
  RefreshCw, TrendingUp, ShieldCheck, Users,
  ArrowUpRight, TrendingDown,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Package, MapPin, Camera, X, Trophy,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReusableDataTable, TableColumn } from "@/components/dashboard/ReusableDataTable";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useGetInstantBuySummaryQuery,
  useGetInstantBuyTransactionsQuery,
  useGetInstantBuyMonthlyTrendQuery,
  useGetInstantBuyDailyVolumeQuery,
  useGetInstantBuyLocationStatsQuery,
  Transaction, TxType, TxStatus,
} from "@/store/api/instantBuyApi";

// ── Formatters ────────────────────────────────────────────────────────────────

function naira(val: number) {
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000)     return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)         return `₦${(val / 1_000).toFixed(0)}k`;
  return `₦${val.toLocaleString()}`;
}
function nairaFull(val: number) {
  return `₦${val.toLocaleString("en-NG")}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_DIST = [
  { name: "Successful", value: 94.2, color: "#16a34a" },
  { name: "Failed",     value: 3.1,  color: "#dc2626" },
  { name: "Pending",    value: 1.8,  color: "#d97706" },
  { name: "Reversed",   value: 0.9,  color: "#7c3aed" },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────

const TX_TYPE_META: Record<TxType, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  topup:    { label: "Top-up",   icon: ArrowDownCircle, bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  payment:  { label: "Material Purchase",  icon: ArrowUpCircle,   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"  },
  reversal: { label: "Reversal", icon: RefreshCw,       bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200"},
};

const TX_STATUS_META: Record<TxStatus, { label: string; bg: string; text: string; border: string }> = {
  successful: { label: "Successful", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  failed:     { label: "Failed",     bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  pending:    { label: "Pending",    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  reversed:   { label: "Reversed",   bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const TypeBadge = ({ type }: { type: TxType }) => {
  const m = TX_TYPE_META[type];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.bg} ${m.text} ${m.border}`}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: TxStatus }) => {
  const m = TX_STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  );
};

// ── Table columns (used by TxTable for top-ups and reversals) ─────────────────

const columns: TableColumn<Transaction>[] = [
  {
    key: "userName",
    header: "User",
    render: (row) => (
      <div>
        <p className="font-medium text-sm text-foreground">{row.userName}</p>
        <p className="text-xs text-muted-foreground">{row.userPhone}</p>
      </div>
    ),
  },
  {
    key: "reference",
    header: "Reference",
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{row.reference}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (row) => <TypeBadge type={row.type} />,
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => (
      <span className={`font-semibold tabular-nums text-sm ${
        row.type === "topup" ? "text-green-700" : row.type === "reversal" ? "text-purple-700" : "text-foreground"
      }`}>
        {row.type === "topup" ? "+" : row.type === "payment" ? "−" : "↩"}{nairaFull(row.amount)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "createdAt",
    header: "Date & Time",
    render: (row) => (
      <div>
        <p className="text-sm text-foreground">{fmtDate(row.createdAt)}</p>
        <p className="text-xs text-muted-foreground">{fmtTime(row.createdAt)}</p>
      </div>
    ),
  },
];

// ── Standard transaction table (top-ups & reversals) ─────────────────────────

const TxTable = ({ data }: { data: Transaction[] }) => {
  const tableState = useDataTable({
    data,
    searchableFields: ["userName", "userPhone", "reference"],
    initialPageSize: 10,
  });
  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns}
      searchPlaceholder="Search by name, phone or reference…"
      emptyMessage="No transactions found"
      showFilter={true}
      showExport={true}
      showRefresh={true}
    />
  );
};

// ── Image lightbox ────────────────────────────────────────────────────────────

interface LightboxState { images: string[]; index: number; userName: string }

const ImageLightbox = ({
  state, onClose, onPrev, onNext,
}: {
  state: LightboxState;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const { images, index, userName } = state;
  const src = images[index];
  const isUrl = src.startsWith("http") || src.startsWith("/");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-white/50" />
            <span className="text-sm font-medium text-white/80">{userName}</span>
            <span className="text-xs text-white/40">·</span>
            <span className="text-xs text-white/50">Photo {index + 1} of {images.length}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Image area */}
        <div className="relative flex items-center justify-center bg-neutral-950 min-h-[320px] sm:min-h-[420px]">
          {isUrl ? (
            <img
              src={src}
              alt={`Photo ${index + 1}`}
              className="max-h-[420px] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/30">
              <Camera className="h-16 w-16" />
              <p className="text-sm font-medium">Photo {index + 1}</p>
              <p className="text-xs text-white/20">Image preview — real photos load from API</p>
            </div>
          )}

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              onClick={onPrev}
              className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={onNext}
              className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-3 border-t border-white/10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {/* handled externally via onPrev/onNext */}}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Payments table with expandable rows ───────────────────────────────────────

const PaymentsTable = ({ data }: { data: Transaction[] }) => {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(t =>
      t.userName.toLowerCase().includes(q) ||
      t.userPhone.includes(q) ||
      t.reference.toLowerCase().includes(q)
    );
  }, [data, search]);

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openLightbox = (images: string[], index: number, userName: string) =>
    setLightbox({ images, index, userName });

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prevImage = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null),
  []);

  const nextImage = useCallback(() =>
    setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null),
  []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")       closeLightbox();
      if (e.key === "ArrowLeft")    prevImage();
      if (e.key === "ArrowRight")   nextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, prevImage, nextImage]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, phone or reference…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {["User", "Reference", "Amount", "Status", "Date & Time", "Details"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No material purchases found
                </td>
              </tr>
            ) : filtered.map(row => (
              <Fragment key={row.id}>
                {/* Main row */}
                <tr className={`transition-colors ${expandedIds.has(row.id) ? "bg-primary/5" : "hover:bg-muted/20"}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-foreground">{row.userName}</p>
                    <p className="text-xs text-muted-foreground">{row.userPhone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-muted-foreground">{row.reference}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold tabular-nums text-foreground">−{nairaFull(row.amount)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-foreground">{fmtDate(row.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{fmtTime(row.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggle(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors whitespace-nowrap"
                    >
                      {expandedIds.has(row.id) ? (
                        <><ChevronUp className="h-3.5 w-3.5" />View less</>
                      ) : (
                        <><ChevronDown className="h-3.5 w-3.5" />View more</>
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedIds.has(row.id) && (
                  <tr>
                    <td colSpan={6} className="px-4 pb-5 pt-0 bg-primary/5">
                      <div className="rounded-xl border border-primary/10 bg-white p-5 space-y-5">

                        {/* Materials table */}
                        {row.materials && row.materials.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              Materials Purchased
                            </h4>
                            <div className="rounded-lg border border-border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-muted/40 border-b border-border">
                                    {["Material", "Weight (kg)", "Price / kg", "Subtotal"].map((h, i) => (
                                      <th key={h} className={`px-3 py-2 text-xs font-semibold text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {row.materials.map((m, i) => (
                                    <tr key={i} className="hover:bg-muted/10">
                                      <td className="px-3 py-2 font-medium text-foreground">{m.name}</td>
                                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{m.kg.toFixed(1)}</td>
                                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{nairaFull(m.pricePerKg)}</td>
                                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">
                                        {nairaFull(Math.round(m.kg * m.pricePerKg))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Total weight + address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {row.totalWeight != null && (
                            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total Weight</p>
                                <p className="font-semibold text-foreground">{row.totalWeight} kg</p>
                              </div>
                            </div>
                          )}
                          {row.address && (
                            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pickup Address</p>
                                <p className="font-medium text-foreground text-sm leading-tight">{row.address}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Images */}
                        {row.images && row.images.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                              Photos ({row.images.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {row.images.map((_, i) => (
                                <div
                                  key={i}
                                  className="h-20 w-20 rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center gap-1 text-muted-foreground"
                                >
                                  <Camera className="h-5 w-5" />
                                  <span className="text-[10px]">Photo {i + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} material purchase{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

// ── KPI hero card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: string; up: boolean };
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
    <div>
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

// ── Chart tooltips ────────────────────────────────────────────────────────────

const VolumeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-3 text-sm space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}: <span className="font-medium" style={{ color: p.color }}>{naira(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-md px-4 py-2.5 text-sm">
      <span className="font-semibold">{payload[0].name}</span>
      <span className="ml-2 text-muted-foreground">{payload[0].value}%</span>
    </div>
  );
};

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { value: TxType; label: string; icon: React.ElementType }[] = [
  { value: "topup",    label: "Top-ups",   icon: ArrowDownCircle },
  { value: "payment",  label: "Material Purchases",  icon: ArrowUpCircle   },
  { value: "reversal", label: "Reversals", icon: RefreshCw       },
];

// ── Main page ─────────────────────────────────────────────────────────────────

const InstantBuyPage = () => {
  const [period, setPeriod] = useState("12m");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<TxType>("topup");

  const { data: summaryRes, isLoading: summaryLoading }   = useGetInstantBuySummaryQuery();
  const { data: monthlyTrendRes }                         = useGetInstantBuyMonthlyTrendQuery();
  const { data: dailyVolumeRes }                          = useGetInstantBuyDailyVolumeQuery();
  const { data: locationRes }                             = useGetInstantBuyLocationStatsQuery();
  const { data: txnRes }                                  = useGetInstantBuyTransactionsQuery();
  const summary = summaryRes?.data;

  const monthlyData       = monthlyTrendRes?.data   ?? [];
  const dailyData         = dailyVolumeRes?.data    ?? [];
  const purchaseLocations = locationRes?.data       ?? [];
  const allTxns           = txnRes?.data?.data      ?? [];

  const totalFunded   = summary?.totalFunded          ?? 0;
  const totalPayments = summary?.totalPayments        ?? 0;
  const netBalance    = totalFunded - totalPayments;
  const activeWallets = summary?.activeWallets        ?? 0;
  const successRate   = summary?.successRate          ?? 0;
  const avgTxValue    = summary?.avgTransactionValue  ?? 0;

  const kpiCards: KpiCardProps[] = [
    {
      label: "Total Wallet Top-ups",
      value: naira(totalFunded),
      sub: `${allTxns.filter(t => t.type === "topup").length} top-up transactions`,
      trend: { value: "18.3%", up: true },
      icon: Wallet,
      iconBg: "bg-primary/10", iconColor: "text-primary",
      highlight: true, isLoading: summaryLoading,
    },
    {
      label: "Total Material Purchases",
      value: naira(totalPayments),
      sub: `${allTxns.filter(t => t.type === "payment").length} material purchase transactions`,
      trend: { value: "15.1%", up: true },
      icon: ArrowUpCircle,
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
      isLoading: summaryLoading,
    },
    {
      label: "Net Wallet Balance",
      value: naira(Math.abs(netBalance)),
      sub: "Funds remaining in wallets",
      icon: TrendingUp,
      iconBg: "bg-green-50", iconColor: "text-green-600",
      isLoading: summaryLoading,
    },
    {
      label: "Active Wallets",
      value: activeWallets.toLocaleString(),
      sub: "Users with funded wallets",
      trend: { value: "8.7%", up: true },
      icon: Users,
      iconBg: "bg-amber-50", iconColor: "text-amber-600",
      isLoading: summaryLoading,
    },
    {
      label: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      sub: "Of all transactions",
      trend: { value: "0.4%", up: true },
      icon: ShieldCheck,
      iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      isLoading: summaryLoading,
    },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">InstantBuy</h1>
            <p className="text-sm text-muted-foreground">Wallet funding and material purchase activity overview</p>
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

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((c) => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* ── Charts row 1: Monthly volume + Health donut ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Monthly volume — 2/3 */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground">Monthly Wallet Activity</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Top-ups funded vs material purchases made
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="topupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#008300" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#008300" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={naira} width={64} />
                <Tooltip content={<VolumeTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                <Area type="monotone" dataKey="topups"   name="Top-ups"  stroke="#008300" strokeWidth={2.5}
                  fill="url(#topupGrad)" dot={false} activeDot={{ r: 4, fill: "#008300" }} />
                <Area type="monotone" dataKey="payments" name="Material Purchases" stroke="#2563eb" strokeWidth={2.5}
                  fill="url(#payGrad)"   dot={false} activeDot={{ r: 4, fill: "#2563eb" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction health donut — 1/3 */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground">Transaction Health</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Status distribution</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STATUS_DIST} cx="50%" cy="50%"
                    innerRadius="55%" outerRadius="80%" paddingAngle={3}
                    dataKey="value" stroke="none">
                    {STATUS_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2">
            {STATUS_DIST.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <div>
                  <p className="text-xs text-muted-foreground">{d.name}</p>
                  <p className="text-sm font-semibold tabular-nums">{d.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row 2: Daily volume ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">Daily Transaction Volume</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Number of transactions per day — last 30 days
          </p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false}
                interval={4} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), "Transactions"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.07)" }}
              />
              <Bar dataKey="transactions" name="Transactions" fill="#008300" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Avg transaction + channel split mini-stats ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg. Transaction", value: naira(avgTxValue),                                                                                          icon: CreditCard,      bg: "bg-primary/10",  color: "text-primary"    },
          { label: "Top-ups %",        value: `${allTxns.length ? Math.round(allTxns.filter(t => t.type === "topup").length    / allTxns.length * 100) : 0}%`, icon: ArrowDownCircle, bg: "bg-green-50",    color: "text-green-600"  },
          { label: "Material Purchase %", value: `${allTxns.length ? Math.round(allTxns.filter(t => t.type === "payment").length  / allTxns.length * 100) : 0}%`, icon: ArrowUpCircle,   bg: "bg-indigo-50",   color: "text-indigo-600" },
          { label: "Total Users",      value: activeWallets.toLocaleString(),                                                                                     icon: Users,           bg: "bg-amber-50",    color: "text-amber-600"  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold tabular-nums text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Material purchase locations ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-foreground">Material Purchases by Location</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Top states ranked by number of material purchases</p>
          </div>
          {purchaseLocations.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wide">Top Location</p>
                <p className="text-sm font-bold text-amber-700">{purchaseLocations[0].state}</p>
              </div>
            </div>
          )}
        </div>

        {purchaseLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {purchaseLocations.map((loc, i) => {
                const barPct = (loc.count / (purchaseLocations[0]?.count ?? 1)) * 100;
                const isTop  = i === 0;
                return (
                  <div key={loc.state} className="flex items-center gap-3">
                    <span className={`w-5 text-xs font-bold shrink-0 text-right ${isTop ? "text-amber-500" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <MapPin className={`h-3.5 w-3.5 shrink-0 ${isTop ? "text-amber-500" : "text-muted-foreground"}`} />
                    <span className={`w-32 text-sm shrink-0 ${isTop ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {loc.state}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, background: isTop ? "#d97706" : "#7c3aed" }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold tabular-nums text-foreground shrink-0">
                      {loc.count}
                    </span>
                    <span className="w-20 text-right text-xs text-muted-foreground tabular-nums shrink-0">
                      {naira(loc.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-right">
              Total: {purchaseLocations.reduce((s, l) => s + l.count, 0).toLocaleString()} purchases · {naira(purchaseLocations.reduce((s, l) => s + l.amount, 0))}
            </p>
          </>
        )}
      </div>

      {/* ── Transaction log ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">Transaction Log</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete record of wallet top-ups, material purchases and reversals
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TxType)}>
          <TabsList className="h-10 bg-muted/50 border border-border rounded-xl p-1 flex-wrap gap-1 mb-4">
            {TABS.map((tab) => {
              const cnt = allTxns.filter((t) => t.type === tab.value).length;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
                >
                  {tab.label}
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                    {cnt}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="focus-visible:outline-none">
              {tab.value === "payment" ? (
                <PaymentsTable data={allTxns.filter(t => t.type === "payment")} />
              ) : (
                <TxTable data={allTxns.filter(t => t.type === tab.value)} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default InstantBuyPage;
