"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Order, OrderStatus } from "@/lib/api/types";

const STATUS_TONE: Record<
  OrderStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  requested: "info",
  accepted: "warning",
  preparing: "warning",
  ready: "success",
  completed: "neutral",
  cancelled: "danger",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  requested: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "completed",
};

export function OrdersManager({
  orders,
  labels,
}: {
  orders: Order[];
  labels: {
    statusLabels: Record<OrderStatus, string>;
    nextActionLabels: Record<OrderStatus, string>;
    cancel: string;
    noOrders: string;
  };
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    try {
      await clientApiFetch(`/orders/${orderId}`, { method: "PATCH", body: { status } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (orders.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">{labels.noOrders}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {orders.map((order) => {
        const next = NEXT_STATUS[order.status];
        const isTerminal = order.status === "completed" || order.status === "cancelled";
        return (
          <div
            key={order.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">
                {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
              </p>
              <p className="text-sm text-muted">
                {order.patientId} · {order.fulfillment}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[order.status]}>{labels.statusLabels[order.status]}</Badge>
              {next && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(order.id, next)}
                  isLoading={busyId === order.id}
                >
                  {labels.nextActionLabels[order.status]}
                </Button>
              )}
              {!isTerminal && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateStatus(order.id, "cancelled")}
                  isLoading={busyId === order.id}
                >
                  {labels.cancel}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
