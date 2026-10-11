// Mirrors the schemas in ../../contracts/openapi.yaml

export type Role = "patient" | "doctor" | "hospital" | "pharmacy" | "admin";

export type FacilityType = "hospital" | "clinic" | "pharmacy";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface FacilityHours {
  day: string;
  open: string;
  close: string;
}

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  specialties: string[];
  services: string[];
  departments: string[];
  rating: number;
  reviewCount: number;
  priceLevel: number;
  address: string;
  location: GeoPoint;
  phone: string;
  openNow: boolean;
  hours: FacilityHours[];
  photoUrl?: string;
}

export interface WeeklyAvailabilitySlot {
  day: number; // 0=Sunday..6=Saturday
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  facilityId: string;
  consultationFee: number;
  rating: number;
  photoUrl?: string;
  weeklyAvailability: WeeklyAvailabilitySlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export type CaseStatus =
  | "submitted"
  | "accepted"
  | "declined"
  | "referred"
  | "closed";

export interface CaseAttachment {
  id: string;
  url: string;
  kind: "photo" | "file";
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  instructions: string;
}

export interface Case {
  id: string;
  patientId: string;
  doctorId: string | null;
  symptoms: string;
  durationDays: number | null;
  attachments: CaseAttachment[];
  status: CaseStatus;
  doctorNotes: string | null;
  medicines: PrescriptionMedicine[];
  referredToFacilityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  caseId: string | null;
  start: string;
  end: string;
  status: AppointmentStatus;
  paymentStatus: "unpaid" | "paid";
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: string;
  role: Role;
  name: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUserId: string;
  text: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  participants: ChatParticipant[];
  lastMessage: ChatMessage | null;
  updatedAt: string;
}

export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface Registration {
  id: string;
  kind: "doctor" | "facility";
  facilityType?: FacilityType;
  name: string;
  phone: string;
  specialty?: string;
  licenseUrl: string;
  status: RegistrationStatus;
  createdUserId: string;
  createdFacilityId?: string;
  createdDoctorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyMedicine {
  id: string;
  facilityId: string;
  name: string;
  strength: string;
  form: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "requested"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItem {
  medicineId: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  patientId: string;
  pharmacyFacilityId: string;
  items: OrderItem[];
  fulfillment: "delivery" | "pickup";
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  authorUserId: string;
  authorName: string;
  facilityId?: string;
  doctorId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type ArticleStatus = "draft" | "pending_review" | "published" | "rejected";

export interface Article {
  id: string;
  authorDoctorId: string;
  authorName: string;
  title: string;
  body: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  doctorId: string;
  amount: number;
  period: string;
  status: "pending" | "paid";
  createdAt: string;
}

export interface SeedUser {
  id: string;
  role: Role;
  name: string;
  phone?: string;
  facilityId?: string;
  doctorId?: string;
  registrationStatus?: RegistrationStatus;
}
