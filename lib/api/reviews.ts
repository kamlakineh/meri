import { apiFetch } from "./client";
import type { Review } from "./types";

export function listReviews(params: { facilityId?: string; doctorId?: string }) {
  return apiFetch<{ data: Review[] }>("/reviews", { searchParams: params });
}

export function createReview(input: {
  facilityId?: string;
  doctorId?: string;
  rating: number;
  comment?: string;
}) {
  return apiFetch<Review>("/reviews", { method: "POST", body: input });
}
