import { apiFetch } from "./client";
import type { SeedUser } from "./types";

export function requestOtp(phone: string) {
  return apiFetch<{ phone: string; devCode: string; expiresInSeconds: number }>(
    "/auth/request-otp",
    { method: "POST", body: { phone }, auth: false }
  );
}

export function verifyOtp(input: { phone: string; code: string; name?: string }) {
  return apiFetch<{ user: SeedUser }>("/auth/verify-otp", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function getMe() {
  return apiFetch<{ user: SeedUser }>("/auth/me");
}
