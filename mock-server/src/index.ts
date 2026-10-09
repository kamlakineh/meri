import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { attachCallSignaling } from "./callSignaling.js";
import { resetStore, store } from "./db.js";
import { latency } from "./middleware/latency.js";
import { mockAuth } from "./middleware/mockAuth.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { articlesRouter } from "./routes/articles.js";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { chatRouter } from "./routes/chat.js";
import { doctorsRouter } from "./routes/doctors.js";
import { facilitiesRouter } from "./routes/facilities.js";
import { ordersRouter } from "./routes/orders.js";
import { payoutsRouter } from "./routes/payouts.js";
import { pharmacyMedicinesRouter } from "./routes/pharmacyMedicines.js";
import { registrationsRouter } from "./routes/registrations.js";
import { reviewsRouter } from "./routes/reviews.js";
import { searchRouter } from "./routes/search.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/v1/_dev/health", (_req, res) => {
  res.json({ ok: true });
});

// Dev convenience: lets web/mobile show a role picker without a real auth backend.
app.get("/v1/_dev/users", (_req, res) => {
  res.json({ data: store.users });
});

app.post("/v1/_dev/reset", (_req, res) => {
  resetStore();
  res.json({ ok: true });
});

const routers = [
  searchRouter,
  casesRouter,
  appointmentsRouter,
  chatRouter,
  authRouter,
  registrationsRouter,
  doctorsRouter,
  facilitiesRouter,
  pharmacyMedicinesRouter,
  ordersRouter,
  reviewsRouter,
  articlesRouter,
  payoutsRouter,
];
for (const router of routers) {
  app.use("/v1", latency, mockAuth, router);
}

const server = createServer(app);
attachCallSignaling(server);

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`);
  console.log(`Call signaling (WebSocket) at ws://localhost:${PORT}/v1/calls`);
  console.log(`Try: curl http://localhost:${PORT}/v1/_dev/health`);
});
