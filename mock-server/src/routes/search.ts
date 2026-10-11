import { Router } from "express";
import { store } from "../db.js";
import type { Facility, FacilityType } from "../types.js";
import { paginate, parsePage } from "../utils.js";

export const searchRouter = Router();

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// GET /v1/search — P2, P3
searchRouter.get("/search", (req, res) => {
  const {
    query,
    type,
    specialty,
    service,
    openNow,
    lat,
    lng,
    sort = "distance",
  } = req.query;

  let results: Facility[] = store.facilities;

  if (type) {
    results = results.filter((f) => f.type === (type as FacilityType));
  }
  if (query) {
    const q = String(query).toLowerCase();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.services.some((s) => s.toLowerCase().includes(q)) ||
        f.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (specialty) {
    results = results.filter((f) =>
      f.specialties.includes(String(specialty))
    );
  }
  if (service) {
    results = results.filter((f) => f.services.includes(String(service)));
  }
  if (openNow === "true") {
    results = results.filter((f) => f.openNow);
  }

  const origin =
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
  const withDistance = results.map((f) => ({
    facility: f,
    distanceKm: origin ? distanceKm(origin, f.location) : undefined,
  }));

  withDistance.sort((a, b) => {
    if (sort === "rating") return b.facility.rating - a.facility.rating;
    if (sort === "price") return a.facility.priceLevel - b.facility.priceLevel;
    if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  const page = parsePage(req.query.page, 1);
  const pageSize = Math.min(parsePage(req.query.pageSize, 20), 100);
  const sorted = withDistance.map(({ facility, distanceKm: d }) =>
    d === undefined ? facility : { ...facility, distanceKm: d }
  );

  res.json(paginate(sorted, page, pageSize));
});

// GET /v1/facilities/:facilityId
searchRouter.get("/facilities/:facilityId", (req, res) => {
  const facility = store.facilities.find((f) => f.id === req.params.facilityId);
  if (!facility) {
    res.status(404).json({ code: "NOT_FOUND", message: "Facility not found." });
    return;
  }
  // Not part of the stored Facility record — computed so the web app knows
  // who to message for P10 ("chat with ... hospitals/clinics", PH5).
  const contact = store.users.find(
    (u) => u.facilityId === facility.id && (u.role === "hospital" || u.role === "pharmacy")
  );
  res.json({ ...facility, contactUserId: contact?.id });
});
