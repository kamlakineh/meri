import "server-only";
import { cookies } from "next/headers";
import type { Role } from "./api/types";

export const SESSION_COOKIE = "mock_session";

export interface Session {
  role: Role;
  userId: string;
  name: string;
  facilityId?: string;
  doctorId?: string;
}

/**
 * Dev-only stand-in for real auth (see contracts/README.md — "Auth
 * (placeholder)"). Reads the role/user picked on /login from a cookie.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
