# Mock API server

Stateful mock implementation of [`../contracts/openapi.yaml`](../contracts/openapi.yaml)
— every requirement ID's domain (search, cases/prescriptions, appointments,
chat, auth/OTP, doctor+facility registration/approval, doctor directory and
availability, facility profiles and staff, pharmacy medicines and orders,
reviews, articles, payouts) plus WebRTC call signaling — so web and mobile can
build against a real HTTP server before the backend exists. Data lives in
memory and resets when the process restarts (or via `POST /v1/_dev/reset`).

## Run

```bash
cd mock-server
npm install
npm run dev
```

Listens on `http://localhost:4000`. The web app expects this at
`NEXT_PUBLIC_API_URL` (see `.env.local` at the repo root).

## Auth

There's no real backend yet, so there's no real auth — see
[`../contracts/README.md`](../contracts/README.md#auth-placeholder). Every
request (except `/v1/_dev/*`) must include:

```
X-Mock-Role: patient | doctor | hospital | pharmacy | admin
X-Mock-User-Id: <a seeded user id>
```

Exceptions (no headers needed — these are how an account gets created):
`POST /v1/auth/request-otp`, `POST /v1/auth/verify-otp`, `POST /v1/registrations`.

List seeded users (handy for the web app's dev login picker or for `curl`):

```bash
curl http://localhost:4000/v1/_dev/users
```

## Example requests

```bash
# Search hospitals
curl "http://localhost:4000/v1/search?type=hospital"

# Patient's cases (Hana Bekele)
curl http://localhost:4000/v1/cases \
  -H "X-Mock-Role: patient" -H "X-Mock-User-Id: u-patient-1"

# Doctor accepts a case
curl -X PATCH http://localhost:4000/v1/cases/c-2 \
  -H "X-Mock-Role: doctor" -H "X-Mock-User-Id: u-doctor-1" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'

# Send a chat message
curl -X POST http://localhost:4000/v1/chats/chat-1/messages \
  -H "X-Mock-Role: patient" -H "X-Mock-User-Id: u-patient-1" \
  -H "Content-Type: application/json" \
  -d '{"text":"Thank you, doctor!"}'

# Phone + OTP sign-in (P1) — the code comes back in the response, no SMS is sent
curl -X POST http://localhost:4000/v1/auth/request-otp \
  -H "Content-Type: application/json" -d '{"phone":"+251911234567"}'
curl -X POST http://localhost:4000/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+251911234567","code":"<devCode from above>","name":"New Patient"}'

# Register a doctor (D1) — admin approves before the dashboard unlocks
curl -X POST http://localhost:4000/v1/registrations \
  -H "Content-Type: application/json" \
  -d '{"kind":"doctor","name":"Dr. New Grad","phone":"+251900000222","specialty":"Cardiology","licenseUrl":"data:text/plain;base64,bW9jaw=="}'
curl http://localhost:4000/v1/registrations -H "X-Mock-Role: admin" -H "X-Mock-User-Id: u-admin-1"
curl -X PATCH http://localhost:4000/v1/registrations/<id> \
  -H "X-Mock-Role: admin" -H "X-Mock-User-Id: u-admin-1" \
  -H "Content-Type: application/json" -d '{"status":"approved"}'

# Pharmacy medicines + stock search (PH3, P9)
curl http://localhost:4000/v1/pharmacies/f-pharmacy-1/medicines \
  -H "X-Mock-Role: pharmacy" -H "X-Mock-User-Id: u-pharmacy-1"
curl "http://localhost:4000/v1/medicines/search?name=amoxicillin" \
  -H "X-Mock-Role: patient" -H "X-Mock-User-Id: u-patient-1"

# Order + fulfillment lifecycle (P9, PH6)
curl -X POST http://localhost:4000/v1/orders \
  -H "X-Mock-Role: patient" -H "X-Mock-User-Id: u-patient-1" \
  -H "Content-Type: application/json" \
  -d '{"pharmacyFacilityId":"f-pharmacy-1","items":[{"medicineId":"med-1","name":"Amoxicillin 500mg","quantity":2}],"fulfillment":"pickup"}'
```

## Call signaling (WebRTC)

Voice/video calls (P7, D4) connect peer-to-peer; this server only relays
signaling messages over a WebSocket at `ws://localhost:4000/v1/calls`, keyed
by `chatId`, so at most two peers (the two chat participants) exchange SDP
offers/answers and ICE candidates. See `src/callSignaling.ts` for the message
protocol (`join` / `signal` / `leave`).

## Reset seeded data

```bash
curl -X POST http://localhost:4000/v1/_dev/reset
```

## Config

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Server port |
| `MOCK_LATENCY_MIN_MS` / `MOCK_LATENCY_MAX_MS` | `200` / `600` | Simulated network latency range |
| `MOCK_LATENCY_DISABLED` | `false` | Set to `true` to disable the artificial delay |
