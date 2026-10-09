import { CalendarClock, Inbox, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/layout/StatCard";
import { CalendarWidget, type CalendarEvent } from "@/components/layout/CalendarWidget";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/table/DataTable";
import { listCases } from "@/lib/api/cases";
import { listAppointments } from "@/lib/api/appointments";
import { getFacility } from "@/lib/api/search";
import { getSession } from "@/lib/session";
import type { Appointment, Case } from "@/lib/api/types";

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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function HospitalHomePage() {
  const session = await getSession();
  const t = await getTranslations("hospital");

  const [requests, appointments, facility] = await Promise.all([
    listCases({ pageSize: 10 }),
    listAppointments({ pageSize: 10 }),
    session!.facilityId ? getFacility(session!.facilityId) : null,
  ]);

  const today = new Date();
  const todayCount = appointments.data.filter((a) =>
    isSameDay(new Date(a.start), today)
  ).length;

  const calendarEvents: CalendarEvent[] = appointments.data.map((a) => ({
    date: a.start,
    tone: a.status === "confirmed" ? "primary" : "warning",
  }));

  const requestColumns: Column<Case>[] = [
    { key: "patient", header: t("columns.patient"), render: (c) => c.patientId },
    { key: "doctor", header: t("columns.doctor"), render: (c) => c.doctorId ?? "—" },
    {
      key: "status",
      header: t("columns.status"),
      render: (c) => <Badge tone={CASE_STATUS_TONE[c.status]}>{c.status}</Badge>,
    },
    {
      key: "date",
      header: t("columns.date"),
      render: (c) => new Date(c.createdAt).toLocaleString(),
    },
  ];

  const appointmentColumns: Column<Appointment>[] = [
    { key: "patient", header: t("columns.patient"), render: (a) => a.patientId },
    { key: "doctor", header: t("columns.doctor"), render: (a) => a.doctorId },
    {
      key: "status",
      header: t("columns.status"),
      render: (a) => (
        <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{a.status}</Badge>
      ),
    },
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleString(),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("statOpenRequests")}
          value={requests.pagination.total}
          icon={Inbox}
          tone="highlight"
        />
        <StatCard
          label={t("statTodayAppointments")}
          value={todayCount}
          icon={CalendarClock}
        />
        <StatCard
          label={t("statRating")}
          value={facility ? facility.rating.toFixed(1) : "—"}
          icon={Star}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card>
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-foreground">{t("requestsTitle")}</h2>
              <p className="text-sm text-muted">{t("requestsSubtitle")}</p>
            </div>
            <DataTable
              columns={requestColumns}
              rows={requests.data}
              rowKey={(c) => c.id}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <CalendarWidget
            title={t("calendarTitle")}
            events={calendarEvents}
            legend={[
              { label: t("legendConfirmed"), tone: "primary" },
              { label: t("legendPending"), tone: "warning" },
            ]}
          />
        </div>
      </div>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">
            {t("appointmentsTitle")}
          </h2>
          <p className="text-sm text-muted">{t("appointmentsSubtitle")}</p>
        </div>
        <DataTable
          columns={appointmentColumns}
          rows={appointments.data}
          rowKey={(a) => a.id}
        />
      </Card>
    </div>
  );
}
