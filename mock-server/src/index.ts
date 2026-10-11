import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createCallSignaling } from "./callSignaling.js";
import { createChatSocket } from "./chatSocket.js";
import { resetStore, store } from "./db.js";
import { latency } from "./middleware/latency.js";
import { mockAuth } from "./middleware/mockAuth.js";
import { createPresenceSocket } from "./presenceSocket.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { articlesRouter } from "./routes/articles.js";
import { authRouter } from "./routes/auth.js";
import { callsRouter } from "./routes/calls.js";
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
  callsRouter,
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
const callWss = createCallSignaling();
const chatWss = createChatSocket();
const presenceWss = createPresenceSocket();

// A `path`-bound WebSocketServer attached directly via `{ server, path }`
// aborts (with HTTP 400) any upgrade request whose path isn't its own —
// fine with one WS endpoint, but with two on the same http.Server the
// first one registered swallows upgrades meant for the second. Routing
// both through one shared `upgrade` listener, each created `noServer:
// true`, avoids that.
server.on("upgrade", (req, socket, head) => {
  const pathname = req.url ? new URL(req.url, "http://localhost").pathname : "";
  if (pathname === "/v1/calls") {
    callWss.handleUpgrade(req, socket, head, (ws) => {
      callWss.emit("connection", ws, req);
    });
  } else if (pathname === "/v1/chats/ws") {
    chatWss.handleUpgrade(req, socket, head, (ws) => {
      chatWss.emit("connection", ws, req);
    });
  } else if (pathname === "/v1/presence/ws") {
    presenceWss.handleUpgrade(req, socket, head, (ws) => {
      presenceWss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`);
  console.log(`Call signaling (WebSocket) at ws://localhost:${PORT}/v1/calls`);
  console.log(`Chat push (WebSocket) at ws://localhost:${PORT}/v1/chats/ws`);
  console.log(`Presence (WebSocket) at ws://localhost:${PORT}/v1/presence/ws`);
  console.log(`Try: curl http://localhost:${PORT}/v1/_dev/health`);
});
