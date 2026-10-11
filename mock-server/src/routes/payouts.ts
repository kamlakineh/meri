import { Router } from "express";
import { store } from "../db.js";

export const payoutsRouter = Router();

// GET /v1/doctors/:doctorId/payouts — D7
payoutsRouter.get("/doctors/:doctorId/payouts", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "doctor" || user.doctorId !== req.params.doctorId) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only view your own payouts." });
    return;
  }
  const data = store.payouts
    .filter((p) => p.doctorId === req.params.doctorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data });
});
