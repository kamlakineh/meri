import { CalendarCheck, ClipboardList, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/layout/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/table/DataTable";
import { listCases } from "@/lib/api/cases";
import { listAppointments } from "@/lib/api/appointments";
import { searchFacilities } from "@/lib/api/search";
import type { Appointment, Case, Facility } from "@/lib/api/types";

export const instant = false;

const CASE_STATUS_TONE: Record<
  Case["status"],
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  submitted: "info",
  accepted: "success",
  declined: "danger",
  referred: "warning",
  closed: "neutral",
};

const APPOINTMENT_STATUS_TONE: Record<
  Appointment["status"],
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending_payment: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "neutral",
};

export default async function PatientHomePage() {
  const t = await getTranslations("patient");

  const [cases, appointments, facilities] = await Promise.all([
    listCases({ pageSize: 5 }),
    listAppointments({ pageSize: 5 }),
    searchFacilities({ pageSize: 5 }),
  ]);

  const openCases = cases.data.filter(
    (c) => c.status === "submitted" || c.status === "accepted"
  ).length;
  const upcoming = appointments.data.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed"
  ).length;

  const caseColumns: Column<Case>[] = [
    {
      key: "symptoms",
      header: t("columns.symptoms"),
      render: (c) => (
        <span className="line-clamp-1 max-w-xs text-foreground">
          {c.symptoms}
        </span>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (c) => <Badge tone={CASE_STATUS_TONE[c.status]}>{c.status}</Badge>,
    },
    {
      key: "date",
      header: t("columns.date"),
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  const appointmentColumns: Column<Appointment>[] = [
    {
      key: "doctor",
      header: t("columns.doctor"),
      render: (a) => a.doctorId,
    },
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleString(),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (a) => (
        <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{a.status}</Badge>
      ),
    },
  ];

  const facilityColumns: Column<Facility>[] = [
    { key: "name", header: t("columns.facility"), render: (f) => f.name },
    { key: "type", header: t("columns.type"), render: (f) => f.type },
    {
      key: "distance",
      header: t("columns.distance"),
      render: (f) =>
        f.distanceKm !== undefined ? `${f.distanceKm.toFixed(1)} km` : "—",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("statOpenCases")}
          value={openCases}
          icon={ClipboardList}
          tone="highlight"
        />
        <StatCard
          label={t("statUpcomingAppointments")}
          value={upcoming}
          icon={CalendarCheck}
        />
        <StatCard
          label={t("statNearbyFacilities")}
          value={facilities.pagination.total}
          icon={MapPin}
        />
      </div>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">
            {t("recentCasesTitle")}
          </h2>
          <p className="text-sm text-muted">{t("recentCasesSubtitle")}</p>
        </div>
        <DataTable columns={caseColumns} rows={cases.data} rowKey={(c) => c.id} />
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">
            {t("upcomingAppointmentsTitle")}
          </h2>
          <p className="text-sm text-muted">
            {t("upcomingAppointmentsSubtitle")}
          </p>
        </div>
        <DataTable
          columns={appointmentColumns}
          rows={appointments.data}
          rowKey={(a) => a.id}
        />
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">
            {t("nearbyFacilitiesTitle")}
          </h2>
          <p className="text-sm text-muted">{t("nearbyFacilitiesSubtitle")}</p>
        </div>
        <DataTable
          columns={facilityColumns}
          rows={facilities.data}
          rowKey={(f) => f.id}
        />
      </Card>
    </div>
  );
}
