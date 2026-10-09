export class ClientApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ClientApiError";
  }
}

interface ClientRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

/** Client Component counterpart to lib/api/client.ts's apiFetch, routed through /api/proxy. */
export async function clientApiFetch<T>(
  path: string,
  options: ClientRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, searchParams } = options;

  const url = new URL(`/api/proxy${path}`, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ message: res.statusText }));
    throw new ClientApiError(res.status, payload.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
