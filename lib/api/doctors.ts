import { apiFetch } from "./client";
import type { Doctor, Payout, WeeklyAvailabilitySlot } from "./types";

export function listDoctors(params: { specialty?: string; facilityId?: string } = {}) {
  return apiFetch<{ data: Doctor[] }>("/doctors", { searchParams: params });
}

export function getDoctor(doctorId: string) {
  return apiFetch<Doctor>(`/doctors/${doctorId}`);
}

export function updateDoctor(
  doctorId: string,
  input: Partial<{ consultationFee: number; weeklyAvailability: WeeklyAvailabilitySlot[] }>
) {
  return apiFetch<Doctor>(`/doctors/${doctorId}`, { method: "PATCH", body: input });
}

export function listPayouts(doctorId: string) {
  return apiFetch<{ data: Payout[] }>(`/doctors/${doctorId}/payouts`);
}
