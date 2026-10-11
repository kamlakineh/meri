import { apiFetch } from "./client";
import type { Doctor, Facility, FacilityHours, SeedUser } from "./types";

export function updateFacility(
  facilityId: string,
  input: Partial<{
    name: string;
    address: string;
    location: { lat: number; lng: number };
    phone: string;
    hours: FacilityHours[];
    services: string[];
    specialties: string[];
    departments: string[];
    photoUrl: string;
    openNow: boolean;
  }>
) {
  return apiFetch<Facility>(`/facilities/${facilityId}`, { method: "PATCH", body: input });
}

export function listStaff(facilityId: string) {
  return apiFetch<{ data: (SeedUser & { doctor: Doctor | null })[] }>(
    `/facilities/${facilityId}/staff`
  );
}

export function addStaff(
  facilityId: string,
  input: { name: string; specialty?: string; consultationFee?: number }
) {
  return apiFetch<{ user: SeedUser; doctor: Doctor }>(`/facilities/${facilityId}/staff`, {
    method: "POST",
    body: input,
  });
}

export function removeStaff(facilityId: string, userId: string) {
  return apiFetch<void>(`/facilities/${facilityId}/staff/${userId}`, { method: "DELETE" });
}
