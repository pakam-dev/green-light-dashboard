import { useState, useMemo } from "react";
import { Users, CheckCircle2, Clock, Eye } from "lucide-react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReusableDataTable, TableColumn } from "@/components/dashboard/ReusableDataTable";
import { useDataTable } from "@/hooks/use-data-table";
import {
  useGetCollectorSummaryQuery,
  useGetCollectorsQuery,
  useUpdateCollectorMutation,
  Collector,
  CollectorStatus,
} from "@/store/api/collectorsApi";
import { MOCK_COLLECTOR_SUMMARY, MOCK_COLLECTORS } from "@/mock/mockData";

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Map constants ─────────────────────────────────────────────────────────────
const MAP_CONTAINER: React.CSSProperties = { width: "100%", height: "100%" };
const NIGERIA_CENTER: google.maps.LatLngLiteral = { lat: 7.5, lng: 5.0 };

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi",       elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit",   elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "all", stylers: [{ color: "#f4f4f4"  }] },
  { featureType: "road",      elementType: "all", stylers: [{ saturation: -100 }, { lightness: 45 }] },
  { featureType: "water",     elementType: "all", stylers: [{ color: "#93c5fd" }] },
];

function markerIcon(status: CollectorStatus): google.maps.Symbol {
  const fill =
    status === "on-assignment" ? "#f59e0b"
    : status === "online"      ? "#16a34a"
    :                            "#9ca3af";
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  highlight?: boolean;
}

function KpiCard({ label, value, icon: Icon, iconColor = "text-gray-600", highlight }: KpiCardProps) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${
      highlight ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium uppercase tracking-wide ${highlight ? "text-white/70" : "text-gray-500"}`}>
          {label}
        </span>
        <span className={`p-1.5 rounded-lg ${highlight ? "bg-white/20" : "bg-gray-100"}`}>
          <Icon className={`h-4 w-4 ${highlight ? "text-white" : iconColor}`} />
        </span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CollectorStatus }) {
  const cfg: Record<CollectorStatus, { cls: string; label: string }> = {
    "on-assignment": { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "On Assignment" },
    online:          { cls: "bg-green-50 text-green-700 border-green-200", label: "Online"        },
    offline:         { cls: "bg-gray-100 text-gray-500 border-gray-200",   label: "Offline"       },
  };
  const { cls, label } = cfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ── Map component ─────────────────────────────────────────────────────────────
interface CollectorMapProps {
  collectors: Collector[];
  center: google.maps.LatLngLiteral;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function CollectorMap({ collectors, center, selectedId, onSelect }: CollectorMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pinned   = collectors.filter((c) => c.lat != null && c.lng != null);
  const selected = pinned.find((c) => c.id === selectedId) ?? null;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={center}
      zoom={7}
      options={{ scrollwheel: true, styles: MAP_STYLES, fullscreenControl: false }}
    >
      {pinned.map((c) => (
        <Marker
          key={c.id}
          position={{ lat: c.lat!, lng: c.lng! }}
          icon={markerIcon(c.status)}
          onClick={() => onSelect(c.id === selectedId ? null : c.id)}
        >
          {selected?.id === c.id && (
            <InfoWindow onCloseClick={() => onSelect(null)}>
              <div className="text-xs space-y-1 min-w-[160px]">
                <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                <p className="text-gray-600">{c.phone}</p>
                <p className="text-gray-500">{c.currentAddress}</p>
                <p className="text-gray-400">
                  Completed today: <strong>{c.completedToday}</strong>
                </p>
                <p className="text-gray-400">Last seen: {fmtDateTime(c.lastSeen)}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}

// ── Map legend ────────────────────────────────────────────────────────────────
function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 px-3 py-2 flex items-center gap-4 text-xs text-gray-700 shadow-sm">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow" />
        On Assignment
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow" />
        Online
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" />
        Offline
      </span>
    </div>
  );
}

// ── Detail dialog ─────────────────────────────────────────────────────────────
function CollectorDetailDialog({
  collector,
  onClose,
}: {
  collector: Collector | null;
  onClose: () => void;
}) {
  if (!collector) return null;

  const rows: { label: string; value: string | number }[] = [
    { label: "Phone",            value: collector.phone },
    { label: "Email",            value: collector.email },
    { label: "Current Location", value: collector.currentAddress ?? "—" },
    { label: "Completed Today",  value: collector.completedToday },
    { label: "Total Completed",  value: collector.totalCompleted },
    { label: "Last Seen",        value: fmtDateTime(collector.lastSeen) },
    ...(collector.assignedScheduleId
      ? [{ label: "Assigned Schedule", value: collector.assignedScheduleId }]
      : []),
  ];

  return (
    <Dialog open={!!collector} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{collector.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={collector.status} />
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              collector.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}>
              {collector.isActive ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-xs text-gray-500 w-36 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CollectorsPage = () => {
  const [selectedMapId, setSelectedMapId]     = useState<string | null>(null);
  const [detailCollector, setDetailCollector] = useState<Collector | null>(null);
  const [togglingId, setTogglingId]           = useState<string | null>(null);
  // Local overrides for isActive — updated optimistically so toggle responds instantly
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});

  // ── API ───────────────────────────────────────────────────────────────────
  const { data: summaryRes }    = useGetCollectorSummaryQuery();
  const { data: collectorsRes } = useGetCollectorsQuery();
  const [updateCollector]       = useUpdateCollectorMutation();

  const summary       = summaryRes?.data ?? MOCK_COLLECTOR_SUMMARY;
  const apiCollectors = collectorsRes?.data?.data ?? [];
  const baseCollectors = (
    apiCollectors.length > 0 ? apiCollectors : (MOCK_COLLECTORS as Collector[])
  ) as Collector[];

  // Merge local overrides so toggle is always reflected in the UI
  const collectors = useMemo(
    () => baseCollectors.map((c) => ({
      ...c,
      isActive: c.id in activeOverrides ? activeOverrides[c.id] : c.isActive,
    })),
    [baseCollectors, activeOverrides],
  );

  // Table state (search + pagination)
  const tableState = useDataTable<Collector>({
    data: collectors,
    initialPageSize: 10,
    searchableFields: ["name", "phone", "email", "currentAddress"],
  });

  // Map center — fly to row selected from table
  const mapFocus = collectors.find((c) => c.id === selectedMapId);
  const mapCenter: google.maps.LatLngLiteral =
    mapFocus?.lat != null && mapFocus?.lng != null
      ? { lat: mapFocus.lat, lng: mapFocus.lng }
      : NIGERIA_CENTER;

  // ── Toggle ────────────────────────────────────────────────────────────────
  async function handleToggle(c: Collector) {
    const newValue = !(c.id in activeOverrides ? activeOverrides[c.id] : c.isActive);
    // Optimistic update — UI responds immediately regardless of API status
    setActiveOverrides((prev) => ({ ...prev, [c.id]: newValue }));
    setTogglingId(c.id);
    try {
      await updateCollector({ id: c.id, data: { isActive: newValue } }).unwrap();
    } catch {
      // API not yet connected — keep local state so UI stays responsive
    } finally {
      setTogglingId(null);
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: TableColumn<Collector>[] = [
    {
      key: "name",
      header: "Collector",
      render: (c) => (
        <div>
          <p className="font-medium text-gray-900">{c.name}</p>
          <p className="text-xs text-gray-400">{c.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone" },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "currentAddress",
      header: "Current Location",
      render: (c) => (
        <span className="text-xs text-gray-500">{c.currentAddress ?? "—"}</span>
      ),
    },
    {
      key: "completedToday",
      header: "Completed Today",
      render: (c) => <span className="font-semibold text-gray-900">{c.completedToday}</span>,
    },
    {
      key: "totalCompleted",
      header: "Total Completed",
      render: (c) => <span className="font-semibold text-gray-900">{c.totalCompleted}</span>,
    },
    {
      key: "isActive",
      header: "Active",
      render: (c) => (
        <Switch
          checked={c.isActive}
          disabled={togglingId === c.id}
          onCheckedChange={() => handleToggle(c)}
        />
      ),
    },
  ];

  const renderRowActions = (c: Collector) => (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs text-primary hover:text-primary/80"
      onClick={() => {
        setDetailCollector(c);
        if (c.lat != null) setSelectedMapId(c.id);
      }}
    >
      <Eye className="h-3.5 w-3.5 mr-1" />
      View More
    </Button>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Collectors</h1>
        <p className="text-muted-foreground">
          Live overview of all collector agents and their current locations
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Total Collectors"    value={summary.totalCollectors}   icon={Users}        highlight />
        <KpiCard label="Total Task Completed" value={summary.completedToday}    icon={CheckCircle2} iconColor="text-green-600" />
        <KpiCard label="Pending Tasks"        value={summary.onAssignmentCount} icon={Clock}        iconColor="text-amber-500" />
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Live Map</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Click "View More" on a row or a map pin to see collector details
          </p>
        </div>
        <div className="relative h-[420px]">
          <CollectorMap
            collectors={collectors}
            center={mapCenter}
            selectedId={selectedMapId}
            onSelect={setSelectedMapId}
          />
          <MapLegend />
        </div>
      </div>

      {/* Table with search + pagination */}
      <ReusableDataTable<Collector>
        tableState={tableState}
        columns={columns}
        showSearch
        showPagination
        showRefresh={false}
        showFilter={false}
        showExport={false}
        searchPlaceholder="Search collectors..."
        renderRowActions={renderRowActions}
        emptyMessage="No collectors found"
      />

      {/* Detail dialog */}
      <CollectorDetailDialog
        collector={detailCollector}
        onClose={() => setDetailCollector(null)}
      />
    </div>
  );
};

export default CollectorsPage;
