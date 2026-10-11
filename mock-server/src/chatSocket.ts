import { WebSocketServer, type WebSocket } from "ws";
import type { ChatMessage } from "./types.js";

/**
 * Real-time push for chat messages (P10/D4/H5/PH5), so a thread updates the
 * instant the other side sends something instead of waiting on a poll.
 * Rooms are keyed by chatId; any number of participants may join (unlike
 * call signaling, which caps a room at two peers for WebRTC).
 *
 * Created with `noServer: true` — see index.ts's shared `upgrade` dispatcher
 * for why (two path-bound WebSocketServers on one http.Server conflict).
 */
type ClientMessage =
  | { type: "join"; chatId: string }
  | { type: "leave"; chatId: string };

const rooms = new Map<string, Set<WebSocket>>();

function send(ws: WebSocket, payload: unknown) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

export function broadcastChatMessage(chatId: string, message: ChatMessage) {
  const peers = rooms.get(chatId);
  if (!peers) return;
  for (const ws of peers) {
    send(ws, { type: "message", message });
  }
}

export function createChatSocket() {
  const wss = new WebSocketServer({ noServer: true });

  function leaveAllRooms(ws: WebSocket) {
    for (const [chatId, peers] of rooms) {
      if (peers.delete(ws) && peers.size === 0) rooms.delete(chatId);
    }
  }

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (message.type === "join") {
        const peers = rooms.get(message.chatId) ?? new Set<WebSocket>();
        peers.add(ws);
        rooms.set(message.chatId, peers);
        return;
      }

      if (message.type === "leave") {
        rooms.get(message.chatId)?.delete(ws);
        return;
      }
    });

    ws.on("close", () => leaveAllRooms(ws));
  });

  return wss;
}
