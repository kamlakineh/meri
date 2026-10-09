import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "@/i18n/navigation";
import { listChats } from "@/lib/api/chat";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function HospitalChatListPage() {
  const session = await getSession();
  const t = await getTranslations("patient");
  const { data: chats } = await listChats();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("chatTitle")} />
      {chats.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t("chatEmpty")}</p>
      ) : (
        <Card className="divide-y divide-border">
          {chats.map((thread) => {
            const other =
              thread.participants.find((p) => p.userId !== session!.userId) ??
              thread.participants[0];
            return (
              <Link
                key={thread.id}
                href={`/hospital/chat/${thread.id}`}
                className="flex items-center gap-3 p-4 hover:bg-background"
              >
                <Avatar name={other.name} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{other.name}</p>
                  <p className="line-clamp-1 text-sm text-muted">
                    {thread.lastMessage?.text ?? ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
