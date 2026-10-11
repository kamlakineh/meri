import { Router } from "express";
import { notifyUser } from "../presenceSocket.js";
import { store } from "../db.js";

export const callsRouter = Router();

// POST /v1/calls/ring — fired once by whoever is first to join a call room
// (see CallRoom.tsx), so the other participant gets a real-time "incoming
// call" notification even if they're elsewhere in the app, not already
// sitting on the call page. P7/D4.
callsRouter.post("/calls/ring", (req, res) => {
  const user = req.mockUser!;
  const { chatId, mode } = req.body ?? {};

  if (typeof chatId !== "string" || (mode !== "audio" && mode !== "video")) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "chatId and mode ('audio' | 'video') are required.",
    });
    return;
  }

  const thread = store.chats.find((t) => t.id === chatId);
  const isParticipant = thread?.participants.some((p) => p.userId === user.id);
  if (!thread || !isParticipant) {
    res.status(404).json({ code: "NOT_FOUND", message: "Chat not found." });
    return;
  }

  const other = thread.participants.find((p) => p.userId !== user.id);
  if (other) {
    notifyUser(other.userId, {
      type: "incoming-call",
      chatId,
      mode,
      fromUserId: user.id,
      fromName: user.name,
    });
  }

  res.json({ ok: true });
});
