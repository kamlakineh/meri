"use server";

import { redirect } from "next/navigation";
import { createChat } from "@/lib/api/chat";
import type { Role } from "@/lib/api/types";
import { getSession } from "@/lib/session";

/** Starts (or reuses) a chat thread and redirects into it — P7, P10, D4, H5, PH5. */
export async function startChatAction(formData: FormData) {
  const participantUserId = String(formData.get("participantUserId"));
  const participantRole = String(formData.get("participantRole")) as Role;
  const locale = String(formData.get("locale"));

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const thread = await createChat({ participantUserId, participantRole });
  redirect(`/${locale}/${session.role}/chat/${thread.id}`);
}
