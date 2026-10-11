import "server-only";
import { getSession } from "../session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: object;
  /** Skip attaching X-Mock-Role / X-Mock-User-Id (e.g. the dev user list before login). */
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, searchParams, auth = true } = options;

  const url = new URL(`${BASE_URL}/v1${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const session = await getSession();
    if (session) {
      headers["X-Mock-Role"] = session.role;
      headers["X-Mock-User-Id"] = session.userId;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, payload.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
