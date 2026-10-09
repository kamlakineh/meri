import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { ChatMessage, ChatThread, SeedUser } from "../types.js";

export const chatRouter = Router();

function participatesIn(user: SeedUser, thread: ChatThread) {
  return thread.participants.some((p) => p.userId === user.id);
}

// GET /v1/chats — P10, D4, H5, PH5
chatRouter.get("/chats", (req, res) => {
  const user = req.mockUser!;
  const threads = store.chats
    .filter((t) => participatesIn(user, t))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ data: threads });
});

// POST /v1/chats
chatRouter.post("/chats", (req, res) => {
  const user = req.mockUser!;
  const { participantUserId, participantRole, firstMessage } = req.body ?? {};

  const participantSeed = store.users.find(
    (u) => u.id === participantUserId && u.role === participantRole
  );
  if (!participantSeed) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "participantUserId/participantRole must match a known user.",
    });
    return;
  }

  const existing = store.chats.find(
    (t) =>
      participatesIn(user, t) &&
      t.participants.some((p) => p.userId === participantSeed.id)
  );
  if (existing) {
    res.status(201).json(existing);
    return;
  }

  const timestamp = new Date().toISOString();
  const thread: ChatThread = {
    id: `chat-${nanoid(8)}`,
    participants: [
      { userId: user.id, role: user.role, name: user.name },
      { userId: participantSeed.id, role: participantSeed.role, name: participantSeed.name },
    ],
    lastMessage: null,
    updatedAt: timestamp,
  };
  store.chats.unshift(thread);

  if (firstMessage) {
    const message: ChatMessage = {
      id: `m-${nanoid(8)}`,
      chatId: thread.id,
      senderUserId: user.id,
      text: firstMessage,
      attachmentUrl: null,
      createdAt: timestamp,
    };
    store.messages.push(message);
    thread.lastMessage = message;
  }

  res.status(201).json(thread);
});

// GET /v1/chats/:chatId/messages
chatRouter.get("/chats/:chatId/messages", (req, res) => {
  const user = req.mockUser!;
  const thread = store.chats.find((t) => t.id === req.params.chatId);
  if (!thread || !participatesIn(user, thread)) {
    res.status(404).json({ code: "NOT_FOUND", message: "Chat not found." });
    return;
  }

  let messages = store.messages
    .filter((m) => m.chatId === thread.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const after = req.query.after as string | undefined;
  if (after) {
    const afterIndex = messages.findIndex((m) => m.id === after);
    if (afterIndex >= 0) messages = messages.slice(afterIndex + 1);
  }

  res.json({ data: messages });
});

// POST /v1/chats/:chatId/messages
chatRouter.post("/chats/:chatId/messages", (req, res) => {
  const user = req.mockUser!;
  const thread = store.chats.find((t) => t.id === req.params.chatId);
  if (!thread || !participatesIn(user, thread)) {
    res.status(404).json({ code: "NOT_FOUND", message: "Chat not found." });
    return;
  }

  const { text, attachmentUrl } = req.body ?? {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ code: "INVALID_INPUT", message: "text is required." });
    return;
  }

  const timestamp = new Date().toISOString();
  const message: ChatMessage = {
    id: `m-${nanoid(8)}`,
    chatId: thread.id,
    senderUserId: user.id,
    text,
    attachmentUrl: attachmentUrl ?? null,
    createdAt: timestamp,
  };
  store.messages.push(message);
  thread.lastMessage = message;
  thread.updatedAt = timestamp;

  res.status(201).json(message);
});
