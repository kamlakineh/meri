import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { PharmacyMedicine } from "../types.js";

export const pharmacyMedicinesRouter = Router();

function canManage(facilityId: string, userFacilityId: string | undefined, role: string) {
  return role === "pharmacy" && userFacilityId === facilityId;
}

// GET /v1/pharmacies/:facilityId/medicines — PH3
pharmacyMedicinesRouter.get("/pharmacies/:facilityId/medicines", (req, res) => {
  res.json({
    data: store.pharmacyMedicines.filter((m) => m.facilityId === req.params.facilityId),
  });
});

// POST /v1/pharmacies/:facilityId/medicines — PH3 (manual add)
pharmacyMedicinesRouter.post("/pharmacies/:facilityId/medicines", (req, res) => {
  const user = req.mockUser!;
  if (!canManage(req.params.facilityId, user.facilityId, user.role)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own pharmacy's medicines." });
    return;
  }
  const { name, strength, form, price, quantity } = req.body ?? {};
  if (!name || typeof price !== "number" || typeof quantity !== "number") {
    res.status(400).json({ code: "INVALID_INPUT", message: "name, price, and quantity are required." });
    return;
  }
  const medicine: PharmacyMedicine = {
    id: `med-${nanoid(8)}`,
    facilityId: req.params.facilityId,
    name,
    strength: strength ?? "",
    form: form ?? "",
    price,
    quantity,
  };
  store.pharmacyMedicines.push(medicine);
  res.status(201).json(medicine);
});

// POST /v1/pharmacies/:facilityId/medicines/import — PH3 (bulk CSV/XLSX rows,
// parsed client-side and posted as an array)
pharmacyMedicinesRouter.post("/pharmacies/:facilityId/medicines/import", (req, res) => {
  const user = req.mockUser!;
  if (!canManage(req.params.facilityId, user.facilityId, user.role)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own pharmacy's medicines." });
    return;
  }
  const { rows } = req.body ?? {};
  if (!Array.isArray(rows)) {
    res.status(400).json({ code: "INVALID_INPUT", message: "rows must be an array." });
    return;
  }

  const created: PharmacyMedicine[] = rows
    .filter((r) => r && typeof r.name === "string")
    .map((r) => ({
      id: `med-${nanoid(8)}`,
      facilityId: req.params.facilityId,
      name: r.name,
      strength: r.strength ?? "",
      form: r.form ?? "",
      price: Number(r.price) || 0,
      quantity: Number(r.quantity) || 0,
    }));
  store.pharmacyMedicines.push(...created);
  res.status(201).json({ data: created });
});

// PATCH /v1/pharmacies/:facilityId/medicines/:medicineId — PH3, PH7
pharmacyMedicinesRouter.patch("/pharmacies/:facilityId/medicines/:medicineId", (req, res) => {
  const user = req.mockUser!;
  if (!canManage(req.params.facilityId, user.facilityId, user.role)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own pharmacy's medicines." });
    return;
  }
  const medicine = store.pharmacyMedicines.find(
    (m) => m.id === req.params.medicineId && m.facilityId === req.params.facilityId
  );
  if (!medicine) {
    res.status(404).json({ code: "NOT_FOUND", message: "Medicine not found." });
    return;
  }
  const { name, strength, form, price, quantity } = req.body ?? {};
  if (typeof name === "string") medicine.name = name;
  if (typeof strength === "string") medicine.strength = strength;
  if (typeof form === "string") medicine.form = form;
  if (typeof price === "number") medicine.price = price;
  if (typeof quantity === "number") medicine.quantity = quantity;
  res.json(medicine);
});

// DELETE /v1/pharmacies/:facilityId/medicines/:medicineId
pharmacyMedicinesRouter.delete("/pharmacies/:facilityId/medicines/:medicineId", (req, res) => {
  const user = req.mockUser!;
  if (!canManage(req.params.facilityId, user.facilityId, user.role)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own pharmacy's medicines." });
    return;
  }
  store.pharmacyMedicines = store.pharmacyMedicines.filter(
    (m) => !(m.id === req.params.medicineId && m.facilityId === req.params.facilityId)
  );
  res.status(204).end();
});

// GET /v1/medicines/search?name= — P9 (nearest pharmacies that stock a medicine)
pharmacyMedicinesRouter.get("/medicines/search", (req, res) => {
  const name = String(req.query.name ?? "").toLowerCase();
  const matches = store.pharmacyMedicines.filter(
    (m) => m.quantity > 0 && (!name || m.name.toLowerCase().includes(name))
  );
  const data = matches.map((m) => ({
    medicine: m,
    facility: store.facilities.find((f) => f.id === m.facilityId) ?? null,
  }));
  res.json({ data });
});
