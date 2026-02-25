import { useState } from "react";
import {
  Calendar,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  List,
  Map,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReusableDataTable, TableColumn } from "@/components/dashboard/ReusableDataTable";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useGetSchedulesByTypeAndStatusQuery,
  Pickup,
  ScheduleType,
  ScheduleStatus,
  wasteCategory,
} from "@/store/api/pickupsApi";
import { ScheduleMapView } from "@/components/schedules/ScheduleMapView";

// ── Table columns ─────────────────────────────────────────────────────────────

const columns: TableColumn<Pickup>[] = [
  { key: "scheduleCreator", header: "Full Name" },
  { key: "address", header: "Location" },
  {
    key: "createdAt",
    header: "Created",
    render: (row) =>
      new Date(row.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  },
  {
    key: "categories",
    header: "Waste Categories",
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.categories.map((cat: wasteCategory, i: number) => (
          <Badge key={i} variant="outline" className="capitalize text-xs">
            {cat.name}
          </Badge>
        ))}
      </div>
    ),
  },
  { key: "phone", header: "Phone" },
  { key: "quantity", header: "Quantity" },
];

// ── Schedule table ─────────────────────────────────────────────────────────────

const ScheduleTable = ({
  data,
  isLoading,
  emptyMessage,
}: {
  data: Pickup[];
  isLoading: boolean;
  emptyMessage: string;
}) => {
  const tableState = useDataTable({
    data,
    searchableFields: ["scheduleCreator", "address", "phone"],
    initialPageSize: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ReusableDataTable
      tableState={tableState}
      columns={columns}
      searchPlaceholder="Search schedules…"
      emptyMessage={emptyMessage}
      showFilter={true}
      showExport={true}
      showRefresh={true}
    />
  );
};

// ── Mini stat card (clickable) ────────────────────────────────────────────────

const MiniStat = ({
  label,
  count,
  isLoading,
  icon: Icon,
  iconBg,
  iconColor,
  active,
  onClick,
}: {
  label: string;
  count: number;
  isLoading: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-2xl border p-4 shadow-sm flex items-center gap-3 transition-all bg-white ${
      active
        ? "border-primary ring-1 ring-primary/30"
        : "border-border hover:border-muted-foreground/30"
    }`}
  >
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${iconBg}`}
    >
      <Icon
        className={`${iconColor}`}
        style={{ height: "1.125rem", width: "1.125rem" }}
      />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {isLoading ? (
        <div className="mt-0.5 h-6 w-14 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-xl font-bold text-foreground tabular-nums">
          {count.toLocaleString()}
        </p>
      )}
    </div>
  </button>
);

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: {
  value: ScheduleStatus;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  { value: "pending",   label: "Pending",   icon: Clock,        iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { value: "completed", label: "Completed", icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-600" },
  { value: "cancelled", label: "Cancelled", icon: XCircle,      iconBg: "bg-red-50",   iconColor: "text-red-500"   },
];

// ── View toggle button ────────────────────────────────────────────────────────

const ViewToggle = ({
  view,
  onChange,
}: {
  view: "list" | "map";
  onChange: (v: "list" | "map") => void;
}) => (
  <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted/50 p-1">
    {(["list", "map"] as const).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        title={v === "list" ? "List view" : "Map view"}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
          view === v
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {v === "list" ? (
          <><List className="h-3.5 w-3.5" /> List</>
        ) : (
          <><Map className="h-3.5 w-3.5" /> Map</>
        )}
      </button>
    ))}
  </div>
);

// ── Per-type view ─────────────────────────────────────────────────────────────

const ScheduleTypeView = ({ scheduleType }: { scheduleType: ScheduleType }) => {
  const [activeStatus, setActiveStatus] = useState<ScheduleStatus>("pending");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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

      {/* List view */}
      {viewMode === "list" && (
        <Tabs
          value={activeStatus}
          onValueChange={(v) => setActiveStatus(v as ScheduleStatus)}
        >
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
            <TabsContent
              key={cfg.value}
              value={cfg.value}
              className="mt-4 focus-visible:outline-none"
            >
              <ScheduleTable
                data={dataMap[cfg.value].rows}
                isLoading={dataMap[cfg.value].isLoading}
                emptyMessage={`No ${cfg.label.toLowerCase()} ${noun.toLowerCase()} schedules`}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Map view */}
      {viewMode === "map" && (
        <ScheduleMapView scheduleType={scheduleType} />
      )}
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

type MainTab = ScheduleType;

const MAIN_TABS: {
  value: MainTab;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { value: "pickup",  label: "Pickups",  icon: Truck,   description: "Waste collection scheduled from user locations"   },
  { value: "dropoff", label: "Dropoffs", icon: Package, description: "Waste drop-off scheduled at collection points"     },
];

const SchedulePage = () => {
  const [mainTab, setMainTab] = useState<MainTab>("pickup");

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Schedules</h1>
          <p className="text-sm text-muted-foreground">
            Manage pickup and dropoff schedules
          </p>
        </div>
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
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-4 focus-visible:outline-none"
          >
            <p className="text-xs text-muted-foreground mb-4">{tab.description}</p>
            <ScheduleTypeView scheduleType={tab.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SchedulePage;
