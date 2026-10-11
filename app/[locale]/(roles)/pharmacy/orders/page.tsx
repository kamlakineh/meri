import { getTranslations } from "next-intl/server";
import { OrdersManager } from "@/components/pharmacy/OrdersManager";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listOrders } from "@/lib/api/orders";

export const instant = false;

export default async function PharmacyOrdersPage() {
  const t = await getTranslations("pharmacy");
  const { data: orders } = await listOrders();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("ordersTitle")} />
      <Card>
        <OrdersManager
          orders={orders}
          labels={{
            statusLabels: {
              requested: t("orderStatusRequested"),
              accepted: t("orderStatusAccepted"),
              preparing: t("orderStatusPreparing"),
              ready: t("orderStatusReady"),
              completed: t("orderStatusCompleted"),
              cancelled: t("orderStatusCancelled"),
            },
            nextActionLabels: {
              requested: t("acceptOrder"),
              accepted: t("startPreparing"),
              preparing: t("markReady"),
              ready: t("completeOrder"),
              completed: "",
              cancelled: "",
            },
            cancel: t("cancelOrder"),
            noOrders: t("noOrders"),
          }}
        />
      </Card>
    </div>
  );
}
