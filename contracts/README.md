# API contract

`openapi.yaml` is the OpenAPI 3.1 contract covering every requirement ID in
the platform's requirements doc (Patient P1–P12, Doctor D1–D7, Hospital/Clinic
H1–H6, Pharmacy PH1–PH7), plus a minimal Admin surface the approval steps
depend on. It is the source of truth both teams build against:

- The mock server in [`../mock-server`](../mock-server) implements this
  contract for real, with stateful, seeded fixtures — see its own
  [README](../mock-server/README.md) for how to run it and example requests
  for every domain.
- The web app's [`../lib/api`](../lib/api) consumes it through a typed fetch
  client.
- The mobile team should point at the same mock server
  (`http://localhost:4000/v1`, or your machine's LAN IP) and follow the same
  shapes.

View it locally with any OpenAPI viewer, e.g.:

```bash
npx @redocly/cli preview-docs contracts/openapi.yaml
```

## Auth (placeholder)

There is no real backend authentication yet. Every request must send:

- `X-Mock-Role`: one of `patient`, `doctor`, `hospital`, `pharmacy`, `admin`
- `X-Mock-User-Id`: a seeded (or newly registered) user id

The mock server uses these headers to scope requests to the caller, the same
way a real session/JWT would. `POST /auth/request-otp`, `POST /auth/verify-otp`,
and `POST /registrations` are the exceptions — they're how an account gets
created in the first place, so they don't require headers yet.

## What's genuinely mocked, and why

Everything in this contract is a real, working implementation in
`mock-server/` — with two necessary exceptions, since they'd otherwise require
a paid third-party account:

- **SMS delivery for OTP.** `POST /auth/request-otp` returns the code in the
  response (`devCode`) instead of texting it. Swapping in a real SMS
  provider only touches that one route.
- **Payment processing.** `Appointment.paymentStatus` is a field the client
  sets directly via `PATCH /appointments/{id}`; there's no real
  payment-gateway flow behind it.

Everything else — maps, OCR, CSV/XLSX import, WebRTC calling, doctor/facility
registration with admin approval, pharmacy inventory and orders, reviews,
articles — is real against the mock server's data, just not against a
production database.

## Requirement ID → endpoint map

| Requirement | Endpoint(s) |
| --- | --- |
| P1 — phone + OTP sign-in | `POST /auth/request-otp`, `POST /auth/verify-otp` |
| P2, P3 — search, map + list results | `GET /search`, `GET /facilities/{id}` |
| P4 — write a case | `POST /cases` |
| P5 — choose/match a doctor | `GET /doctors`, `GET /doctors/{id}`, `GET /doctors/{id}/availability` |
| P6 — schedule + pay | `POST /appointments`, `PATCH /appointments/{id}` |
| P7, P10 — chat / voice / video | `GET/POST /chats`, `GET/POST /chats/{id}/messages`, WebSocket signaling at `/calls` |
| P8 — scan/view prescription | OCR runs client-side (tesseract.js); the e-prescription itself is `Case.medicines` |
| P9 — nearest pharmacies in stock, order/pickup | `GET /medicines/search`, `POST /orders` |
| P11 — history | `GET /cases`, `GET /appointments`, `GET /orders` (all role-scoped) |
| P12 — rate and review | `GET/POST /reviews` |
| D1 — register, admin approves | `POST /registrations`, `GET /auth/me` (poll `registrationStatus`) |
| D2 — accept/decline/refer | `PATCH /cases/{id}` |
| D3 — availability/fees | `PATCH /doctors/{id}` |
| D4 — chat/call, view case | `GET/POST /chats/...`, `GET /cases/{id}`, `/calls` signaling |
| D5 — e-prescriptions/notes | `PATCH /cases/{id}` (`doctorNotes`, `medicines`) |
| D6 — articles, admin-reviewed | `GET/POST /articles`, `PATCH /articles/{id}` |
| D7 — earnings/payouts | `GET /doctors/{id}/payouts` |
| H1, PH1 — register, admin approves | `POST /registrations` |
| H2, PH2 — profile (location, hours, services, photo) | `PATCH /facilities/{id}` |
| H3 — manage staff | `GET/POST /facilities/{id}/staff`, `DELETE /facilities/{id}/staff/{userId}` |
| H4 — handle requests/appointments | `GET /cases`, `GET /appointments` (role-scoped) |
| H5, PH5 — chat | `GET/POST /chats/...` |
| H6 — dashboard ratings | `GET /reviews?facilityId=` |
| PH3 — medicine list, CSV/XLSX import | `GET/POST/PATCH/DELETE /pharmacies/{id}/medicines`, `POST .../medicines/import` |
| PH4 — confirm availability | `PATCH /orders/{id}` (and medicine quantity via `PATCH .../medicines/{id}`) |
| PH6 — manage orders | `GET/POST /orders`, `PATCH /orders/{id}` |
| PH7 — low/out-of-stock | derived client-side from `PharmacyMedicine.quantity` |

Admin (not one of the four listed roles, but necessary for the approval
steps above): `GET /registrations`, `PATCH /registrations/{id}`, and
`PATCH /articles/{id}` (status transitions).
