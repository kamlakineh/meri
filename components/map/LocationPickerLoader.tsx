"use client";

import dynamic from "next/dynamic";

// See FacilityMapLoader.tsx — leaflet must never load during SSR.
const LocationPicker = dynamic(
  () => import("./LocationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-[var(--radius-card)] border border-border bg-border/40" />
    ),
  }
);

export function LocationPickerLoader({
  value,
  onChange,
  height,
}: {
  value: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
  height?: number;
}) {
  return <LocationPicker value={value} onChange={onChange} height={height} />;
}
