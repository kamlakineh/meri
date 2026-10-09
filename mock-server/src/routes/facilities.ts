import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { SeedUser } from "../types.js";

export const facilitiesRouter = Router();

function canManage(user: SeedUser, facilityId: string) {
  return (
    (user.role === "hospital" || user.role === "pharmacy") &&
    user.facilityId === facilityId
  );
}

// PATCH /v1/facilities/:facilityId — H2, PH2 (profile: location, hours,
// services, departments, photo)
facilitiesRouter.patch("/facilities/:facilityId", (req, res) => {
  const user = req.mockUser!;
  const facility = store.facilities.find((f) => f.id === req.params.facilityId);
  if (!facility) {
    res.status(404).json({ code: "NOT_FOUND", message: "Facility not found." });
    return;
  }
  if (!canManage(user, facility.id)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only edit your own facility." });
    return;
  }

  const {
    name,
    address,
    location,
    phone,
    hours,
    services,
    specialties,
    departments,
    photoUrl,
    openNow,
  } = req.body ?? {};

  if (typeof name === "string") facility.name = name;
  if (typeof address === "string") facility.address = address;
  if (location && typeof location.lat === "number" && typeof location.lng === "number") {
    facility.location = { lat: location.lat, lng: location.lng };
  }
  if (typeof phone === "string") facility.phone = phone;
  if (Array.isArray(hours)) facility.hours = hours;
  if (Array.isArray(services)) facility.services = services;
  if (Array.isArray(specialties)) facility.specialties = specialties;
  if (Array.isArray(departments)) facility.departments = departments;
  if (typeof photoUrl === "string") facility.photoUrl = photoUrl;
  if (typeof openNow === "boolean") facility.openNow = openNow;

  res.json(facility);
});

// GET /v1/facilities/:facilityId/staff — H3
facilitiesRouter.get("/facilities/:facilityId/staff", (req, res) => {
  const staff = store.users.filter(
    (u) => u.facilityId === req.params.facilityId && u.role === "doctor"
  );
  res.json({
    data: staff.map((u) => ({
      ...u,
      doctor: store.doctors.find((d) => d.id === u.doctorId) ?? null,
    })),
  });
});

// POST /v1/facilities/:facilityId/staff — H3 (invite/add a doctor to this facility)
facilitiesRouter.post("/facilities/:facilityId/staff", (req, res) => {
  const user = req.mockUser!;
  const facility = store.facilities.find((f) => f.id === req.params.facilityId);
  if (!facility) {
    res.status(404).json({ code: "NOT_FOUND", message: "Facility not found." });
    return;
  }
  if (!canManage(user, facility.id)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own facility's staff." });
    return;
  }

  const { name, specialty, consultationFee } = req.body ?? {};
  if (!name || typeof name !== "string") {
    res.status(400).json({ code: "INVALID_INPUT", message: "name is required." });
    return;
  }

  const userId = `u-${nanoid(8)}`;
  const doctor = {
    id: `d-${nanoid(8)}`,
    userId,
    name,
    specialty: specialty || "General Practice",
    facilityId: facility.id,
    consultationFee: typeof consultationFee === "number" ? consultationFee : 0,
    rating: 0,
    weeklyAvailability: [],
  };
  store.doctors.push(doctor);

  const staffUser: SeedUser = {
    id: userId,
    role: "doctor",
    name,
    facilityId: facility.id,
    doctorId: doctor.id,
    registrationStatus: "approved",
  };
  store.users.push(staffUser);

  res.status(201).json({ user: staffUser, doctor });
});

// DELETE /v1/facilities/:facilityId/staff/:userId — H3
facilitiesRouter.delete("/facilities/:facilityId/staff/:userId", (req, res) => {
  const user = req.mockUser!;
  const facility = store.facilities.find((f) => f.id === req.params.facilityId);
  if (!facility) {
    res.status(404).json({ code: "NOT_FOUND", message: "Facility not found." });
    return;
  }
  if (!canManage(user, facility.id)) {
    res.status(403).json({ code: "FORBIDDEN", message: "You can only manage your own facility's staff." });
    return;
  }

  const staffUser = store.users.find(
    (u) => u.id === req.params.userId && u.facilityId === facility.id
  );
  if (!staffUser) {
    res.status(404).json({ code: "NOT_FOUND", message: "Staff member not found." });
    return;
  }

  store.users = store.users.filter((u) => u.id !== staffUser.id);
  if (staffUser.doctorId) {
    store.doctors = store.doctors.filter((d) => d.id !== staffUser.doctorId);
  }

  res.status(204).end();
});
