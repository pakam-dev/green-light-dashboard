import { useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { FlaskConical, X } from "lucide-react";
import { ScheduleType, ScheduleStatus } from "@/store/api/pickupsApi";
import {
  MapSchedule,
  getSeedByType,
  STATUS_META,
} from "@/lib/scheduleMapTestData";

// ── Map config ────────────────────────────────────────────────────────────────

const CONTAINER_STYLE: React.CSSProperties = { width: "100%", height: "100%" };

// Lagos centre
const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 6.5244, lng: 3.3792 };

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "landscape",      elementType: "all",               stylers: [{ color: "#f3f4f6" }] },
  { featureType: "poi",            elementType: "all",               stylers: [{ visibility: "off" }] },
  { featureType: "road",           elementType: "all",               stylers: [{ saturation: -100 }, { lightness: 50 }] },
  { featureType: "road.highway",   elementType: "all",               stylers: [{ visibility: "simplified" }] },
  { featureType: "road.arterial",  elementType: "labels.icon",       stylers: [{ visibility: "off" }] },
  { featureType: "transit",        elementType: "all",               stylers: [{ visibility: "off" }] },
  { featureType: "water",          elementType: "all",               stylers: [{ color: "#bfdbfe" }, { visibility: "on" }] },
];

// ── SVG pin icon per status ────────────────────────────────────────────────────

function markerIcon(status: ScheduleStatus): google.maps.Icon {
  const color = STATUS_META[status].color;
  const svg = `
    <svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 28 16 28s16-17.333 16-28C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.9"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(32, 44),
    anchor: new window.google.maps.Point(16, 44),
  };
}

// ── Info window card ──────────────────────────────────────────────────────────

const InfoCard = ({
  schedule,
  onClose,
}: {
  schedule: MapSchedule;
  onClose: () => void;
}) => {
  const meta = STATUS_META[schedule.status];
  return (
    <div className="font-sans w-64">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">
            {schedule.scheduleCreator}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{schedule.phone}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Address</span>
          <p className="text-gray-700 mt-0.5">{schedule.address}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Quantity</span>
            <p className="text-gray-700 font-semibold mt-0.5">{schedule.quantity}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Date</span>
            <p className="text-gray-700 mt-0.5">
              {new Date(schedule.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <div>
          <span className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Categories</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {schedule.categories.map((c) => (
              <span
                key={c.catId}
                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

interface ScheduleMapViewProps {
  scheduleType: ScheduleType;
}

type StatusFilter = ScheduleStatus | "all";

const ALL_STATUSES: ScheduleStatus[] = ["pending", "completed", "cancelled"];

export const ScheduleMapView = ({ scheduleType }: ScheduleMapViewProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const allSchedules = getSeedByType(scheduleType);
  const visible = allSchedules.filter(
    (s) => statusFilter === "all" || s.status === statusFilter
  );
  const selectedSchedule = visible.find((s) => s.id === selectedId) ?? null;

  const counts = ALL_STATUSES.reduce((acc, st) => {
    acc[st] = allSchedules.filter((s) => s.status === st).length;
    return acc;
  }, {} as Record<ScheduleStatus, number>);

  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
    // Fit to visible markers
    const bounds = new window.google.maps.LatLngBounds();
    allSchedules.forEach((s) => bounds.extend({ lat: s.lat, lng: s.long }));
    m.fitBounds(bounds, 60);
  }, []);

  // ── Error / loading states ────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-border bg-muted/30 text-center px-6">
        <p className="text-sm font-medium text-foreground">Failed to load Google Maps</p>
        <p className="text-xs text-muted-foreground mt-1">Check your network connection and API key.</p>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-dashed border-border bg-muted/20 text-center px-6 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <FlaskConical className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Google Maps API key not configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file to enable the map view.
          </p>
        </div>
      </div>
    );
  }

  // ── Map ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Test-data banner */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
        <FlaskConical className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Demo data</span> — showing{" "}
          {allSchedules.length} test locations across Lagos. Live lat/long
          coordinates from the backend will replace these automatically.
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({allSchedules.length})
          </button>
          {ALL_STATUSES.map((st) => {
            const meta = STATUS_META[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all capitalize ${
                  statusFilter === st
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {meta.label} ({counts[st]})
              </button>
            );
          })}
        </div>

        {/* Legend dots */}
        <div className="flex items-center gap-3 ml-auto">
          {ALL_STATUSES.map((st) => (
            <div key={st} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_META[st].color }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {STATUS_META[st].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-[480px] rounded-2xl overflow-hidden border border-border shadow-sm">
        {!isLoaded ? (
          <div className="flex h-full items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={CONTAINER_STYLE}
            center={DEFAULT_CENTER}
            zoom={11}
            options={{
              styles: MAP_STYLES,
              scrollwheel: true,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
            onLoad={onMapLoad}
          >
            {visible.map((schedule) => (
              <Marker
                key={schedule.id}
                position={{ lat: schedule.lat, lng: schedule.long }}
                icon={markerIcon(schedule.status)}
                onClick={() =>
                  setSelectedId(
                    selectedId === schedule.id ? null : schedule.id
                  )
                }
              >
                {selectedSchedule?.id === schedule.id && (
                  <InfoWindow
                    position={{ lat: schedule.lat, lng: schedule.long }}
                    onCloseClick={() => setSelectedId(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -44) }}
                  >
                    <InfoCard schedule={schedule} onClose={() => setSelectedId(null)} />
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        )}
      </div>

      {/* Summary footer */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-1">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{visible.length}</span>{" "}
          {scheduleType === "pickup" ? "pickup" : "dropoff"} locations shown
        </p>
        {ALL_STATUSES.map((st) => {
          const meta = STATUS_META[st];
          const cnt = visible.filter((s) => s.status === st).length;
          if (cnt === 0) return null;
          return (
            <p key={st} className={`text-xs font-medium ${meta.textClass}`}>
              {cnt} {meta.label.toLowerCase()}
            </p>
          );
        })}
      </div>
    </div>
  );
};
