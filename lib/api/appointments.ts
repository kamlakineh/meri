import { apiFetch } from "./client";
import type { Appointment, AppointmentStatus, Paginated } from "./types";

export function listAppointments(
  params: { status?: AppointmentStatus; page?: number; pageSize?: number } = {}
) {
  return apiFetch<Paginated<Appointment>>("/appointments", {
    searchParams: params,
  });
}

export function getAppointment(appointmentId: string) {
  return apiFetch<Appointment>(`/appointments/${appointmentId}`);
}

export function createAppointment(input: {
  doctorId: string;
  caseId?: string;
  start: string;
  end: string;
}) {
  return apiFetch<Appointment>("/appointments", {
    method: "POST",
    body: input,
  });
}

export function updateAppointment(
  appointmentId: string,
  input: Partial<{
    status: AppointmentStatus;
    paymentStatus: "unpaid" | "paid";
    start: string;
    end: string;
  }>
) {
  return apiFetch<Appointment>(`/appointments/${appointmentId}`, {
    method: "PATCH",
    body: input,
  });
}

export function getDoctorAvailability(
  doctorId: string,
  params: { from?: string; to?: string } = {}
) {
  return apiFetch<{ doctorId: string; slots: { start: string; end: string }[] }>(
    `/doctors/${doctorId}/availability`,
    { searchParams: params }
  );
}
