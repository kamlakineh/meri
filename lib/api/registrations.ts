import { apiFetch } from "./client";
import type { FacilityType, Registration, RegistrationStatus, SeedUser } from "./types";

export function register(input: {
  kind: "doctor" | "facility";
  facilityType?: FacilityType;
  name: string;
  phone: string;
  specialty?: string;
  licenseUrl: string;
}) {
  return apiFetch<{ registration: Registration; user: SeedUser }>("/registrations", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function listRegistrations(status?: RegistrationStatus) {
  return apiFetch<{ data: Registration[] }>("/registrations", {
    searchParams: { status },
  });
}

export function reviewRegistration(id: string, status: "approved" | "rejected") {
  return apiFetch<Registration>(`/registrations/${id}`, {
    method: "PATCH",
    body: { status },
  });
}
