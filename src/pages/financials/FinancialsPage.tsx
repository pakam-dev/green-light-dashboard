import { useMemo, useState } from "react";
import {
  Banknote, TrendingUp, TrendingDown, DollarSign,
  Percent, BarChart2, ArrowUpRight,
  Leaf, Landmark, CreditCard,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useGetFinancialsSummaryQuery } from "@/store/api/financialsApi";

// ── Palette ───────────────────────────────────────────────────────────────
const COLOR_SCHEDULES  = "#008300";
const COLOR_LOANS      = "#2563eb";
const COLOR_INSTANTBUY = "#7c3aed";
const COLOR_PROFIT     = "#16a34a";

// ── Formatters ────────────────────────────────────────────────────────────
function naira(val: number) {
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000)     return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)         return `₦${(val / 1_000).toFixed(0)}k`;
  return `₦${val.toLocaleString()}`;
}
function pct(val: number) { return `${val.toFixed(1)}%`; }
function num(val: number) { return val.toLocaleString("en-NG"); }

// ── KPI Card ──────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  icon: React.ElementType;
  highlight?: boolean;
}

function KpiCard({ label, value, sub, subPositive, icon: Icon, highlight }: KpiCardProps) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${
      highlight
        ? "bg-primary text-white border-primary shadow-lg"
        : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium uppercase tracking-wide ${highlight ? "text-white/70" : "text-gray-500"}`}>{label}</span>
        <span className={`p-1.5 rounded-lg ${highlight ? "bg-white/20" : "bg-gray-100"}`}>
          <Icon className={`h-4 w-4 ${highlight ? "text-white" : "text-gray-600"}`} />
        </span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>{value}</p>
      {sub && (
        <p className={`text-xs flex items-center gap-1 ${
          highlight ? "text-white/80"
          : subPositive ? "text-green-600" : "text-red-500"
        }`}>
          {subPositive ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Segment Card ──────────────────────────────────────────────────────────
interface SegmentCardProps {
  title: string;
  color: string;
  icon: React.ElementType;
  revenue: string;
  growthPct: number;
  kpis: { label: string; value: string }[];
  hrefLabel: string;
}

function SegmentCard({ title, color, icon: Icon, revenue, growthPct, kpis, hrefLabel }: SegmentCardProps) {
  const positive = growthPct >= 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg" style={{ background: `${color}15` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <span className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5">{hrefLabel}</span>
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900">{revenue}</p>
        <p className={`text-xs flex items-center gap-1 mt-0.5 ${positive ? "text-green-600" : "text-red-500"}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}{pct(growthPct)} vs last period
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {kpis.map(k => (
          <div key={k.label}>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{k.label}</p>
            <p className="text-sm font-semibold text-gray-700">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tooltips ──────────────────────────────────────────────────────────────
function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">{naira(value)}</p>
    </div>
  );
}

function PLTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {naira(p.value)}</p>
      ))}
    </div>
  );
}

function StackedTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {naira(p.value)}</p>
      ))}
      <p className="border-t border-gray-100 pt-1 font-semibold text-gray-700">Total: {naira(total)}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FinancialsPage() {
  const [period, setPeriod] = useState("12m");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: summaryRes } = useGetFinancialsSummaryQuery();

  const monthly = summaryRes?.data?.monthly ?? [];

  const totRev    = useMemo(() => monthly.reduce((s, m) => s + m.totalRevenue, 0), [monthly]);
  const totProfit = useMemo(() => monthly.reduce((s, m) => s + m.netProfit, 0), [monthly]);
  const margin    = totRev > 0 ? (totProfit / totRev) * 100 : 0;

  const lastMo  = monthly[monthly.length - 1];
  const prevMo  = monthly[monthly.length - 2];
  const momGrowth = prevMo && prevMo.totalRevenue > 0
    ? ((( lastMo?.totalRevenue ?? 0) - prevMo.totalRevenue) / prevMo.totalRevenue) * 100
    : 0;

  const totSched = useMemo(() => monthly.reduce((s, m) => s + m.schedules, 0), [monthly]);
  const totLoans = useMemo(() => monthly.reduce((s, m) => s + m.loans, 0), [monthly]);
  const totIB    = useMemo(() => monthly.reduce((s, m) => s + m.instantBuy, 0), [monthly]);

  const schedGrowth = prevMo && prevMo.schedules  > 0 ? (((lastMo?.schedules  ?? 0) - prevMo.schedules)  / prevMo.schedules)  * 100 : 0;
  const loanGrowth  = prevMo && prevMo.loans      > 0 ? (((lastMo?.loans      ?? 0) - prevMo.loans)      / prevMo.loans)      * 100 : 0;
  const ibGrowth    = prevMo && prevMo.instantBuy > 0 ? (((lastMo?.instantBuy ?? 0) - prevMo.instantBuy) / prevMo.instantBuy) * 100 : 0;

  const donutData = [
    { name: "Schedules",  value: totSched, fill: COLOR_SCHEDULES  },
    { name: "Loans",      value: totLoans, fill: COLOR_LOANS      },
    { name: "InstantBuy", value: totIB,    fill: COLOR_INSTANTBUY },
  ];

  const lmSched  = lastMo?.schedules     ?? 0;
  const lmLoans  = lastMo?.loans         ?? 0;
  const lmIB     = lastMo?.instantBuy    ?? 0;
  const lmRev    = lastMo?.totalRevenue  ?? 0;
  const lmProfit = lastMo?.netProfit     ?? 0;
  const lmMargin = lmRev > 0 ? (lmProfit / lmRev) * 100 : 0;

  const inputCls = "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer";

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-primary/10">
            <Banknote className="h-6 w-6 text-primary" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financials</h1>
            <p className="text-sm text-gray-500">Cross-segment financial overview</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls}>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={naira(totRev)}
          sub="Across all segments"
          subPositive
          icon={DollarSign}
          highlight
        />
        <KpiCard
          label="Net Profit"
          value={naira(totProfit)}
          sub="After all costs"
          subPositive
          icon={TrendingUp}
        />
        <KpiCard
          label="Profit Margin"
          value={pct(margin)}
          sub="vs prior period"
          subPositive
          icon={Percent}
        />
        <KpiCard
          label="MoM Growth"
          value={`${momGrowth >= 0 ? "+" : ""}${pct(momGrowth)}`}
          sub="Month-over-month"
          subPositive={momGrowth >= 0}
          icon={BarChart2}
        />
      </div>

      {/* ── Row 1: Stacked Bar + Donut ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue by Segment</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => naira(v)} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<StackedTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="schedules"  name="Schedules"  stackId="a" fill={COLOR_SCHEDULES}  radius={[0,0,0,0]} />
              <Bar dataKey="loans"      name="Loans"      stackId="a" fill={COLOR_LOANS}       />
              <Bar dataKey="instantBuy" name="InstantBuy" stackId="a" fill={COLOR_INSTANTBUY}  radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue Mix</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value">
                {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {donutData.map(d => {
              const sharePct = totRev > 0 ? (d.value / totRev) * 100 : 0;
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                    <span className="text-gray-600">{d.name}</span>
                  </span>
                  <span className="font-semibold text-gray-700">{naira(d.value)} <span className="text-gray-400">({pct(sharePct)})</span></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: P&L Trend + Income Statement ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">P&amp;L Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLOR_SCHEDULES} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLOR_SCHEDULES} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLOR_PROFIT} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLOR_PROFIT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => naira(v)} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<PLTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="totalRevenue" name="Revenue"    stroke={COLOR_SCHEDULES} fill="url(#gradRev)"    strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="netProfit"    name="Net Profit" stroke={COLOR_PROFIT}    fill="url(#gradProfit)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">P&amp;L Statement</h2>
          <p className="text-xs text-gray-400 mb-4">{lastMo?.month ?? "—"} (current month)</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Revenue</p>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Schedules</span>
                  <span className="font-medium text-gray-800">{naira(lmSched)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loans (interest)</span>
                  <span className="font-medium text-gray-800">{naira(lmLoans)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">InstantBuy (fees)</span>
                  <span className="font-medium text-gray-800">{naira(lmIB)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-100 mt-2 pt-2">
                <span className="text-gray-700">Total Revenue</span>
                <span className="text-gray-900">{naira(lmRev)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-800">Net Profit</span>
                <span style={{ color: COLOR_PROFIT }}>{naira(lmProfit)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profit Margin</span>
                <span className="font-semibold text-gray-700">{pct(lmMargin)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Segment Cards ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Segment Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const seg = summaryRes?.data?.segments;
            const s   = seg?.schedules;
            const l   = seg?.loans;
            const ib  = seg?.instantBuy;
            const completed    = s?.completedCount  ?? 0;
            const wasteKg      = s?.totalWasteKg    ?? 0;
            const revPerSched  = completed > 0 ? Math.round(totSched / completed) : 0;
            const avgPerSched  = completed > 0 ? (wasteKg / completed).toFixed(0) : "—";
            const ibWallets    = ib?.activeWallets  ?? 0;
            const ibGmv        = ib?.gmv            ?? 0;
            const avgWalletBal = ibWallets > 0 ? Math.round(ibGmv / ibWallets) : 0;
            return (
              <>
                <SegmentCard
                  title="Schedules"
                  color={COLOR_SCHEDULES}
                  icon={Leaf}
                  revenue={naira(totSched)}
                  growthPct={schedGrowth}
                  kpis={[
                    { label: "Completed",    value: num(completed) },
                    { label: "Rev/Schedule", value: naira(revPerSched) },
                    { label: "Total Waste",  value: `${num(wasteKg)} kg` },
                    { label: "Avg/Schedule", value: `${avgPerSched} kg` },
                  ]}
                  hrefLabel="Schedules page"
                />
                <SegmentCard
                  title="Loans"
                  color={COLOR_LOANS}
                  icon={Landmark}
                  revenue={naira(totLoans)}
                  growthPct={loanGrowth}
                  kpis={[
                    { label: "Loan Book",       value: naira(l?.loanBook       ?? 0) },
                    { label: "NPL Ratio",       value: l?.nplRatio       != null ? pct(l.nplRatio)       : "—" },
                    { label: "Collection Rate", value: l?.collectionRate != null ? pct(l.collectionRate) : "—" },
                    { label: "Active Loans",    value: num(0) },
                  ]}
                  hrefLabel="Loan page"
                />
                <SegmentCard
                  title="InstantBuy"
                  color={COLOR_INSTANTBUY}
                  icon={CreditCard}
                  revenue={naira(totIB)}
                  growthPct={ibGrowth}
                  kpis={[
                    { label: "GMV",            value: naira(ibGmv) },
                    { label: "Take Rate",      value: ib?.takeRate != null ? pct(ib.takeRate) : "—" },
                    { label: "Active Wallets", value: num(ibWallets) },
                    { label: "Avg Wallet Bal", value: naira(avgWalletBal) },
                  ]}
                  hrefLabel="InstantBuy page"
                />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
