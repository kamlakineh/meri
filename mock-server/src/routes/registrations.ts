import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type {
  Doctor,
  Facility,
  FacilityType,
  Registration,
  SeedUser,
} from "../types.js";

export const registrationsRouter = Router();

// POST /v1/registrations — D1, H1, PH1 (register with license upload; admin
// approves before activation). Public: this is how a brand-new account is
// created, so there's no session yet.
registrationsRouter.post("/registrations", (req, res) => {
  const { kind, name, phone, specialty, facilityType, licenseUrl } = req.body ?? {};

  if (!kind || !name || !phone || !licenseUrl) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "kind, name, phone, and licenseUrl are required.",
    });
    return;
  }
  if (kind !== "doctor" && kind !== "facility") {
    res.status(400).json({ code: "INVALID_INPUT", message: "kind must be 'doctor' or 'facility'." });
    return;
  }
  const validFacilityTypes: FacilityType[] = ["hospital", "clinic", "pharmacy"];
  if (kind === "facility" && !validFacilityTypes.includes(facilityType)) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "facilityType (hospital|clinic|pharmacy) is required for facility registrations.",
    });
    return;
  }

  const timestamp = new Date().toISOString();
  const userId = `u-${nanoid(8)}`;
  let createdFacilityId: string | undefined;
  let createdDoctorId: string | undefined;
  let role: SeedUser["role"];

  if (kind === "facility") {
    const facility: Facility = {
      id: `f-${nanoid(8)}`,
      type: facilityType as FacilityType,
      name,
      specialties: [],
      services: [],
      departments: [],
      rating: 0,
      reviewCount: 0,
      priceLevel: 2,
      address: "",
      location: { lat: 9.0107, lng: 38.7613 },
      phone,
      openNow: false,
      hours: [],
    };
    store.facilities.push(facility);
    createdFacilityId = facility.id;
    role = facilityType === "pharmacy" ? "pharmacy" : "hospital";
  } else {
    role = "doctor";
  }

  const user: SeedUser = {
    id: userId,
    role,
    name,
    phone,
    facilityId: createdFacilityId,
    registrationStatus: "pending",
  };

  if (kind === "doctor") {
    const doctor: Doctor = {
      id: `d-${nanoid(8)}`,
      userId,
      name,
      specialty: specialty || "General Practice",
      facilityId: "",
      consultationFee: 0,
      rating: 0,
      weeklyAvailability: [],
    };
    store.doctors.push(doctor);
    createdDoctorId = doctor.id;
    user.doctorId = doctor.id;
  }

  store.users.push(user);

  const registration: Registration = {
    id: `reg-${nanoid(8)}`,
    kind,
    facilityType: kind === "facility" ? (facilityType as FacilityType) : undefined,
    name,
    phone,
    specialty: kind === "doctor" ? specialty : undefined,
    licenseUrl,
    status: "pending",
    createdUserId: userId,
    createdFacilityId,
    createdDoctorId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.registrations.push(registration);

  res.status(201).json({ registration, user });
});

// GET /v1/registrations — admin approval queue
registrationsRouter.get("/registrations", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "admin") {
    res.status(403).json({ code: "FORBIDDEN", message: "Admin only." });
    return;
  }
  let results = store.registrations;
  if (req.query.status) {
    results = results.filter((r) => r.status === req.query.status);
  }
  res.json({
    data: [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
});

// PATCH /v1/registrations/:id — admin approve/reject
registrationsRouter.patch("/registrations/:id", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "admin") {
    res.status(403).json({ code: "FORBIDDEN", message: "Admin only." });
    return;
  }
  const registration = store.registrations.find((r) => r.id === req.params.id);
  if (!registration) {
    res.status(404).json({ code: "NOT_FOUND", message: "Registration not found." });
    return;
  }
  const { status } = req.body ?? {};
  if (status !== "approved" && status !== "rejected") {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "status must be 'approved' or 'rejected'.",
    });
    return;
  }

  registration.status = status;
  registration.updatedAt = new Date().toISOString();

  const createdUser = store.users.find((u) => u.id === registration.createdUserId);
  if (createdUser) createdUser.registrationStatus = status;

  res.json(registration);
});
