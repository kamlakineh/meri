"use client";

import { Phone, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Link } from "@/i18n/navigation";
import { connectPresence, type IncomingCallEvent } from "@/lib/presence/socket";

const AUTO_DISMISS_MS = 30000;

export function IncomingCallBanner({
  userId,
  audioLabelTemplate,
  videoLabelTemplate,
  joinLabel,
  dismissLabel,
}: {
  userId: string;
  /** Must contain the literal placeholder "{name}". */
  audioLabelTemplate: string;
  videoLabelTemplate: string;
  joinLabel: string;
  dismissLabel: string;
}) {
  const [call, setCall] = useState<IncomingCallEvent | null>(null);

  useEffect(() => {
    const presence = connectPresence(userId, (event) => setCall(event));
    return () => presence.close();
  }, [userId]);

  useEffect(() => {
    if (!call) return;
    const timer = setTimeout(() => setCall(null), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [call]);

  if (!call) return null;

  const template = call.mode === "video" ? videoLabelTemplate : audioLabelTemplate;
  const label = template.replace("{name}", call.fromName);
  const Icon = call.mode === "video" ? Video : Phone;

  return (
    <div className="fixed top-4 right-4 z-50 flex w-80 items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[0_8px_24px_-8px_rgba(15,17,21,0.25)]">
      <Avatar name={call.fromName} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
        </p>
        <div className="mt-2 flex gap-2">
          <Link
            href={`/call/${call.chatId}?mode=${call.mode}`}
            onClick={() => setCall(null)}
            className="rounded-[var(--radius-control)] bg-ink px-3 py-1.5 text-xs font-medium text-ink-foreground"
          >
            {joinLabel}
          </Link>
          <button
            type="button"
            onClick={() => setCall(null)}
            className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted"
          >
            {dismissLabel}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCall(null)}
        aria-label={dismissLabel}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
