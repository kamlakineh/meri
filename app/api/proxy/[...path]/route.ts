import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Same-origin proxy to the mock server, attaching the mock-auth headers from
 * the session cookie. `lib/api/client.ts`'s apiFetch is server-only (reads
 * cookies() directly) and can't be called from Client Components — this is
 * the bridge for the interactive pieces that need to (chat polling/sending,
 * CSV import, order actions, etc.) via `lib/api/clientFetch.ts`.
 */
async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const session = await getSession();

  const url = new URL(`${BASE_URL}/v1/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) {
    headers["X-Mock-Role"] = session.role;
    headers["X-Mock-User-Id"] = session.userId;
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const res = await fetch(url, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
