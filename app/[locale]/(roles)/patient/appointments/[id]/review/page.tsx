import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewForm } from "@/components/patient/ReviewForm";
import { getAppointment } from "@/lib/api/appointments";
import { ApiError } from "@/lib/api/client";
import { getDoctor } from "@/lib/api/doctors";

export const instant = false;

export default async function LeaveReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("patient");

  let appointment;
  try {
    appointment = await getAppointment(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const doctor = await getDoctor(appointment.doctorId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("leaveReview")} />
      <ReviewForm
        doctorId={doctor.id}
        doctorName={doctor.name}
        ratingLabel={t("ratingLabel")}
        commentLabel={t("commentLabel")}
        submitLabel={t("submitReview")}
      />
    </div>
  );
}
