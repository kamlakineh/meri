import { apiFetch } from "./client";
import type { Facility, FacilityType, Paginated } from "./types";

export interface SearchParams {
  query?: string;
  type?: FacilityType;
  specialty?: string;
  service?: string;
  openNow?: boolean;
  lat?: number;
  lng?: number;
  sort?: "distance" | "rating" | "price";
  page?: number;
  pageSize?: number;
}

export function searchFacilities(params: SearchParams = {}) {
  return apiFetch<Paginated<Facility>>("/search", { searchParams: params });
}

export function getFacility(facilityId: string) {
  return apiFetch<Facility>(`/facilities/${facilityId}`);
}
