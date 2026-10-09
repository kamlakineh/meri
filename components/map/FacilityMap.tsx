"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Facility } from "@/lib/api/types";

// Default leaflet marker assets don't resolve correctly through bundlers —
// point at the CDN copies instead of fighting Turbopack's asset handling.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function FacilityMap({
  facilities,
  height = 320,
}: {
  facilities: Facility[];
  height?: number;
}) {
  const center = facilities[0]?.location ?? { lat: 9.0107, lng: 38.7613 };

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] border border-border"
      style={{ height }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.location.lat, facility.location.lng]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{facility.name}</strong>
              <br />
              {facility.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
