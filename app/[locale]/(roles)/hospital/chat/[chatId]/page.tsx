import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChatThreadView } from "@/components/chat/ChatThreadView";
import { listChats, listMessages } from "@/lib/api/chat";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function HospitalChatThreadPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const session = await getSession();
  const t = await getTranslations("patient");

  const [{ data: chats }, { data: messages }] = await Promise.all([
    listChats(),
    listMessages(chatId),
  ]);
  const thread = chats.find((c) => c.id === chatId);
  if (!thread) notFound();

  return (
    <ChatThreadView
      thread={thread}
      initialMessages={messages}
      sessionUserId={session!.userId}
      messagePlaceholder={t("messagePlaceholder")}
      audioLabel={t("startAudioCall")}
      videoLabel={t("startVideoCall")}
    />
  );
}
