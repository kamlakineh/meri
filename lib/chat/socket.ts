import { mockServerWsBase } from "@/lib/ws/host";
import type { ChatMessage } from "@/lib/api/types";

/** Thin client for the mock server's chat push relay (see mock-server/src/chatSocket.ts). */
export function connectChatSocket(
  chatId: string,
  onMessage: (message: ChatMessage) => void
) {
  const ws = new WebSocket(`${mockServerWsBase()}/v1/chats/ws`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", chatId }));
  };

  ws.onmessage = (event) => {
    let payload: { type?: string; message?: ChatMessage };
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }
    if (payload.type === "message" && payload.message) {
      onMessage(payload.message);
    }
  };

  return {
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave", chatId }));
      }
      ws.close();
    },
  };
}
