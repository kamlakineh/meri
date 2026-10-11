import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { SeedUser } from "../types.js";

export const authRouter = Router();

// GET /v1/auth/me — refetch the caller's own (possibly updated) user record,
// e.g. to poll registrationStatus after an admin approval (D1, H1, PH1).
authRouter.get("/auth/me", (req, res) => {
  const user = req.mockUser!;
  const fresh = store.users.find((u) => u.id === user.id) ?? user;
  res.json({ user: fresh });
});

const OTP_TTL_MS = 5 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /v1/auth/request-otp — P1. No real SMS provider wired up (dev-only
// mock): the code is returned in the response instead of being texted.
authRouter.post("/auth/request-otp", (req, res) => {
  const { phone } = req.body ?? {};
  if (!phone || typeof phone !== "string") {
    res.status(400).json({ code: "INVALID_INPUT", message: "phone is required." });
    return;
  }

  const code = generateCode();
  store.otpCodes.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });

  res.json({
    phone,
    devCode: code,
    expiresInSeconds: OTP_TTL_MS / 1000,
    note: "Dev mode: no SMS is sent. Use devCode to verify.",
  });
});

// POST /v1/auth/verify-otp — creates/reuses a patient user for this phone.
authRouter.post("/auth/verify-otp", (req, res) => {
  const { phone, code, name } = req.body ?? {};
  if (!phone || !code) {
    res.status(400).json({ code: "INVALID_INPUT", message: "phone and code are required." });
    return;
  }

  const record = store.otpCodes.get(phone);
  if (!record || record.expiresAt < Date.now() || record.code !== code) {
    res.status(401).json({ code: "INVALID_OTP", message: "Code is invalid or expired." });
    return;
  }
  store.otpCodes.delete(phone);

  let user = store.users.find((u) => u.role === "patient" && u.phone === phone);
  if (!user) {
    user = {
      id: `u-${nanoid(8)}`,
      role: "patient",
      name: typeof name === "string" && name.trim() ? name.trim() : "New Patient",
      phone,
    };
    store.users.push(user);
  }

  res.json({ user: user satisfies SeedUser });
});
