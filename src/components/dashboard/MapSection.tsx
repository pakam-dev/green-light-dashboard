"use client";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

/* -------------------- TYPES -------------------- */

interface Category {
  name: string;
}

type CompletionStatus = "completed" | "pending" | "missed" | "cancelled";

interface Schedule {
  _id: string;
  lat: string | number;
  long: string | number;
  completionStatus: CompletionStatus;
  scheduleCreator: string;
  phone: string;
  categories: Category[];
  quantity: number;
  address: string;
  pickUpDate: string;
}

interface MapWrapperProps {
  schedulesLocation: Schedule[];
  isOpen: boolean;
  markerId: string | null;
  openInfo: (open: boolean, id?: string) => void;
}

/* -------------------- CONSTANTS -------------------- */

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};
const center: google.maps.LatLngLiteral = {
  lat: 6.5244,
  lng: 3.3792,
};

const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#5e72e4" }, { visibility: "on" }],
  },
];

/* -------------------- COMPONENT -------------------- */

export default function MapWrapper({
  schedulesLocation,
  isOpen,
  markerId,
  openInfo,
}: MapWrapperProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        scrollwheel: false,
        styles: mapStyles,
      }}
    >
      {schedulesLocation
        .filter(
          (s) =>
            s.completionStatus !== "missed" &&
            s.completionStatus !== "cancelled"
        )
        .map((schedule) => {
          const position: google.maps.LatLngLiteral = {
            lat: Number(schedule.lat),
            lng: Number(schedule.long),
          };

          return (
            <Marker
              key={schedule._id}
              position={position}
              icon={
                schedule.completionStatus === "completed"
                  ? "/assets/images/green_map_marker_icon.svg"
                  : "/assets/images/red_map_marker_icon.svg"
              }
              onClick={() => openInfo(true, schedule._id)}
            >
              {isOpen && markerId === schedule._id && (
                <InfoWindow onCloseClick={() => openInfo(false)}>
                  <div>
                    <h4>Pick Up Request</h4>

                    <h5 style={{ color: "#008001" }}>Client Name</h5>
                    <h5>{schedule.scheduleCreator}</h5>

                    <h5 style={{ color: "#008001" }}>Phone Number</h5>
                    <h5>{schedule.phone}</h5>

                    <h5 style={{ color: "#008001" }}>Categories</h5>
                    {schedule.categories.map((category, index) => (
                      <h5 key={index}>{category.name}</h5>
                    ))}

                    <h5 style={{ color: "#008001" }}>
                      {schedule.completionStatus === "completed"
                        ? "Quantity"
                        : "Number Of Bags"}
                    </h5>
                    <h5>
                      {schedule.quantity}
                      {schedule.completionStatus === "completed"
                        ? "KG"
                        : " Bags"}
                    </h5>

                    <h5 style={{ color: "#008001" }}>Address</h5>
                    <h5>{schedule.address}</h5>

                    <h5 style={{ color: "#008001" }}>Status</h5>
                    <h5>
                      {schedule.completionStatus === "completed"
                        ? "Completed"
                        : "Pending"}
                    </h5>

                    <h5 style={{ color: "#008001" }}>Call On Arrival</h5>
                    <h5>{schedule.phone}</h5>

                    <h5 style={{ color: "#008001" }}>Date</h5>
                    <h5>{schedule.pickUpDate.slice(0, 10)}</h5>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
    </GoogleMap>
  );
}
