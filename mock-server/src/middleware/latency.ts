import type { NextFunction, Request, Response } from "express";

const MIN_MS = Number(process.env.MOCK_LATENCY_MIN_MS ?? 200);
const MAX_MS = Number(process.env.MOCK_LATENCY_MAX_MS ?? 600);
const DISABLED = process.env.MOCK_LATENCY_DISABLED === "true";

/** Simulates real network latency so loading states are visible during web/mobile dev. */
export function latency(_req: Request, _res: Response, next: NextFunction) {
  if (DISABLED) {
    next();
    return;
  }
  const delay = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
  setTimeout(next, delay);
}
