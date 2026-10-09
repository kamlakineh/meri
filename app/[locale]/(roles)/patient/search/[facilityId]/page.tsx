import { MapPin, Phone, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageButton } from "@/components/layout/MessageButton";
import { Link } from "@/i18n/navigation";
import { listDoctors } from "@/lib/api/doctors";
import { listReviews } from "@/lib/api/reviews";
import { getFacility } from "@/lib/api/search";
import { ApiError } from "@/lib/api/client";

export const instant = false;

export default async function FacilityProfilePage({
  params,
}: {
  params: Promise<{ locale: string; facilityId: string }>;
}) {
  const { locale, facilityId } = await params;
  const t = await getTranslations("patient");

  let facility;
  try {
    facility = await getFacility(facilityId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [doctors, reviews] = await Promise.all([
    listDoctors({ facilityId }),
    listReviews({ facilityId }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={facility.name}
        subtitle={facility.address}
        actions={
          facility.contactUserId && (
            <MessageButton
              participantUserId={facility.contactUserId}
              participantRole={facility.type === "pharmacy" ? "pharmacy" : "hospital"}
              locale={locale}
              label={t("messageFacility")}
            />
          )
        }
      />

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{facility.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({t.raw("reviewsCount").replace("{count}", String(facility.reviewCount))})
            </span>
          </div>
          <Badge tone={facility.openNow ? "success" : "neutral"}>
            {facility.openNow ? t("openNowBadge") : t("closedBadge")}
          </Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Phone className="h-4 w-4" />
            {facility.phone}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            {facility.address}
          </span>
        </div>

        {facility.hours.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("hoursLabel")}
            </p>
            <ul className="mt-1 text-sm text-foreground">
              {facility.hours.map((h, i) => (
                <li key={i}>
                  {h.day}: {h.open}–{h.close}
                </li>
              ))}
            </ul>
          </div>
        )}

        {facility.services.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("servicesLabel")}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {facility.services.map((s) => (
                <Badge key={s} tone="info">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {facility.specialties.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("specialtiesLabel")}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {facility.specialties.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {facility.departments.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("departmentsLabel")}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {facility.departments.map((d) => (
                <Badge key={d}>{d}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {doctors.data.length > 0 && (
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">{t("doctorsAtFacility")}</h2>
          </div>
          <div className="divide-y divide-border">
            {doctors.data.map((doctor) => (
              <div key={doctor.id} className="flex items-center gap-3 p-4">
                <Avatar name={doctor.name} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{doctor.name}</p>
                  <p className="text-sm text-muted">{doctor.specialty}</p>
                </div>
                <Link
                  href={`/patient/doctors/${doctor.id}`}
                  className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
                >
                  {t("bookWithDoctor")}
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("reviewsTitle")}</h2>
        </div>
        {reviews.data.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">{t("noReviews")}</p>
        ) : (
          <div className="divide-y divide-border">
            {reviews.data.map((review) => (
              <div key={review.id} className="flex gap-3 p-4">
                <Avatar name={review.authorName} size={32} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{review.authorName}</p>
                    <span className="flex items-center gap-0.5 text-xs text-warning">
                      <Star className="h-3.5 w-3.5 fill-warning" /> {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
