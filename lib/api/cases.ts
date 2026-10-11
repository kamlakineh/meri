import { apiFetch } from "./client";
import type { Case, CaseAttachment, CaseStatus, Paginated } from "./types";

export function listCases(
  params: { status?: CaseStatus; page?: number; pageSize?: number } = {}
) {
  return apiFetch<Paginated<Case>>("/cases", { searchParams: params });
}

export function getCase(caseId: string) {
  return apiFetch<Case>(`/cases/${caseId}`);
}

export function createCase(input: {
  symptoms: string;
  durationDays?: number;
  attachments?: CaseAttachment[];
  preferredDoctorId?: string;
}) {
  return apiFetch<Case>("/cases", { method: "POST", body: input });
}

export function updateCase(
  caseId: string,
  input: Partial<{
    status: CaseStatus;
    doctorId: string;
    doctorNotes: string;
    referredToFacilityId: string;
  }>
) {
  return apiFetch<Case>(`/cases/${caseId}`, { method: "PATCH", body: input });
}
