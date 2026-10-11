import { apiFetch } from "./client";
import type { Order, OrderItem, OrderStatus } from "./types";

export function listOrders(status?: OrderStatus) {
  return apiFetch<{ data: Order[] }>("/orders", { searchParams: { status } });
}

export function createOrder(input: {
  pharmacyFacilityId: string;
  items: OrderItem[];
  fulfillment: "delivery" | "pickup";
}) {
  return apiFetch<Order>("/orders", { method: "POST", body: input });
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  return apiFetch<Order>(`/orders/${orderId}`, { method: "PATCH", body: { status } });
}
