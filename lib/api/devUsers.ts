import { apiFetch } from "./client";
import type { SeedUser } from "./types";

/** Dev-only: lists seeded users so /login can offer a role picker. */
export function listSeedUsers() {
  return apiFetch<{ data: SeedUser[] }>("/_dev/users", { auth: false });
}
