import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { payMockAppointmentAction } from "@/lib/actions/appointments";
import { getAppointment } from "@/lib/api/appointments";
import { ApiError } from "@/lib/api/client";
import { getDoctor } from "@/lib/api/doctors";

export const instant = false;

export default async function PayAppointmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("patient");

  let appointment;
  try {
    appointment = await getAppointment(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const doctor = await getDoctor(appointment.doctorId);

  if (appointment.paymentStatus === "paid") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h1 className="text-xl font-semibold text-foreground">
          {t("paymentSuccessTitle")}
        </h1>
        <p className="text-sm text-muted">{t("paymentSuccessBody")}</p>
        <Link
          href="/patient/history?tab=appointments"
          className="text-sm font-medium text-primary"
        >
          {t("goToAppointments")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-16">
      <h1 className="text-xl font-semibold text-foreground">{t("payNow")}</h1>
      <Card className="flex flex-col gap-2 p-5">
        <p className="font-medium text-foreground">{doctor.name}</p>
        <p className="text-sm text-muted">
          {new Date(appointment.start).toLocaleString()}
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          ETB {appointment.fee}
        </p>
      </Card>
      <form action={payMockAppointmentAction}>
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" className="w-full">
          {t("payNow")}
        </Button>
      </form>
    </div>
  );
}
