"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

export function LocationPicker({
  value,
  onChange,
  height = 260,
}: {
  value: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
  height?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] border border-border"
      style={{ height }}
    >
      <MapContainer
        center={[value.lat, value.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[value.lat, value.lng]} icon={markerIcon} />
        <ClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
      </MapContainer>
    </div>
  );
}
