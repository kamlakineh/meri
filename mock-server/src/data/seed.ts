import type {
  Appointment,
  Article,
  Case,
  ChatMessage,
  ChatThread,
  Doctor,
  Facility,
  Order,
  PharmacyMedicine,
  Payout,
  Registration,
  Review,
  SeedUser,
} from "../types.js";

// Seeded identities for the X-Mock-Role / X-Mock-User-Id headers.
// The web app's dev role picker logs in as one of these.
export const seedUsers: SeedUser[] = [
  {
    id: "u-patient-1",
    role: "patient",
    name: "Hana Bekele",
    phone: "+251911234001",
  },
  {
    id: "u-patient-2",
    role: "patient",
    name: "Abel Tesfaye",
    phone: "+251911234002",
  },
  {
    id: "u-doctor-1",
    role: "doctor",
    name: "Dr. Selam Alemu",
    doctorId: "d-1",
    facilityId: "f-hospital-1",
    registrationStatus: "approved",
  },
  {
    id: "u-doctor-2",
    role: "doctor",
    name: "Dr. Yonas Girma",
    doctorId: "d-2",
    facilityId: "f-clinic-1",
    registrationStatus: "approved",
  },
  {
    id: "u-hospital-1",
    role: "hospital",
    name: "Addis Hope General Hospital — Front Desk",
    facilityId: "f-hospital-1",
    registrationStatus: "approved",
  },
  {
    id: "u-pharmacy-1",
    role: "pharmacy",
    name: "Kazanchis Pharmacy — Staff",
    facilityId: "f-pharmacy-1",
    registrationStatus: "approved",
  },
  {
    id: "u-admin-1",
    role: "admin",
    name: "Admin",
  },
];

export const seedFacilities: Facility[] = [
  {
    id: "f-hospital-1",
    type: "hospital",
    name: "Addis Hope General Hospital",
    specialties: ["Internal Medicine", "Cardiology", "Surgery"],
    services: ["Emergency", "Inpatient", "Laboratory", "Imaging"],
    departments: ["Emergency", "Cardiology", "Surgery", "Radiology"],
    rating: 4.6,
    reviewCount: 312,
    priceLevel: 3,
    address: "Bole Road, Addis Ababa",
    location: { lat: 9.0107, lng: 38.7613 },
    phone: "+251911000001",
    openNow: true,
    hours: [{ day: "Mon-Sun", open: "00:00", close: "24:00" }],
  },
  {
    id: "f-clinic-1",
    type: "clinic",
    name: "Bole Family Clinic",
    specialties: ["Pediatrics", "General Practice"],
    services: ["Consultation", "Vaccination"],
    departments: ["Pediatrics", "General Practice"],
    rating: 4.4,
    reviewCount: 98,
    priceLevel: 2,
    address: "Bole Sub-city, Addis Ababa",
    location: { lat: 8.9969, lng: 38.7889 },
    phone: "+251911000002",
    openNow: true,
    hours: [{ day: "Mon-Sat", open: "08:00", close: "19:00" }],
  },
  {
    id: "f-clinic-2",
    type: "clinic",
    name: "Kirkos Dermatology Clinic",
    specialties: ["Dermatology"],
    services: ["Consultation"],
    departments: ["Dermatology"],
    rating: 4.2,
    reviewCount: 41,
    priceLevel: 2,
    address: "Kirkos Sub-city, Addis Ababa",
    location: { lat: 9.0084, lng: 38.7575 },
    phone: "+251911000003",
    openNow: false,
    hours: [{ day: "Mon-Fri", open: "09:00", close: "17:00" }],
  },
  {
    id: "f-pharmacy-1",
    type: "pharmacy",
    name: "Kazanchis Pharmacy",
    specialties: [],
    services: ["Prescription fulfillment", "Delivery"],
    departments: [],
    rating: 4.7,
    reviewCount: 156,
    priceLevel: 2,
    address: "Kazanchis, Addis Ababa",
    location: { lat: 9.0135, lng: 38.7667 },
    phone: "+251911000004",
    openNow: true,
    hours: [{ day: "Mon-Sun", open: "07:00", close: "22:00" }],
  },
  {
    id: "f-pharmacy-2",
    type: "pharmacy",
    name: "Piassa Central Pharmacy",
    specialties: [],
    services: ["Prescription fulfillment", "Pickup"],
    departments: [],
    rating: 4.1,
    reviewCount: 64,
    priceLevel: 1,
    address: "Piassa, Addis Ababa",
    location: { lat: 9.0346, lng: 38.7503 },
    phone: "+251911000005",
    openNow: true,
    hours: [{ day: "Mon-Sun", open: "08:00", close: "20:00" }],
  },
];

const WEEKDAY_9_TO_5 = [1, 2, 3, 4, 5].flatMap((day) => [
  { day, start: "09:00", end: "12:00" },
  { day, start: "14:00", end: "17:00" },
]);

export const seedDoctors: Doctor[] = [
  {
    id: "d-1",
    userId: "u-doctor-1",
    name: "Dr. Selam Alemu",
    specialty: "Internal Medicine",
    facilityId: "f-hospital-1",
    consultationFee: 500,
    rating: 4.8,
    weeklyAvailability: WEEKDAY_9_TO_5,
  },
  {
    id: "d-2",
    userId: "u-doctor-2",
    name: "Dr. Yonas Girma",
    specialty: "Pediatrics",
    facilityId: "f-clinic-1",
    consultationFee: 350,
    rating: 4.5,
    weeklyAvailability: WEEKDAY_9_TO_5,
  },
];

const hoursFromNow = (h: number) =>
  new Date(Date.now() + h * 60 * 60 * 1000).toISOString();

export const seedCases: Case[] = [
  {
    id: "c-1",
    patientId: "u-patient-1",
    doctorId: "d-1",
    symptoms: "Persistent headache and mild fever for 3 days.",
    durationDays: 3,
    attachments: [],
    status: "accepted",
    doctorNotes: "Likely viral. Recommended rest and follow-up if fever persists.",
    medicines: [
      { name: "Paracetamol", dosage: "500mg", instructions: "Every 6 hours as needed for fever" },
    ],
    referredToFacilityId: null,
    createdAt: hoursFromNow(-48),
    updatedAt: hoursFromNow(-40),
  },
  {
    id: "c-2",
    patientId: "u-patient-1",
    doctorId: "d-1",
    symptoms: "Shortness of breath after mild exercise, started yesterday.",
    durationDays: 1,
    attachments: [],
    status: "submitted",
    doctorNotes: null,
    medicines: [],
    referredToFacilityId: null,
    createdAt: hoursFromNow(-2),
    updatedAt: hoursFromNow(-2),
  },
  {
    id: "c-3",
    patientId: "u-patient-2",
    doctorId: "d-2",
    symptoms: "Child has a skin rash on the arms, not itchy.",
    durationDays: 2,
    attachments: [],
    status: "submitted",
    doctorNotes: null,
    medicines: [],
    referredToFacilityId: null,
    createdAt: hoursFromNow(-5),
    updatedAt: hoursFromNow(-5),
  },
  {
    id: "c-4",
    patientId: "u-patient-2",
    doctorId: "d-2",
    symptoms: "Needs specialist evaluation for a persistent cough.",
    durationDays: 10,
    attachments: [],
    status: "referred",
    doctorNotes: "Referring for chest X-ray and specialist review.",
    medicines: [],
    referredToFacilityId: "f-hospital-1",
    createdAt: hoursFromNow(-6),
    updatedAt: hoursFromNow(-6),
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: "a-1",
    patientId: "u-patient-1",
    doctorId: "d-1",
    caseId: "c-1",
    start: hoursFromNow(24),
    end: hoursFromNow(24.5),
    status: "confirmed",
    paymentStatus: "paid",
    fee: 500,
    createdAt: hoursFromNow(-40),
    updatedAt: hoursFromNow(-40),
  },
  {
    id: "a-2",
    patientId: "u-patient-2",
    doctorId: "d-2",
    caseId: "c-3",
    start: hoursFromNow(5),
    end: hoursFromNow(5.5),
    status: "pending_payment",
    paymentStatus: "unpaid",
    fee: 350,
    createdAt: hoursFromNow(-4),
    updatedAt: hoursFromNow(-4),
  },
  {
    id: "a-3",
    patientId: "u-patient-1",
    doctorId: "d-1",
    caseId: null,
    start: hoursFromNow(-72),
    end: hoursFromNow(-71.5),
    status: "completed",
    paymentStatus: "paid",
    fee: 500,
    createdAt: hoursFromNow(-100),
    updatedAt: hoursFromNow(-71.5),
  },
];

export const seedMessages: ChatMessage[] = [
  {
    id: "m-1",
    chatId: "chat-1",
    senderUserId: "u-patient-1",
    text: "Hello doctor, I wanted to follow up on my headache.",
    attachmentUrl: null,
    createdAt: hoursFromNow(-39),
  },
  {
    id: "m-2",
    chatId: "chat-1",
    senderUserId: "u-doctor-1",
    text: "Hi Hana, good to hear from you. How is the fever today?",
    attachmentUrl: null,
    createdAt: hoursFromNow(-38),
  },
  {
    id: "m-3",
    chatId: "chat-2",
    senderUserId: "u-patient-1",
    text: "Do you have Amoxicillin 500mg in stock?",
    attachmentUrl: null,
    createdAt: hoursFromNow(-3),
  },
];

export const seedChats: ChatThread[] = [
  {
    id: "chat-1",
    participants: [
      { userId: "u-patient-1", role: "patient", name: "Hana Bekele" },
      { userId: "u-doctor-1", role: "doctor", name: "Dr. Selam Alemu" },
    ],
    lastMessage: seedMessages[1],
    updatedAt: hoursFromNow(-38),
  },
  {
    id: "chat-2",
    participants: [
      { userId: "u-patient-1", role: "patient", name: "Hana Bekele" },
      {
        userId: "u-pharmacy-1",
        role: "pharmacy",
        name: "Kazanchis Pharmacy",
      },
    ],
    lastMessage: seedMessages[2],
    updatedAt: hoursFromNow(-3),
  },
];

export const seedPharmacyMedicines: PharmacyMedicine[] = [
  { id: "med-1", facilityId: "f-pharmacy-1", name: "Amoxicillin", strength: "500mg", form: "Capsule", price: 120, quantity: 84 },
  { id: "med-2", facilityId: "f-pharmacy-1", name: "Paracetamol", strength: "500mg", form: "Tablet", price: 45, quantity: 6 },
  { id: "med-3", facilityId: "f-pharmacy-1", name: "Ibuprofen", strength: "200mg", form: "Tablet", price: 60, quantity: 0 },
  { id: "med-4", facilityId: "f-pharmacy-1", name: "Cetirizine", strength: "10mg", form: "Tablet", price: 55, quantity: 40 },
  { id: "med-5", facilityId: "f-pharmacy-2", name: "Amoxicillin", strength: "500mg", form: "Capsule", price: 115, quantity: 30 },
  { id: "med-6", facilityId: "f-pharmacy-2", name: "Paracetamol", strength: "500mg", form: "Tablet", price: 40, quantity: 200 },
];

export const seedOrders: Order[] = [
  {
    id: "o-1",
    patientId: "u-patient-1",
    pharmacyFacilityId: "f-pharmacy-1",
    items: [{ medicineId: "med-1", name: "Amoxicillin 500mg", quantity: 2 }],
    fulfillment: "pickup",
    status: "requested",
    createdAt: hoursFromNow(-1),
    updatedAt: hoursFromNow(-1),
  },
];

export const seedReviews: Review[] = [
  {
    id: "rev-1",
    authorUserId: "u-patient-1",
    authorName: "Hana Bekele",
    facilityId: "f-hospital-1",
    rating: 5,
    comment: "Quick, attentive care at the emergency desk.",
    createdAt: hoursFromNow(-200),
  },
  {
    id: "rev-2",
    authorUserId: "u-patient-2",
    authorName: "Abel Tesfaye",
    doctorId: "d-1",
    rating: 5,
    comment: "Dr. Selam explained everything clearly and followed up by chat.",
    createdAt: hoursFromNow(-150),
  },
];

export const seedArticles: Article[] = [
  {
    id: "art-1",
    authorDoctorId: "d-1",
    authorName: "Dr. Selam Alemu",
    title: "Five signs a fever needs a same-day visit",
    body: "Most fevers resolve with rest and fluids, but watch for these warning signs...",
    status: "published",
    createdAt: hoursFromNow(-500),
    updatedAt: hoursFromNow(-480),
  },
  {
    id: "art-2",
    authorDoctorId: "d-2",
    authorName: "Dr. Yonas Girma",
    title: "Vaccination schedule basics for new parents",
    body: "Here is a simple overview of the first-year vaccination schedule...",
    status: "pending_review",
    createdAt: hoursFromNow(-10),
    updatedAt: hoursFromNow(-10),
  },
];

export const seedPayouts: Payout[] = [
  { id: "payout-1", doctorId: "d-1", amount: 4200, period: "2026-09", status: "paid", createdAt: hoursFromNow(-700) },
  { id: "payout-2", doctorId: "d-1", amount: 500, period: "2026-10", status: "pending", createdAt: hoursFromNow(-40) },
];

export const seedRegistrations: Registration[] = [
  {
    id: "reg-1",
    kind: "doctor",
    name: "Dr. Marta Fikru",
    phone: "+251911234099",
    specialty: "Dermatology",
    licenseUrl: "data:text/plain;base64,TW9jayBsaWNlbnNlIGRvY3VtZW50",
    status: "pending",
    createdUserId: "u-pending-1",
    createdAt: hoursFromNow(-20),
    updatedAt: hoursFromNow(-20),
  },
];
