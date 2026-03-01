import { useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
  ArrowUpRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetPayoutSummaryQuery,
  useGetPayoutsQuery,
  PayoutRequest,
  PayoutStatus,
} from "@/store/api/payoutsApi";
import { MOCK_PAYOUT_SUMMARY, MOCK_PAYOUTS } from "@/mock/mockData";

// ── Formatters ────────────────────────────────────────────────────────────────
function naira(val: number) {
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000)     return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)         return `₦${(val / 1_000).toFixed(0)}k`;
  return `₦${val.toLocaleString()}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
}

function KpiCard({ label, value, sub, icon: Icon, highlight }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-2 ${
        highlight
          ? "bg-primary text-white border-primary shadow-lg"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium uppercase tracking-wide ${
            highlight ? "text-white/70" : "text-gray-500"
          }`}
        >
          {label}
        </span>
        <span className={`p-1.5 rounded-lg ${highlight ? "bg-white/20" : "bg-gray-100"}`}>
          <Icon className={`h-4 w-4 ${highlight ? "text-white" : "text-gray-600"}`} />
        </span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs ${highlight ? "text-white/70" : "text-gray-500"}`}>{sub}</p>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    paid:     "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: { value: PayoutStatus | "all"; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "pending",  label: "Pending"  },
  { value: "approved", label: "Approved" },
  { value: "paid",     label: "Paid"     },
  { value: "rejected", label: "Rejected" },
];

// ─────────────────────────────────────────────────────────────────────────────

const PayoutsPage = () => {
  const [activeTab, setActiveTab] = useState<PayoutStatus | "all">("all");

  // ── API ───────────────────────────────────────────────────────────────────
  const { data: summaryRes } = useGetPayoutSummaryQuery();
  const { data: payoutsRes } = useGetPayoutsQuery(
    activeTab === "all" ? {} : { status: activeTab }
  );

  const summary = summaryRes?.data ?? MOCK_PAYOUT_SUMMARY;
  const apiRows = payoutsRes?.data?.data ?? [];
  const rows = (
    apiRows.length > 0
      ? apiRows
      : (MOCK_PAYOUTS as PayoutRequest[]).filter(
          (p) => activeTab === "all" || p.status === activeTab
        )
  ) as PayoutRequest[];

  // ── Table ─────────────────────────────────────────────────────────────────
  function PayoutsTable({ data }: { data: PayoutRequest[] }) {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <Wallet className="h-8 w-8 opacity-30" />
          <p className="text-sm">No payout requests found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wide bg-gray-50/50">
              <th className="py-3 px-4 text-left font-medium">User</th>
              <th className="py-3 px-4 text-left font-medium">Amount</th>
              <th className="py-3 px-4 text-left font-medium">Bank Details</th>
              <th className="py-3 px-4 text-left font-medium">Requested</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{p.userName}</p>
                  <p className="text-gray-500 text-xs">{p.userPhone}</p>
                  <p className="text-gray-400 text-xs">{p.userEmail}</p>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {naira(p.amount)}
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-800">{p.bankName}</p>
                  <p className="text-gray-500 text-xs font-mono">{p.accountNumber}</p>
                  <p className="text-gray-400 text-xs">{p.accountName}</p>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                  {fmtDate(p.requestedAt)}
                </td>
                <td className="py-3 px-4 min-w-[140px]">
                  <StatusBadge status={p.status} />
                  {p.rejectionReason && (
                    <p
                      className="text-xs text-red-500 mt-1 max-w-[180px] line-clamp-2"
                      title={p.rejectionReason}
                    >
                      {p.rejectionReason}
                    </p>
                  )}
                  {p.reference && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      Ref: {p.reference}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet Payouts</h1>
        <p className="text-muted-foreground">
          Manage and process user wallet payout requests
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Total Requests"
          value={summary.totalRequests.toLocaleString()}
          icon={Wallet}
          highlight
        />
        <KpiCard
          label="Total Amount"
          value={naira(summary.totalAmount)}
          icon={Banknote}
        />
        <KpiCard
          label="Pending"
          value={summary.pendingCount.toLocaleString()}
          sub={naira(summary.pendingAmount)}
          icon={Clock}
        />
        <KpiCard
          label="Approved"
          value={summary.approvedCount.toLocaleString()}
          sub={naira(summary.approvedAmount)}
          icon={CheckCircle}
        />
        <KpiCard
          label="Paid"
          value={summary.paidCount.toLocaleString()}
          sub={naira(summary.paidAmount)}
          icon={ArrowUpRight}
        />
        <KpiCard
          label="Rejected"
          value={summary.rejectedCount.toLocaleString()}
          sub={naira(summary.rejectedAmount)}
          icon={XCircle}
        />
      </div>

      {/* Tabbed table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as PayoutStatus | "all")}
        >
          <div className="px-4 pt-4 flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-gray-900">Payout Requests</h2>
            <TabsList className="h-8">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 h-7">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <PayoutsTable data={rows} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PayoutsPage;
