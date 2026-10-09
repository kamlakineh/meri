import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { Review } from "../types.js";

export const reviewsRouter = Router();

// GET /v1/reviews?facilityId=|doctorId= — P12
reviewsRouter.get("/reviews", (req, res) => {
  let results = store.reviews;
  if (req.query.facilityId) {
    results = results.filter((r) => r.facilityId === req.query.facilityId);
  }
  if (req.query.doctorId) {
    results = results.filter((r) => r.doctorId === req.query.doctorId);
  }
  res.json({
    data: [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
});

// POST /v1/reviews — P12 (rate and review a provider)
reviewsRouter.post("/reviews", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "patient") {
    res.status(403).json({ code: "FORBIDDEN", message: "Only patients leave reviews." });
    return;
  }
  const { facilityId, doctorId, rating, comment } = req.body ?? {};
  if (!facilityId && !doctorId) {
    res.status(400).json({ code: "INVALID_INPUT", message: "facilityId or doctorId is required." });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    res.status(400).json({ code: "INVALID_INPUT", message: "rating must be 1-5." });
    return;
  }

  const review: Review = {
    id: `rev-${nanoid(8)}`,
    authorUserId: user.id,
    authorName: user.name,
    facilityId: facilityId || undefined,
    doctorId: doctorId || undefined,
    rating,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  store.reviews.unshift(review);
  res.status(201).json(review);
});
