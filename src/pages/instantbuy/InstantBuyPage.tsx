import { useState, useMemo, Fragment, useEffect, useCallback } from "react";
import {
  CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle,
  RefreshCw, TrendingUp, ShieldCheck, Users, FlaskConical,
  ArrowUpRight, TrendingDown, Building, Smartphone,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Package, MapPin, Camera, X,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { format, subMonths, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReusableDataTable, TableColumn } from "@/components/dashboard/ReusableDataTable";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useGetInstantBuySummaryQuery,
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

// ── Seeded random ─────────────────────────────────────────────────────────────

function sr(seed: number) { return Math.abs(Math.sin(seed * 127.1 + 311.7) * 10000) % 1; }

// ── Chart data ────────────────────────────────────────────────────────────────

function genMonthly() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), 11 - i);
    const s = d.getMonth() + d.getFullYear() * 12;
    const topups   = Math.round(4_500_000 + i * 420_000 + sr(s)   * 3_000_000);
    const payments = Math.round(topups * (0.78 + sr(s + 1) * 0.14));
    const reversals= Math.round(topups * (0.01 + sr(s + 2) * 0.02));
    return { month: format(d, "MMM yy"), topups, payments, reversals };
  });
}

function genDaily() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    const s = d.getDate() + d.getMonth() * 31;
    return {
      day: format(d, "dd MMM"),
      transactions: Math.round(120 + sr(s) * 180 + (i / 30) * 60),
    };
  });
}

const STATUS_DIST = [
  { name: "Successful", value: 94.2, color: "#16a34a" },
  { name: "Failed",     value: 3.1,  color: "#dc2626" },
  { name: "Pending",    value: 1.8,  color: "#d97706" },
  { name: "Reversed",   value: 0.9,  color: "#7c3aed" },
];

// ── Seed transactions ─────────────────────────────────────────────────────────

const SEED_TXN: Transaction[] = [
  { id:"t01", reference:"IB-2025-001234", userName:"Adaeze Okafor",    userPhone:"08012345601", type:"topup",    amount:20000,  status:"successful", createdAt:"2025-02-11T09:30:00" },
  { id:"t02", reference:"IB-2025-001235", userName:"Emeka Nwosu",      userPhone:"08023456702", type:"topup",    amount:50000,  status:"successful", createdAt:"2025-02-11T10:15:00" },
  {
    id:"t03", reference:"IB-2025-001236", userName:"Adaeze Okafor", userPhone:"08012345601",
    type:"payment", amount:5000, status:"successful", createdAt:"2025-02-11T10:45:00",
    materials:[{name:"PET Bottles",kg:25,pricePerKg:120},{name:"Cardboard",kg:20,pricePerKg:60}],
    totalWeight:45, images:["p1","p2"],
    address:"23 Bode Thomas Street, Surulere, Lagos",
  },
  { id:"t04", reference:"IB-2025-001237", userName:"Ngozi Eze",        userPhone:"08034567803", type:"topup",    amount:10000,  status:"successful", createdAt:"2025-02-11T11:00:00" },
  { id:"t05", reference:"IB-2025-001238", userName:"Chidi Obi",        userPhone:"08045678904", type:"topup",    amount:100000, status:"successful", createdAt:"2025-02-11T11:20:00" },
  {
    id:"t06", reference:"IB-2025-001239", userName:"Amaka Chioma", userPhone:"08056789005",
    type:"payment", amount:7500, status:"failed", createdAt:"2025-02-11T11:35:00",
    materials:[{name:"Mixed Plastics",kg:45,pricePerKg:100},{name:"Nylon Bags",kg:30,pricePerKg:80}],
    totalWeight:75, images:["p1","p2","p3"],
    address:"14 Allen Avenue, Ikeja, Lagos",
  },
  { id:"t07", reference:"IB-2025-001240", userName:"Babatunde Adeola", userPhone:"08067890106", type:"topup",    amount:25000,  status:"successful", createdAt:"2025-02-10T08:10:00" },
  {
    id:"t08", reference:"IB-2025-001241", userName:"Kelechi Okonkwo", userPhone:"08078901207",
    type:"payment", amount:3000, status:"successful", createdAt:"2025-02-10T09:00:00",
    materials:[{name:"Newspaper / Paper",kg:50,pricePerKg:40},{name:"Cardboard",kg:12,pricePerKg:60}],
    totalWeight:62, images:["p1"],
    address:"8 Adeola Hopewell Street, Victoria Island, Lagos",
  },
  { id:"t09", reference:"IB-2025-001242", userName:"Seun Adeyemi",     userPhone:"08089012308", type:"topup",    amount:15000,  status:"successful", createdAt:"2025-02-10T09:45:00" },
  {
    id:"t10", reference:"IB-2025-001243", userName:"Emeka Nwosu", userPhone:"08023456702",
    type:"payment", amount:12500, status:"successful", createdAt:"2025-02-10T10:30:00",
    materials:[{name:"PET Bottles",kg:55,pricePerKg:120},{name:"Aluminum Cans",kg:8,pricePerKg:350},{name:"Cardboard",kg:40,pricePerKg:60}],
    totalWeight:103, images:["p1","p2","p3","p4"],
    address:"5 Admiralty Way, Lekki Phase 1, Lagos",
  },
  { id:"t11", reference:"IB-2025-001244", userName:"Ifunanya Mbeki",   userPhone:"08090123409", type:"topup",    amount:30000,  status:"successful", createdAt:"2025-02-10T11:00:00" },
  {
    id:"t12", reference:"IB-2025-001245", userName:"Rotimi Oladele", userPhone:"08001234510",
    type:"payment", amount:9500, status:"pending", createdAt:"2025-02-10T11:30:00",
    materials:[{name:"E-waste / Electronics",kg:6,pricePerKg:800},{name:"Copper Wire",kg:4,pricePerKg:700}],
    totalWeight:10, images:["p1","p2"],
    address:"31 Obafemi Awolowo Way, Ikeja GRA, Lagos",
  },
  { id:"t13", reference:"IB-2025-001246", userName:"Chiamaka Ike",     userPhone:"08012345611", type:"topup",    amount:8000,   status:"successful", createdAt:"2025-02-10T13:00:00" },
  {
    id:"t14", reference:"IB-2025-001247", userName:"Chiamaka Ike", userPhone:"08012345611",
    type:"payment", amount:22000, status:"successful", createdAt:"2025-02-10T13:45:00",
    materials:[{name:"PET Bottles",kg:80,pricePerKg:120},{name:"Aluminum",kg:15,pricePerKg:350},{name:"Mixed Plastics",kg:40,pricePerKg:100}],
    totalWeight:135, images:["p1","p2","p3","p4","p5"],
    address:"12 Eko Atlantic Boulevard, Lagos Island, Lagos",
  },
  {
    id:"t15", reference:"IB-2025-001248", userName:"Chibueze Okafor", userPhone:"08023456812",
    type:"payment", amount:18000, status:"successful", createdAt:"2025-02-10T14:20:00",
    materials:[{name:"HDPE Plastics",kg:90,pricePerKg:130},{name:"Glass Bottles",kg:60,pricePerKg:50},{name:"Paper",kg:80,pricePerKg:40}],
    totalWeight:230, images:["p1","p2","p3"],
    address:"7 Akin Adesola Street, Victoria Island, Lagos",
  },
  { id:"t16", reference:"IB-2025-001249", userName:"Amaka Chioma",     userPhone:"08056789005", type:"reversal", amount:7500,   status:"reversed",   createdAt:"2025-02-10T15:00:00" },
  { id:"t17", reference:"IB-2025-001250", userName:"Adaobi Nwachukwu", userPhone:"08034567913", type:"topup",    amount:40000,  status:"successful", createdAt:"2025-02-09T08:30:00" },
  { id:"t18", reference:"IB-2025-001251", userName:"Tunde Fashola",    userPhone:"08045678114", type:"topup",    amount:100000, status:"successful", createdAt:"2025-02-09T09:15:00" },
  {
    id:"t19", reference:"IB-2025-001252", userName:"Tunde Fashola", userPhone:"08045678114",
    type:"payment", amount:35000, status:"successful", createdAt:"2025-02-09T10:00:00",
    materials:[{name:"Aluminum Cans",kg:30,pricePerKg:350},{name:"Copper",kg:8,pricePerKg:1200},{name:"PET Bottles",kg:100,pricePerKg:120}],
    totalWeight:138, images:["p1","p2","p3","p4","p5","p6"],
    address:"45 Broad Street, Lagos Island, Lagos",
  },
  {
    id:"t20", reference:"IB-2025-001253", userName:"Obioma Nzeh", userPhone:"08056789215",
    type:"payment", amount:6500, status:"successful", createdAt:"2025-02-09T10:45:00",
    materials:[{name:"Tetra Pak",kg:35,pricePerKg:100},{name:"Nylon Bags",kg:40,pricePerKg:80}],
    totalWeight:75, images:["p1","p2"],
    address:"19 Commercial Avenue, Sabo, Yaba, Lagos",
  },
  { id:"t21", reference:"IB-2025-001254", userName:"Rotimi Oladele",   userPhone:"08001234510", type:"reversal", amount:9500,   status:"reversed",   createdAt:"2025-02-09T11:30:00" },
  {
    id:"t22", reference:"IB-2025-001255", userName:"Grace Nwosu", userPhone:"08090123619",
    type:"payment", amount:11000, status:"successful", createdAt:"2025-02-09T13:00:00",
    materials:[{name:"PET Bottles",kg:50,pricePerKg:120},{name:"Cardboard",kg:50,pricePerKg:60},{name:"Paper",kg:50,pricePerKg:40}],
    totalWeight:150, images:["p1","p2","p3"],
    address:"3 Moloney Street, Lagos Island, Lagos",
  },
  { id:"t23", reference:"IB-2025-001256", userName:"Femi Adeyinka",    userPhone:"08089012518", type:"topup",    amount:20000,  status:"successful", createdAt:"2025-02-09T14:00:00" },
  {
    id:"t24", reference:"IB-2025-001257", userName:"Sola Adeleke", userPhone:"08001234720",
    type:"payment", amount:4000, status:"successful", createdAt:"2025-02-09T15:00:00",
    materials:[{name:"Mixed Plastics",kg:30,pricePerKg:100},{name:"Nylon",kg:12,pricePerKg:80}],
    totalWeight:42, images:["p1"],
    address:"28 Randle Avenue, Surulere, Lagos",
  },
  { id:"t25", reference:"IB-2025-001258", userName:"Blessing Okeke",   userPhone:"08012345821", type:"topup",    amount:35000,  status:"successful", createdAt:"2025-02-08T09:00:00" },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────

const TX_TYPE_META: Record<TxType, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  topup:    { label: "Top-up",   icon: ArrowDownCircle, bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  payment:  { label: "Payment",  icon: ArrowUpCircle,   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"  },
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
                  No payments found
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
          {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
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
  { value: "payment",  label: "Payments",  icon: ArrowUpCircle   },
  { value: "reversal", label: "Reversals", icon: RefreshCw       },
];

// ── Main page ─────────────────────────────────────────────────────────────────

const InstantBuyPage = () => {
  const [activeTab, setActiveTab] = useState<TxType>("topup");

  const { data: summaryRes, isLoading: summaryLoading } = useGetInstantBuySummaryQuery();
  const summary = summaryRes?.data;

  const monthlyData = useMemo(() => genMonthly(), []);
  const dailyData   = useMemo(() => genDaily(),   []);

  // Derive summary totals from seed when API not connected
  const totalFunded   = summary?.totalFunded   ?? monthlyData.reduce((s, d) => s + d.topups,   0);
  const totalPayments = summary?.totalPayments ?? monthlyData.reduce((s, d) => s + d.payments, 0);
  const netBalance    = totalFunded - totalPayments;
  const activeWallets = summary?.activeWallets        ?? 2341;
  const successRate   = summary?.successRate          ?? 94.2;
  const avgTxValue    = summary?.avgTransactionValue  ?? 16500;

  const kpiCards: KpiCardProps[] = [
    {
      label: "Total Wallet Top-ups",
      value: naira(totalFunded),
      sub: `${SEED_TXN.filter(t => t.type === "topup").length} top-up transactions`,
      trend: { value: "18.3%", up: true },
      icon: Wallet,
      iconBg: "bg-primary/10", iconColor: "text-primary",
      highlight: true, isLoading: false,
    },
    {
      label: "Total Payments",
      value: naira(totalPayments),
      sub: `${SEED_TXN.filter(t => t.type === "payment").length} payment transactions`,
      trend: { value: "15.1%", up: true },
      icon: ArrowUpCircle,
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
      isLoading: false,
    },
    {
      label: "Net Wallet Balance",
      value: naira(Math.abs(netBalance)),
      sub: "Funds remaining in wallets",
      icon: TrendingUp,
      iconBg: "bg-green-50", iconColor: "text-green-600",
      isLoading: false,
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
            <p className="text-sm text-muted-foreground">Wallet funding and payment activity overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Last 12 Months
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
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
              Top-ups funded vs payments made — last 12 months
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
                <Area type="monotone" dataKey="payments" name="Payments" stroke="#2563eb" strokeWidth={2.5}
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
          { label: "Avg. Transaction",  value: naira(avgTxValue), icon: CreditCard,  bg: "bg-primary/10", color: "text-primary"    },
          { label: "Bank Transfers",    value: "38%",              icon: Building,    bg: "bg-blue-50",    color: "text-blue-600"   },
          { label: "Card Payments",     value: "34%",              icon: CreditCard,  bg: "bg-indigo-50",  color: "text-indigo-600" },
          { label: "USSD Transactions", value: "28%",              icon: Smartphone,  bg: "bg-amber-50",   color: "text-amber-600"  },
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

      {/* ── Transaction log ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Transaction Log</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete record of wallet top-ups, payments and reversals
            </p>
          </div>
          {/* Demo badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">Demo data</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TxType)}>
          <TabsList className="h-10 bg-muted/50 border border-border rounded-xl p-1 flex-wrap gap-1 mb-4">
            {TABS.map((tab) => {
              const cnt = SEED_TXN.filter((t) => t.type === tab.value).length;
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
                <PaymentsTable data={SEED_TXN.filter(t => t.type === "payment")} />
              ) : (
                <TxTable data={SEED_TXN.filter(t => t.type === tab.value)} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default InstantBuyPage;
