import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { Case, CaseStatus } from "../types.js";
import { paginate, parsePage } from "../utils.js";

export const casesRouter = Router();

function visibleTo(user: NonNullable<typeof store.users[number]>, all: Case[]) {
  if (user.role === "patient") {
    return all.filter((c) => c.patientId === user.id);
  }
  if (user.role === "doctor") {
    return all.filter((c) => c.doctorId === user.doctorId);
  }
  if (user.role === "hospital") {
    return all.filter((c) => c.referredToFacilityId === user.facilityId);
  }
  return [];
}

// GET /v1/cases
casesRouter.get("/cases", (req, res) => {
  const user = req.mockUser!;
  let results = visibleTo(user, store.cases);

  if (req.query.status) {
    results = results.filter((c) => c.status === req.query.status);
  }
  results = [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const page = parsePage(req.query.page, 1);
  const pageSize = Math.min(parsePage(req.query.pageSize, 20), 100);
  res.json(paginate(results, page, pageSize));
});

// POST /v1/cases — P4
casesRouter.post("/cases", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "patient") {
    res.status(403).json({ code: "FORBIDDEN", message: "Only patients write cases." });
    return;
  }

  const { symptoms, durationDays, attachments, preferredDoctorId } = req.body ?? {};
  if (!symptoms || typeof symptoms !== "string") {
    res.status(400).json({ code: "INVALID_INPUT", message: "symptoms is required." });
    return;
  }

  // P5 — "choose a doctor (or be matched)": if the patient didn't pick one,
  // match to whichever seeded doctor currently has the fewest open cases.
  let doctorId: string | null = preferredDoctorId ?? null;
  if (!doctorId && store.doctors.length > 0) {
    const openCounts = new Map(store.doctors.map((d) => [d.id, 0]));
    for (const c of store.cases) {
      if (c.doctorId && (c.status === "submitted" || c.status === "accepted")) {
        openCounts.set(c.doctorId, (openCounts.get(c.doctorId) ?? 0) + 1);
      }
    }
    doctorId = [...openCounts.entries()].sort((a, b) => a[1] - b[1])[0][0];
  }

  const timestamp = new Date().toISOString();
  const newCase: Case = {
    id: `c-${nanoid(8)}`,
    patientId: user.id,
    doctorId,
    symptoms,
    durationDays: durationDays ?? null,
    attachments: attachments ?? [],
    status: "submitted",
    doctorNotes: null,
    medicines: [],
    referredToFacilityId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.cases.unshift(newCase);
  res.status(201).json(newCase);
});

// GET /v1/cases/:caseId
casesRouter.get("/cases/:caseId", (req, res) => {
  const found = store.cases.find((c) => c.id === req.params.caseId);
  if (!found) {
    res.status(404).json({ code: "NOT_FOUND", message: "Case not found." });
    return;
  }
  res.json(found);
});

// PATCH /v1/cases/:caseId — D2, D4, D5
casesRouter.patch("/cases/:caseId", (req, res) => {
  const user = req.mockUser!;
  const existing = store.cases.find((c) => c.id === req.params.caseId);
  if (!existing) {
    res.status(404).json({ code: "NOT_FOUND", message: "Case not found." });
    return;
  }
  // D2/D4/D5 (doctor) or H4 (hospital/clinic staff handling a case referred to their facility)
  const isOwningDoctor = user.role === "doctor" && existing.doctorId === user.doctorId;
  const isReferredFacility =
    user.role === "hospital" && existing.referredToFacilityId === user.facilityId;
  if (!isOwningDoctor && !isReferredFacility) {
    res.status(403).json({
      code: "FORBIDDEN",
      message: "Only the assigned doctor or the referred facility can update this case.",
    });
    return;
  }

  const { status, doctorId, doctorNotes, medicines, referredToFacilityId } =
    req.body ?? {};
  if (status) existing.status = status as CaseStatus;
  if (doctorId !== undefined) existing.doctorId = doctorId;
  if (doctorNotes !== undefined) existing.doctorNotes = doctorNotes;
  if (Array.isArray(medicines)) existing.medicines = medicines;
  if (referredToFacilityId !== undefined) {
    existing.referredToFacilityId = referredToFacilityId;
  }
  existing.updatedAt = new Date().toISOString();

  res.json(existing);
});
