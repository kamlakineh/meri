import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { MessageButton } from "@/components/layout/MessageButton";
import { SlotPicker } from "@/components/patient/SlotPicker";
import { ApiError } from "@/lib/api/client";
import { getDoctor } from "@/lib/api/doctors";
import { getDoctorAvailability } from "@/lib/api/appointments";
import { listReviews } from "@/lib/api/reviews";

export const instant = false;

export default async function DoctorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { locale, doctorId } = await params;
  const { caseId } = await searchParams;
  const t = await getTranslations("patient");

  let doctor;
  try {
    doctor = await getDoctor(doctorId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [availability, reviews] = await Promise.all([
    getDoctorAvailability(doctorId),
    listReviews({ doctorId }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={doctor.name}
        subtitle={doctor.specialty}
        actions={
          <MessageButton
            participantUserId={doctor.userId}
            participantRole="doctor"
            locale={locale}
            label={t("messageFacility")}
          />
        }
      />

      <Card className="flex items-center gap-4 p-5">
        <Avatar name={doctor.name} size={48} />
        <div>
          <p className="font-medium text-foreground">{doctor.name}</p>
          <p className="text-sm text-muted">{doctor.specialty}</p>
          <p className="text-sm text-muted">
            {t("consultationFee", { fee: doctor.consultationFee })}
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-foreground">
          {t("availableSlotsTitle")}
        </h2>
        <SlotPicker
          doctorId={doctor.id}
          slots={availability.slots.slice(0, 30)}
          locale={locale}
          caseId={caseId}
          noSlotsLabel={t("noSlots")}
        />
      </Card>

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
                  <p className="font-medium text-foreground">{review.authorName}</p>
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
