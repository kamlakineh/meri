import { MapPin, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import type { Facility } from "@/lib/api/types";

export function FacilityCard({
  facility,
  openNowLabel,
  closedLabel,
  viewProfileLabel,
  directionsLabel,
  reviewsLabel,
}: {
  facility: Facility;
  openNowLabel: string;
  closedLabel: string;
  viewProfileLabel: string;
  directionsLabel: string;
  reviewsLabel: string;
}) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.location.lat},${facility.location.lng}`;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {facility.type}
          </p>
          <h3 className="font-semibold text-foreground">{facility.name}</h3>
        </div>
        <Badge tone={facility.openNow ? "success" : "neutral"}>
          {facility.openNow ? openNowLabel : closedLabel}
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-sm text-foreground">
        <Star className="h-4 w-4 fill-warning text-warning" />
        <span className="font-medium">{facility.rating.toFixed(1)}</span>
        <span className="text-muted-foreground">
          ({reviewsLabel.replace("{count}", String(facility.reviewCount))})
        </span>
        {facility.distanceKm !== undefined && (
          <span className="ml-auto text-muted-foreground">
            {facility.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="flex items-start gap-1.5 text-sm text-muted">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{facility.address}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted">
        <Phone className="h-4 w-4 shrink-0" />
        <span>{facility.phone}</span>
      </div>

      <div className="mt-1 flex gap-2">
        <Link
          href={`/patient/search/${facility.id}`}
          className="flex-1 rounded-[var(--radius-control)] bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {viewProfileLabel}
        </Link>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-[var(--radius-control)] border border-border px-3 py-2 text-center text-sm font-medium text-foreground hover:bg-background"
        >
          {directionsLabel}
        </a>
      </div>
    </Card>
  );
}
