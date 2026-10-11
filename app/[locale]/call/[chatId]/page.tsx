import { redirect } from "next/navigation";
import { CallRoom } from "@/components/call/CallRoom";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; chatId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { locale, chatId } = await params;
  const { mode } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  return (
    <CallRoom
      chatId={chatId}
      userId={session.userId}
      mode={mode === "audio" ? "audio" : "video"}
      closeHref={`/${locale}/${session.role}/chat/${chatId}`}
    />
  );
}
