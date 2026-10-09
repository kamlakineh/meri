import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { Order, OrderStatus, SeedUser } from "../types.js";

export const ordersRouter = Router();

function visibleTo(user: SeedUser, all: Order[]) {
  if (user.role === "patient") return all.filter((o) => o.patientId === user.id);
  if (user.role === "pharmacy") {
    return all.filter((o) => o.pharmacyFacilityId === user.facilityId);
  }
  return [];
}

// GET /v1/orders — P9, PH4, PH6 (role-scoped)
ordersRouter.get("/orders", (req, res) => {
  const user = req.mockUser!;
  let results = visibleTo(user, store.orders);
  if (req.query.status) {
    results = results.filter((o) => o.status === req.query.status);
  }
  res.json({
    data: [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
});

// POST /v1/orders — P9 (order or pick up medicine from a pharmacy)
ordersRouter.post("/orders", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "patient") {
    res.status(403).json({ code: "FORBIDDEN", message: "Only patients place orders." });
    return;
  }
  const { pharmacyFacilityId, items, fulfillment } = req.body ?? {};
  if (!pharmacyFacilityId || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "pharmacyFacilityId and a non-empty items array are required.",
    });
    return;
  }

  const timestamp = new Date().toISOString();
  const order: Order = {
    id: `o-${nanoid(8)}`,
    patientId: user.id,
    pharmacyFacilityId,
    items,
    fulfillment: fulfillment === "delivery" ? "delivery" : "pickup",
    status: "requested",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.orders.unshift(order);
  res.status(201).json(order);
});

// PATCH /v1/orders/:orderId — PH6 (accept, prepare, ready, complete, cancel)
ordersRouter.patch("/orders/:orderId", (req, res) => {
  const user = req.mockUser!;
  const order = store.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    res.status(404).json({ code: "NOT_FOUND", message: "Order not found." });
    return;
  }
  const isOwnerPatient = user.role === "patient" && order.patientId === user.id;
  const isOwnerPharmacy = user.role === "pharmacy" && order.pharmacyFacilityId === user.facilityId;
  if (!isOwnerPatient && !isOwnerPharmacy) {
    res.status(403).json({ code: "FORBIDDEN", message: "Not your order." });
    return;
  }

  const { status } = req.body ?? {};
  if (status) order.status = status as OrderStatus;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});
