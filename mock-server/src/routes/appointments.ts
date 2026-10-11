import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { Appointment, AppointmentStatus, SeedUser, TimeSlot } from "../types.js";
import { paginate, parsePage } from "../utils.js";

export const appointmentsRouter = Router();

function visibleTo(user: SeedUser, all: Appointment[]) {
  if (user.role === "patient") return all.filter((a) => a.patientId === user.id);
  if (user.role === "doctor") return all.filter((a) => a.doctorId === user.doctorId);
  if (user.role === "hospital") {
    const facilityDoctorIds = store.doctors
      .filter((d) => d.facilityId === user.facilityId)
      .map((d) => d.id);
    return all.filter((a) => facilityDoctorIds.includes(a.doctorId));
  }
  return [];
}

// GET /v1/doctors/:doctorId/availability — D3
appointmentsRouter.get("/doctors/:doctorId/availability", (req, res) => {
  const doctor = store.doctors.find((d) => d.id === req.params.doctorId);
  if (!doctor) {
    res.status(404).json({ code: "NOT_FOUND", message: "Doctor not found." });
    return;
  }

  const bookedStarts = new Set(
    store.appointments
      .filter((a) => a.doctorId === doctor.id && a.status !== "cancelled")
      .map((a) => a.start)
  );

  // Generates 30-minute slots over the next 14 days from the doctor's
  // weeklyAvailability (D3 — doctor-configurable, see PATCH /doctors/:id).
  const slots: TimeSlot[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const day = new Date(cursor);
    day.setDate(day.getDate() + dayOffset);
    const weekday = day.getDay();

    for (const window of doctor.weeklyAvailability.filter((w) => w.day === weekday)) {
      const [startHour, startMinute] = window.start.split(":").map(Number);
      const [endHour, endMinute] = window.end.split(":").map(Number);
      const slotStart = new Date(day);
      slotStart.setHours(startHour, startMinute, 0, 0);
      const windowEnd = new Date(day);
      windowEnd.setHours(endHour, endMinute, 0, 0);

      while (slotStart < windowEnd) {
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
        if (slotEnd <= windowEnd && !bookedStarts.has(slotStart.toISOString())) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        }
        slotStart.setMinutes(slotStart.getMinutes() + 30);
      }
    }
  }

  res.json({ doctorId: doctor.id, slots });
});

// GET /v1/appointments
appointmentsRouter.get("/appointments", (req, res) => {
  const user = req.mockUser!;
  let results = visibleTo(user, store.appointments);
  if (req.query.status) {
    results = results.filter((a) => a.status === req.query.status);
  }
  results = [...results].sort((a, b) => a.start.localeCompare(b.start));

  const page = parsePage(req.query.page, 1);
  const pageSize = Math.min(parsePage(req.query.pageSize, 20), 100);
  res.json(paginate(results, page, pageSize));
});

// POST /v1/appointments — P6
appointmentsRouter.post("/appointments", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "patient") {
    res.status(403).json({ code: "FORBIDDEN", message: "Only patients book appointments." });
    return;
  }

  const { doctorId, caseId, start, end } = req.body ?? {};
  const doctor = store.doctors.find((d) => d.id === doctorId);
  if (!doctor || !start || !end) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "doctorId, start, and end are required and doctorId must exist.",
    });
    return;
  }

  const timestamp = new Date().toISOString();
  const appointment: Appointment = {
    id: `a-${nanoid(8)}`,
    patientId: user.id,
    doctorId,
    caseId: caseId ?? null,
    start,
    end,
    status: "pending_payment",
    paymentStatus: "unpaid",
    fee: doctor.consultationFee,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.appointments.unshift(appointment);
  res.status(201).json(appointment);
});

// GET /v1/appointments/:appointmentId
appointmentsRouter.get("/appointments/:appointmentId", (req, res) => {
  const found = store.appointments.find((a) => a.id === req.params.appointmentId);
  if (!found) {
    res.status(404).json({ code: "NOT_FOUND", message: "Appointment not found." });
    return;
  }
  res.json(found);
});

// PATCH /v1/appointments/:appointmentId
appointmentsRouter.patch("/appointments/:appointmentId", (req, res) => {
  const existing = store.appointments.find((a) => a.id === req.params.appointmentId);
  if (!existing) {
    res.status(404).json({ code: "NOT_FOUND", message: "Appointment not found." });
    return;
  }

  const { status, paymentStatus, start, end } = req.body ?? {};
  if (status) existing.status = status as AppointmentStatus;
  if (paymentStatus) {
    existing.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && existing.status === "pending_payment") {
      existing.status = "confirmed";
    }
  }
  if (start) existing.start = start;
  if (end) existing.end = end;
  existing.updatedAt = new Date().toISOString();

  res.json(existing);
});
