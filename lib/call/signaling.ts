export type SignalPayload =
  | { sdp: RTCSessionDescriptionInit }
  | { candidate: RTCIceCandidateInit };

interface SignalingHandlers {
  onJoined?: (peerUserIds: string[]) => void;
  onPeerJoined?: (userId: string) => void;
  onPeerLeft?: (userId: string) => void;
  onSignal?: (data: SignalPayload) => void;
  onRoomFull?: () => void;
}

/** Thin client for the mock server's WebRTC signaling relay (see mock-server/src/callSignaling.ts). */
export function connectSignaling(
  chatId: string,
  userId: string,
  handlers: SignalingHandlers
) {
  const httpBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const wsUrl = `${httpBase.replace(/^http/, "ws")}/v1/calls`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", chatId, userId }));
  };

  ws.onmessage = (event) => {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    switch (message.type) {
      case "joined":
        handlers.onJoined?.((message.peers as string[]) ?? []);
        break;
      case "peer-joined":
        handlers.onPeerJoined?.(message.userId as string);
        break;
      case "peer-left":
        handlers.onPeerLeft?.(message.userId as string);
        break;
      case "signal":
        handlers.onSignal?.(message.data as SignalPayload);
        break;
      case "room-full":
        handlers.onRoomFull?.();
        break;
    }
  };

  return {
    sendSignal(data: SignalPayload) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "signal", chatId, data }));
      }
    },
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave", chatId }));
      }
      ws.close();
    },
  };
}
