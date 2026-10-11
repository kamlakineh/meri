/**
 * Builds the mock server's WebSocket base URL from wherever the page was
 * actually loaded from, not from `NEXT_PUBLIC_API_URL` directly.
 *
 * `NEXT_PUBLIC_API_URL` is normally `http://localhost:4000`, which is only
 * correct when the browser and the mock server are the same machine. Open
 * the app from a phone on the same network (`http://<pc-lan-ip>:3000`) and
 * "localhost" in that URL resolves to the phone itself — the WebSocket
 * connection silently fails to connect, even though REST calls still work
 * (those go through the Next.js server via the `/api/proxy` route, which
 * runs on the PC and so `localhost:4000` is correct *there*).
 *
 * Instead, reuse the hostname the browser actually used to reach this page
 * and only take the port from `NEXT_PUBLIC_API_URL` (default 4000) — that
 * resolves correctly from any device on the same network as the PC running
 * both servers.
 */
export function mockServerWsBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  let port = "4000";
  try {
    port = new URL(configured).port || "4000";
  } catch {
    // keep default
  }
  const protocol = typeof window !== "undefined" && window.location.protocol === "https:"
    ? "wss:"
    : "ws:";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${protocol}//${hostname}:${port}`;
}
