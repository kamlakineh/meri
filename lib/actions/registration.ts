"use server";

import type { FacilityType } from "@/lib/api/types";
import { register } from "@/lib/api/registrations";
import { loginWithSeedUser } from "./session";

/** D1, H1, PH1 — register, then sign in as the new (pending) account. */
export async function registerAction(formData: FormData) {
  const kind = String(formData.get("kind")) as "doctor" | "facility";
  const name = String(formData.get("name"));
  const phone = String(formData.get("phone"));
  const specialty = formData.get("specialty") ? String(formData.get("specialty")) : undefined;
  const facilityType = formData.get("facilityType")
    ? (String(formData.get("facilityType")) as FacilityType)
    : undefined;
  const locale = String(formData.get("locale"));
  const licenseFile = formData.get("license");

  let licenseUrl = "";
  if (licenseFile instanceof File && licenseFile.size > 0) {
    const buffer = Buffer.from(await licenseFile.arrayBuffer());
    licenseUrl = `data:${licenseFile.type};base64,${buffer.toString("base64")}`;
  }

  const { user } = await register({ kind, name, phone, specialty, facilityType, licenseUrl });
  await loginWithSeedUser(user, locale);
}
