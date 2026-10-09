"use server";

import { redirect } from "next/navigation";
import { createAppointment, updateAppointment } from "@/lib/api/appointments";

/** Books a slot and sends the patient to the (mock) payment step — P6. */
export async function bookAppointmentAction(formData: FormData) {
  const doctorId = String(formData.get("doctorId"));
  const start = String(formData.get("start"));
  const end = String(formData.get("end"));
  const locale = String(formData.get("locale"));
  const caseId = formData.get("caseId");

  const appointment = await createAppointment({
    doctorId,
    start,
    end,
    ...(caseId ? { caseId: String(caseId) } : {}),
  });

  redirect(`/${locale}/patient/appointments/${appointment.id}/pay`);
}

/**
 * Mock checkout — flips paymentStatus directly (see contracts/README.md,
 * "what's genuinely mocked"). A real payment gateway is a follow-up.
 */
export async function payMockAppointmentAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId"));
  const locale = String(formData.get("locale"));

  await updateAppointment(appointmentId, { paymentStatus: "paid" });

  redirect(`/${locale}/patient/appointments/${appointmentId}/pay`);
}
