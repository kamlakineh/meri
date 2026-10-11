import { AlertTriangle, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/layout/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { DataTable, type Column } from "@/components/table/DataTable";
import { listChats } from "@/lib/api/chat";
import { listOrders } from "@/lib/api/orders";
import { listMedicines } from "@/lib/api/pharmacyMedicines";
import { getFacility } from "@/lib/api/search";
import { getSession } from "@/lib/session";
import type { ChatThread, Order } from "@/lib/api/types";

export const instant = false;

export default async function PharmacyHomePage() {
  const session = await getSession();
  const t = await getTranslations("pharmacy");

  const [{ data: chats }, facility, { data: orders }, { data: medicines }] = await Promise.all([
    listChats(),
    session!.facilityId ? getFacility(session!.facilityId) : null,
    listOrders(),
    listMedicines(session!.facilityId!),
  ]);

  const openOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  );
  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;

  const otherParticipant = (thread: ChatThread) =>
    thread.participants.find((p) => p.userId !== session!.userId) ??
    thread.participants[0];

  const chatColumns: Column<ChatThread>[] = [
    {
      key: "patient",
      header: t("columns.patient"),
      render: (c) => {
        const other = otherParticipant(c);
        return (
          <div className="flex items-center gap-2">
            <Avatar name={other.name} size={28} />
            <span>{other.name}</span>
          </div>
        );
      },
    },
    {
      key: "lastMessage",
      header: t("columns.lastMessage"),
      render: (c) => (
        <span className="line-clamp-1 max-w-sm text-foreground">
          {c.lastMessage?.text ?? "—"}
        </span>
      ),
    },
    {
      key: "updated",
      header: t("columns.updated"),
      render: (c) => new Date(c.updatedAt).toLocaleString(),
    },
  ];

  const orderColumns: Column<Order>[] = [
    {
      key: "items",
      header: t("columns.patient"),
      render: (o) => o.items.map((i) => `${i.name} ×${i.quantity}`).join(", "),
    },
    {
      key: "status",
      header: t("columns.updated"),
      render: (o) => <Badge tone="info">{o.status}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label={t("statOpenChats")}
          value={chats.length}
          icon={MessageCircle}
          tone="highlight"
        />
        <StatCard label={t("ordersTitle")} value={openOrders.length} icon={ShoppingCart} />
        <StatCard label={t("lowStockBadge")} value={lowStockCount} icon={AlertTriangle} />
        <StatCard
          label={t("statRating")}
          value={facility ? facility.rating.toFixed(1) : "—"}
          icon={Star}
        />
      </div>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("ordersTitle")}</h2>
        </div>
        <DataTable columns={orderColumns} rows={openOrders} rowKey={(o) => o.id} emptyMessage={t("noOrders")} />
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("chatsTitle")}</h2>
          <p className="text-sm text-muted">{t("chatsSubtitle")}</p>
        </div>
        <DataTable columns={chatColumns} rows={chats} rowKey={(c) => c.id} />
      </Card>
    </div>
  );
}
