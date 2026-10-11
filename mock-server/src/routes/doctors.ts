import { Router } from "express";
import { store } from "../db.js";
import type { WeeklyAvailabilitySlot } from "../types.js";

export const doctorsRouter = Router();

// GET /v1/doctors — P5 (choose/match a doctor)
doctorsRouter.get("/doctors", (req, res) => {
  let results = store.doctors;
  if (req.query.specialty) {
    results = results.filter((d) => d.specialty === req.query.specialty);
  }
  if (req.query.facilityId) {
    results = results.filter((d) => d.facilityId === req.query.facilityId);
  }
  res.json({ data: results });
});

// GET /v1/doctors/:doctorId
doctorsRouter.get("/doctors/:doctorId", (req, res) => {
  const doctor = store.doctors.find((d) => d.id === req.params.doctorId);
  if (!doctor) {
    res.status(404).json({ code: "NOT_FOUND", message: "Doctor not found." });
    return;
  }
  res.json(doctor);
});

// PATCH /v1/doctors/:doctorId — D3 (fee + weekly availability)
doctorsRouter.patch("/doctors/:doctorId", (req, res) => {
  const user = req.mockUser!;
  const doctor = store.doctors.find((d) => d.id === req.params.doctorId);
  if (!doctor) {
    res.status(404).json({ code: "NOT_FOUND", message: "Doctor not found." });
    return;
  }
  if (user.role !== "doctor" || user.doctorId !== doctor.id) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only edit your own profile." });
    return;
  }

  const { consultationFee, weeklyAvailability } = req.body ?? {};
  if (typeof consultationFee === "number") doctor.consultationFee = consultationFee;
  if (Array.isArray(weeklyAvailability)) {
    doctor.weeklyAvailability = weeklyAvailability as WeeklyAvailabilitySlot[];
  }

  res.json(doctor);
});
