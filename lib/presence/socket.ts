import { mockServerWsBase } from "@/lib/ws/host";

export interface IncomingCallEvent {
  type: "incoming-call";
  chatId: string;
  mode: "audio" | "video";
  fromUserId: string;
  fromName: string;
}

const RECONNECT_DELAY_MS = 3000;

/**
 * Thin client for the mock server's presence relay (see
 * mock-server/src/presenceSocket.ts). This connects once for the whole
 * session (mounted in DashboardShell, not per-page) so an incoming call can
 * reach someone browsing anywhere in the app, not just someone already
 * sitting on the /call page — and reconnects on drop, since it's meant to
 * stay up for as long as the user is signed in.
 */
export function connectPresence(
  userId: string,
  onIncomingCall: (event: IncomingCallEvent) => void
) {
  let closedByCaller = false;
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function open() {
    ws = new WebSocket(`${mockServerWsBase()}/v1/presence/ws`);

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: "hello", userId }));
    };

    ws.onmessage = (event) => {
      let payload: Partial<IncomingCallEvent>;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (
        payload.type === "incoming-call" &&
        payload.chatId &&
        payload.mode &&
        payload.fromUserId &&
        payload.fromName
      ) {
        onIncomingCall(payload as IncomingCallEvent);
      }
    };

    ws.onclose = () => {
      if (!closedByCaller) {
        reconnectTimer = setTimeout(open, RECONNECT_DELAY_MS);
      }
    };
  }

  open();

  return {
    close() {
      closedByCaller = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}
