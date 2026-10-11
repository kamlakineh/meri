import { apiFetch } from "./client";
import type { Facility, PharmacyMedicine } from "./types";

export interface PharmacyMedicineInput {
  name: string;
  strength?: string;
  form?: string;
  price: number;
  quantity: number;
}

export function listMedicines(facilityId: string) {
  return apiFetch<{ data: PharmacyMedicine[] }>(`/pharmacies/${facilityId}/medicines`);
}

export function addMedicine(facilityId: string, input: PharmacyMedicineInput) {
  return apiFetch<PharmacyMedicine>(`/pharmacies/${facilityId}/medicines`, {
    method: "POST",
    body: input,
  });
}

export function importMedicines(facilityId: string, rows: PharmacyMedicineInput[]) {
  return apiFetch<{ data: PharmacyMedicine[] }>(
    `/pharmacies/${facilityId}/medicines/import`,
    { method: "POST", body: { rows } }
  );
}

export function updateMedicine(
  facilityId: string,
  medicineId: string,
  input: Partial<PharmacyMedicineInput>
) {
  return apiFetch<PharmacyMedicine>(
    `/pharmacies/${facilityId}/medicines/${medicineId}`,
    { method: "PATCH", body: input }
  );
}

export function deleteMedicine(facilityId: string, medicineId: string) {
  return apiFetch<void>(`/pharmacies/${facilityId}/medicines/${medicineId}`, {
    method: "DELETE",
  });
}

export function searchMedicines(name: string) {
  return apiFetch<{ data: { medicine: PharmacyMedicine; facility: Facility | null }[] }>(
    "/medicines/search",
    { searchParams: { name } }
  );
}
