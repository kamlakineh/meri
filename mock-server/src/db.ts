import {
  seedAppointments,
  seedArticles,
  seedCases,
  seedChats,
  seedDoctors,
  seedFacilities,
  seedMessages,
  seedOrders,
  seedPayouts,
  seedPharmacyMedicines,
  seedRegistrations,
  seedReviews,
  seedUsers,
} from "./data/seed.js";
import type {
  Appointment,
  Article,
  Case,
  ChatMessage,
  ChatThread,
  Doctor,
  Facility,
  Order,
  Payout,
  PharmacyMedicine,
  Registration,
  Review,
  SeedUser,
} from "./types.js";

interface Store {
  users: SeedUser[];
  facilities: Facility[];
  doctors: Doctor[];
  cases: Case[];
  appointments: Appointment[];
  chats: ChatThread[];
  messages: ChatMessage[];
  pharmacyMedicines: PharmacyMedicine[];
  orders: Order[];
  reviews: Review[];
  articles: Article[];
  payouts: Payout[];
  registrations: Registration[];
  otpCodes: Map<string, { code: string; expiresAt: number }>;
}

function freshStore(): Store {
  return {
    users: structuredClone(seedUsers),
    facilities: structuredClone(seedFacilities),
    doctors: structuredClone(seedDoctors),
    cases: structuredClone(seedCases),
    appointments: structuredClone(seedAppointments),
    chats: structuredClone(seedChats),
    messages: structuredClone(seedMessages),
    pharmacyMedicines: structuredClone(seedPharmacyMedicines),
    orders: structuredClone(seedOrders),
    reviews: structuredClone(seedReviews),
    articles: structuredClone(seedArticles),
    payouts: structuredClone(seedPayouts),
    registrations: structuredClone(seedRegistrations),
    otpCodes: new Map(),
  };
}

export const store: Store = freshStore();

export function resetStore() {
  Object.assign(store, freshStore());
}
