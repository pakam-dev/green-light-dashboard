import { useState, useMemo } from "react";
import {
  Calendar,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  List,
  Map,
  MapPin,
  Trophy,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  ImageOff,
  User,
  Phone,
  Hash,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useGetSchedulesByTypeAndStatusQuery,
  useGetScheduleLocationStatsQuery,
  Pickup,
  ScheduleType,
  ScheduleStatus,
  wasteCategory,
} from "@/store/api/pickupsApi";
import { ScheduleMapView } from "@/components/schedules/ScheduleMapView";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Expandable Schedule Table ─────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ScheduleTable = ({
  data,
  isLoading,
  emptyMessage,
}: {
  data: Pickup[];
  isLoading: boolean;
  emptyMessage: string;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.scheduleCreator?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.phone?.includes(q),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

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
    <div className="space-y-4 mt-2">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, address or phone…"
          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Waste Categories</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((row) => {
                  const isOpen = expandedId === row.id;
                  return (
                    <>
                      {/* Main row */}
                      <tr
                        key={row.id}
                        className={`transition-colors ${isOpen ? "bg-primary/5" : "hover:bg-muted/30"}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {row.scheduleCreator ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                          {row.phone ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {row.address ?? "—"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {row.categories?.slice(0, 2).map((cat: wasteCategory, i: number) => (
                              <Badge key={i} variant="outline" className="capitalize text-xs">{cat.name}</Badge>
                            ))}
                            {(row.categories?.length ?? 0) > 2 && (
                              <Badge variant="outline" className="text-xs">+{row.categories.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                          {row.quantity ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {row.createdAt ? fmtDate(row.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toggle(row.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            {isOpen ? (
                              <><ChevronUp className="h-3 w-3" /> Close</>
                            ) : (
                              <><ChevronDown className="h-3 w-3" /> View More</>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isOpen && (
                        <tr key={`${row.id}-detail`} className="bg-primary/5">
                          <td colSpan={7} className="px-5 pb-5 pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                              {/* Left: schedule info */}
                              <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Schedule Details</p>

                                <div className="flex items-start gap-2.5">
                                  <User className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Full Name</p>
                                    <p className="text-sm font-medium text-foreground">{row.scheduleCreator ?? "—"}</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <Phone className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
                                    <p className="text-sm font-medium text-foreground">{row.phone ?? "—"}</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Address</p>
                                    <p className="text-sm font-medium text-foreground">{row.address ?? "—"}</p>
                                  </div>
                                </div>

                                {(row.lat || row.long) && (
                                  <div className="flex items-start gap-2.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Coordinates</p>
                                      <p className="text-sm font-medium text-foreground tabular-nums">
                                        {row.lat}, {row.long}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <Hash className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Quantity</p>
                                    <p className="text-sm font-medium text-foreground">{row.quantity ?? "—"}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Waste Categories</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {row.categories?.length > 0
                                      ? row.categories.map((cat: wasteCategory, i: number) => (
                                          <Badge key={i} variant="outline" className="capitalize">{cat.name}</Badge>
                                        ))
                                      : <span className="text-sm text-muted-foreground">—</span>
                                    }
                                  </div>
                                </div>

                                {row.collectorName && (
                                  <div className="flex items-start gap-2.5">
                                    <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assigned Collector</p>
                                      <p className="text-sm font-medium text-foreground">{row.collectorName}</p>
                                    </div>
                                  </div>
                                )}

                                {row.notes && (
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                                    <p className="text-sm text-foreground">{row.notes}</p>
                                  </div>
                                )}

                                <p className="text-xs text-muted-foreground pt-1">
                                  Scheduled: <span className="font-medium text-foreground">{row.createdAt ? fmtDate(row.createdAt) : "—"}</span>
                                </p>
                              </div>

                              {/* Right: images */}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Images</p>
                                {row.images && row.images.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {row.images.map((src, i) => (
                                      <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={src}
                                          alt={`Schedule image ${i + 1}`}
                                          className="w-full h-28 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border h-28 gap-2 text-muted-foreground">
                                    <ImageOff className="h-6 w-6 opacity-40" />
                                    <p className="text-xs">No images uploaded</p>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-xs text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = totalPages <= 5 ? i + 1 : safePage <= 3 ? i + 1 : safePage >= totalPages - 2 ? totalPages - 4 + i : safePage - 2 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                        pg === safePage
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Mini stat card (clickable) ────────────────────────────────────────────────

const MiniStat = ({
  label, count, isLoading, icon: Icon, iconBg, iconColor, active, onClick,
}: {
  label: string; count: number; isLoading: boolean;
  icon: React.ElementType; iconBg: string; iconColor: string;
  active: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-2xl border p-4 shadow-sm flex items-center gap-3 transition-all bg-white ${
      active ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/30"
    }`}
  >
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${iconBg}`}>
      <Icon className={iconColor} style={{ height: "1.125rem", width: "1.125rem" }} />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {isLoading ? (
        <div className="mt-0.5 h-6 w-14 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-xl font-bold text-foreground tabular-nums">{count.toLocaleString()}</p>
      )}
    </div>
  </button>
);

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: {
  value: ScheduleStatus; label: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
}[] = [
  { value: "pending",   label: "Pending",   icon: Clock,        iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { value: "completed", label: "Completed", icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-600" },
  { value: "cancelled", label: "Cancelled", icon: XCircle,      iconBg: "bg-red-50",   iconColor: "text-red-500"   },
];

// ── View toggle ───────────────────────────────────────────────────────────────

const ViewToggle = ({ view, onChange }: { view: "list" | "map"; onChange: (v: "list" | "map") => void }) => (
  <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted/50 p-1">
    {(["list", "map"] as const).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        title={v === "list" ? "List view" : "Map view"}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
          view === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {v === "list" ? <><List className="h-3.5 w-3.5" /> List</> : <><Map className="h-3.5 w-3.5" /> Map</>}
      </button>
    ))}
  </div>
);

// ── Top Locations Panel ───────────────────────────────────────────────────────

function TopLocationsPanel({ title, color, icon: Icon, data }: {
  title: string; color: string; icon: React.ElementType;
  data: { state: string; count: number }[];
}) {
  const max = data[0]?.count ?? 1;
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">By location</p>
          </div>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{data[0].state}</span>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-sm">No data available</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {data.map((loc, i) => {
              const isTop = i === 0;
              return (
                <div key={loc.state} className="flex items-center gap-2">
                  <span className={`w-4 text-xs font-bold shrink-0 text-right ${isTop ? "text-amber-500" : "text-muted-foreground"}`}>{i + 1}</span>
                  <MapPin className={`h-3 w-3 shrink-0 ${isTop ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className={`w-28 text-xs shrink-0 truncate ${isTop ? "font-semibold text-foreground" : "text-foreground"}`}>{loc.state}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(loc.count / max) * 100}%`, background: isTop ? "#d97706" : color }} />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold tabular-nums text-foreground shrink-0">{loc.count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-right border-t border-border pt-2">
            Total: {data.reduce((s, l) => s + l.count, 0).toLocaleString()} schedules
          </p>
        </>
      )}
    </div>
  );
}

// ── Per-type view ─────────────────────────────────────────────────────────────

const ScheduleTypeView = ({ scheduleType }: { scheduleType: ScheduleType }) => {
  const [activeStatus, setActiveStatus] = useState<ScheduleStatus>("pending");
  const [viewMode, setViewMode]         = useState<"list" | "map">("list");

  const { data: pendingRes,   isLoading: pendingLoading   } = useGetSchedulesByTypeAndStatusQuery({ scheduleType, status: "pending"   });
  const { data: completedRes, isLoading: completedLoading } = useGetSchedulesByTypeAndStatusQuery({ scheduleType, status: "completed" });
  const { data: cancelledRes, isLoading: cancelledLoading } = useGetSchedulesByTypeAndStatusQuery({ scheduleType, status: "cancelled" });

  const dataMap: Record<ScheduleStatus, { rows: Pickup[]; total: number; isLoading: boolean }> = {
    pending:   { rows: pendingRes?.data?.data   ?? [], total: pendingRes?.data?.total   ?? 0, isLoading: pendingLoading   },
    completed: { rows: completedRes?.data?.data ?? [], total: completedRes?.data?.total ?? 0, isLoading: completedLoading },
    cancelled: { rows: cancelledRes?.data?.data ?? [], total: cancelledRes?.data?.total ?? 0, isLoading: cancelledLoading },
  };

  const noun = scheduleType === "pickup" ? "Pickup" : "Dropoff";

  return (
    <div className="space-y-4">
      {/* Stat cards + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="grid grid-cols-3 gap-3 flex-1">
          {STATUS_CONFIG.map((cfg) => (
            <MiniStat
              key={cfg.value}
              label={`${cfg.label} ${noun}s`}
              count={dataMap[cfg.value].total}
              isLoading={dataMap[cfg.value].isLoading}
              icon={cfg.icon}
              iconBg={cfg.iconBg}
              iconColor={cfg.iconColor}
              active={activeStatus === cfg.value && viewMode === "list"}
              onClick={() => { setActiveStatus(cfg.value); setViewMode("list"); }}
            />
          ))}
        </div>
        <ViewToggle view={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "list" && (
        <Tabs value={activeStatus} onValueChange={(v) => setActiveStatus(v as ScheduleStatus)}>
          <TabsList className="h-10 bg-muted/50 border border-border rounded-xl p-1 gap-1">
            {STATUS_CONFIG.map((cfg) => (
              <TabsTrigger
                key={cfg.value}
                value={cfg.value}
                className="rounded-lg px-5 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
              >
                {cfg.label}
                {!dataMap[cfg.value].isLoading && dataMap[cfg.value].total > 0 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                    {dataMap[cfg.value].total.toLocaleString()}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_CONFIG.map((cfg) => (
            <TabsContent key={cfg.value} value={cfg.value} className="mt-4 focus-visible:outline-none">
              <ScheduleTable
                data={dataMap[cfg.value].rows}
                isLoading={dataMap[cfg.value].isLoading}
                emptyMessage={`No ${cfg.label.toLowerCase()} ${noun.toLowerCase()} schedules`}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {viewMode === "map" && <ScheduleMapView scheduleType={scheduleType} />}
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

type MainTab = ScheduleType;

const MAIN_TABS: { value: MainTab; label: string; icon: React.ElementType; description: string }[] = [
  { value: "pickup",  label: "Pickups",  icon: Truck,   description: "Waste collection scheduled from user locations"  },
  { value: "dropoff", label: "Dropoffs", icon: Package, description: "Waste drop-off scheduled at collection points"    },
];

const SchedulePage = () => {
  const [mainTab, setMainTab] = useState<MainTab>("pickup");

  const { data: pickupLocRes  } = useGetScheduleLocationStatsQuery({ type: "pickup"  });
  const { data: dropoffLocRes } = useGetScheduleLocationStatsQuery({ type: "dropoff" });

  const pickupLocations  = pickupLocRes?.data  ?? [];
  const dropoffLocations = dropoffLocRes?.data ?? [];

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Schedules</h1>
          <p className="text-sm text-muted-foreground">Manage pickup and dropoff schedules</p>
        </div>
      </div>

      {/* Top locations — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopLocationsPanel title="Top Pickup Locations"  color="#008300" icon={Truck}   data={pickupLocations}  />
        <TopLocationsPanel title="Top Dropoff Locations" color="#2563eb" icon={Package} data={dropoffLocations} />
      </div>

      {/* Type tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <TabsList className="h-auto bg-muted/50 border border-border rounded-xl p-1 gap-1 w-full sm:w-auto sm:inline-flex">
          {MAIN_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MAIN_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4 focus-visible:outline-none">
            <p className="text-xs text-muted-foreground mb-4">{tab.description}</p>
            <ScheduleTypeView scheduleType={tab.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SchedulePage;
