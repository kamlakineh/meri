import type { NextFunction, Request, Response } from "express";
import { store } from "../db.js";
import type { Role, SeedUser } from "../types.js";

declare module "express-serve-static-core" {
  interface Request {
    mockUser?: SeedUser;
  }
}

const VALID_ROLES: Role[] = ["patient", "doctor", "hospital", "pharmacy", "admin"];

/**
 * Placeholder for real auth (see contracts/README.md — "Auth (placeholder)").
 * Reads X-Mock-Role / X-Mock-User-Id and attaches the matching seeded user,
 * so routes can scope data the way a real session/JWT would.
 */
const PUBLIC_PREFIXES = ["/v1/_dev", "/v1/auth/request-otp", "/v1/auth/verify-otp"];

/** POST /v1/registrations is public — it's how a new doctor/facility account is created (D1, H1, PH1). */
function isPublicRegistration(req: Request) {
  return req.method === "POST" && pathOnly(req) === "/v1/registrations";
}

// req.path is relative to wherever this middleware is mounted; req.originalUrl
// always has the full path, which is what the prefixes above are written against.
function pathOnly(req: Request) {
  return req.originalUrl.split("?")[0];
}

export function mockAuth(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_PREFIXES.some((p) => pathOnly(req).startsWith(p)) || isPublicRegistration(req)) {
    next();
    return;
  }

  const role = req.header("X-Mock-Role");
  const userId = req.header("X-Mock-User-Id");

  if (!role || !userId || !VALID_ROLES.includes(role as Role)) {
    res.status(401).json({
      code: "UNAUTHENTICATED",
      message:
        "Missing or invalid X-Mock-Role / X-Mock-User-Id headers. See contracts/README.md.",
    });
    return;
  }

  const user = store.users.find((u) => u.id === userId && u.role === role);
  if (!user) {
    res.status(401).json({
      code: "UNKNOWN_USER",
      message: `No seeded user ${userId} with role ${role}.`,
    });
    return;
  }

  req.mockUser = user;
  next();
}
