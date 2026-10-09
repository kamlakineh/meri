"use client";

import dynamic from "next/dynamic";
import type { Facility } from "@/lib/api/types";

// `leaflet` touches `window` at module-evaluation time, which crashes even
// inside a "use client" component during Next's initial SSR pass. Deferring
// the import entirely to the client (ssr: false) is the only reliable fix —
// this requires the dynamic() call to live in its own Client Component,
// since ssr: false isn't allowed directly inside a Server Component.
const FacilityMap = dynamic(
  () => import("./FacilityMap").then((mod) => mod.FacilityMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 animate-pulse rounded-[var(--radius-card)] border border-border bg-border/40" />
    ),
  }
);

export function FacilityMapLoader({
  facilities,
  height,
}: {
  facilities: Facility[];
  height?: number;
}) {
  return <FacilityMap facilities={facilities} height={height} />;
}
