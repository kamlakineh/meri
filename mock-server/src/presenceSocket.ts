import { WebSocketServer, type WebSocket } from "ws";

/**
 * A lightweight per-user channel, separate from call signaling (which only
 * exists once someone is already on the call page) and chat push (which
 * only exists while a specific thread is open). Presence stays connected
 * anywhere in the app so an "incoming call" notification can reach someone
 * who hasn't navigated to `/call/:chatId` yet — see routes/calls.ts, which
 * is what actually sends the notification once a caller joins a room.
 *
 * Created with `noServer: true` — see index.ts's shared `upgrade`
 * dispatcher for why.
 */
type ClientMessage = { type: "hello"; userId: string };

const sockets = new Map<string, WebSocket>();

function send(ws: WebSocket, payload: unknown) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

export function notifyUser(userId: string, payload: unknown) {
  const ws = sockets.get(userId);
  if (ws) send(ws, payload);
}

export function createPresenceSocket() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    let registeredUserId: string | null = null;

    ws.on("message", (raw) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (message.type === "hello") {
        // Last connection for a user wins — fine for a dev tool where one
        // person usually has one tab/device open at a time.
        registeredUserId = message.userId;
        sockets.set(message.userId, ws);
      }
    });

    ws.on("close", () => {
      if (registeredUserId && sockets.get(registeredUserId) === ws) {
        sockets.delete(registeredUserId);
      }
    });
  });

  return wss;
}
