"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SeedUser } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Dev-only mock sign-in: stores {role, userId, name} in a cookie and
 * redirects into that role's dashboard. Stands in for real OTP/license
 * auth (P1, D1, H1, PH1), which is a separate, future contract.
 */
export async function loginAs(formData: FormData) {
  const role = String(formData.get("role")) as Role;
  const userId = String(formData.get("userId"));
  const name = String(formData.get("name"));
  const locale = String(formData.get("locale"));
  const facilityId = formData.get("facilityId");
  const doctorId = formData.get("doctorId");

  const session = {
    role,
    userId,
    name,
    ...(facilityId ? { facilityId: String(facilityId) } : {}),
    ...(doctorId ? { doctorId: String(doctorId) } : {}),
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect(`/${locale}/${role}`);
}

/**
 * Called from a Client Component after a real sign-in call succeeds
 * (OTP verify for P1, or a fresh registration for D1/H1/PH1) to turn the
 * server's user record into the same session cookie `loginAs` sets.
 */
export async function loginWithSeedUser(user: SeedUser, locale: string) {
  const session = {
    role: user.role,
    userId: user.id,
    name: user.name,
    ...(user.facilityId ? { facilityId: user.facilityId } : {}),
    ...(user.doctorId ? { doctorId: user.doctorId } : {}),
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect(`/${locale}/${user.role}`);
}

export async function logoutAction(formData: FormData) {
  const locale = String(formData.get("locale"));
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect(`/${locale}/login`);
}
