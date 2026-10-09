import { apiFetch } from "./client";
import type { ChatMessage, ChatThread, Role } from "./types";

export function listChats() {
  return apiFetch<{ data: ChatThread[] }>("/chats");
}

export function createChat(input: {
  participantUserId: string;
  participantRole: Role;
  firstMessage?: string;
}) {
  return apiFetch<ChatThread>("/chats", { method: "POST", body: input });
}

export function listMessages(chatId: string, after?: string) {
  return apiFetch<{ data: ChatMessage[] }>(`/chats/${chatId}/messages`, {
    searchParams: { after },
  });
}

export function sendMessage(
  chatId: string,
  input: { text: string; attachmentUrl?: string }
) {
  return apiFetch<ChatMessage>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: input,
  });
}
