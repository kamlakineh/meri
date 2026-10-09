"use client";

import { Phone, Send, Video } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Link } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import { cn } from "@/lib/cn";
import type { ChatMessage, ChatThread } from "@/lib/api/types";

const POLL_INTERVAL_MS = 3000;

export function ChatThreadView({
  thread,
  initialMessages,
  sessionUserId,
  messagePlaceholder,
  audioLabel,
  videoLabel,
}: {
  thread: ChatThread;
  initialMessages: ChatMessage[];
  sessionUserId: string;
  messagePlaceholder: string;
  audioLabel: string;
  videoLabel: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  const other =
    thread.participants.find((p) => p.userId !== sessionUserId) ??
    thread.participants[0];

  useEffect(() => {
    const interval = setInterval(async () => {
      const lastId = messagesRef.current[messagesRef.current.length - 1]?.id;
      try {
        const res = await clientApiFetch<{ data: ChatMessage[] }>(
          `/chats/${thread.id}/messages`,
          { searchParams: lastId ? { after: lastId } : {} }
        );
        if (res.data.length > 0) {
          setMessages((prev) => [...prev, ...res.data]);
        }
      } catch {
        // transient network hiccup — next poll will retry
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [thread.id]);

  useEffect(() => {
    messagesRef.current = messages;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const message = await clientApiFetch<ChatMessage>(
        `/chats/${thread.id}/messages`,
        { method: "POST", body: { text } }
      );
      setMessages((prev) => [...prev, message]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-[var(--radius-card)] border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Avatar name={other.name} />
        <p className="font-medium text-foreground">{other.name}</p>
        <div className="ml-auto flex gap-2">
          <Link
            href={`/call/${thread.id}?mode=audio`}
            title={audioLabel}
            className="rounded-full border border-border p-2 text-muted hover:bg-background"
          >
            <Phone className="h-4 w-4" />
          </Link>
          <Link
            href={`/call/${thread.id}?mode=video`}
            title={videoLabel}
            className="rounded-full border border-border p-2 text-muted hover:bg-background"
          >
            <Video className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const mine = message.senderUserId === sessionUserId;
          return (
            <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-xs rounded-2xl px-4 py-2 text-sm",
                  mine ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                )}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={messagePlaceholder}
          className="h-10 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-primary text-primary-foreground disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
