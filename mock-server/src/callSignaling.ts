import type { Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

/**
 * WebRTC signaling relay for P7/D4 (consult by voice/video). Rooms are
 * keyed by chatId; this only relays SDP offers/answers and ICE candidates
 * between at most two peers — it never touches call media itself.
 */
interface RoomPeer {
  ws: WebSocket;
  userId: string;
}

type ClientMessage =
  | { type: "join"; chatId: string; userId: string }
  | { type: "signal"; chatId: string; data: unknown }
  | { type: "leave"; chatId: string };

export function attachCallSignaling(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/v1/calls" });
  const rooms = new Map<string, RoomPeer[]>();

  function leaveRoom(chatId: string, ws: WebSocket) {
    const peers = rooms.get(chatId);
    if (!peers) return;
    const leaving = peers.find((p) => p.ws === ws);
    const remaining = peers.filter((p) => p.ws !== ws);
    if (remaining.length > 0) rooms.set(chatId, remaining);
    else rooms.delete(chatId);

    if (leaving) {
      for (const peer of remaining) {
        send(peer.ws, { type: "peer-left", userId: leaving.userId });
      }
    }
  }

  function send(ws: WebSocket, payload: unknown) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  }

  wss.on("connection", (ws) => {
    let joinedChatId: string | null = null;

    ws.on("message", (raw) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (message.type === "join") {
        joinedChatId = message.chatId;
        const peers = rooms.get(message.chatId) ?? [];
        if (peers.length >= 2) {
          send(ws, { type: "room-full" });
          return;
        }
        for (const peer of peers) {
          send(peer.ws, { type: "peer-joined", userId: message.userId });
        }
        peers.push({ ws, userId: message.userId });
        rooms.set(message.chatId, peers);
        send(ws, {
          type: "joined",
          peers: peers.filter((p) => p.ws !== ws).map((p) => p.userId),
        });
        return;
      }

      if (message.type === "signal") {
        const peers = rooms.get(message.chatId) ?? [];
        for (const peer of peers) {
          if (peer.ws !== ws) send(peer.ws, { type: "signal", data: message.data });
        }
        return;
      }

      if (message.type === "leave") {
        leaveRoom(message.chatId, ws);
        joinedChatId = null;
      }
    });

    ws.on("close", () => {
      if (joinedChatId) leaveRoom(joinedChatId, ws);
    });
  });

  return wss;
}
