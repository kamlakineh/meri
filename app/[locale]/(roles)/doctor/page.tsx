import { CalendarClock, Inbox, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/layout/StatCard";
import { CalendarWidget, type CalendarEvent } from "@/components/layout/CalendarWidget";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/table/DataTable";
import { listCases } from "@/lib/api/cases";
import { listAppointments } from "@/lib/api/appointments";
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

export default async function DoctorHomePage() {
  const t = await getTranslations("doctor");

  const [incoming, appointments] = await Promise.all([
    listCases({ status: "submitted", pageSize: 10 }),
    listAppointments({ pageSize: 10 }),
  ]);

  const today = new Date();
  const todayCount = appointments.data.filter((a) =>
    isSameDay(new Date(a.start), today)
  ).length;
  const earnings = appointments.data
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + a.fee, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const chartData = weekDays.map((day) => {
    const dayAppointments = appointments.data.filter((a) =>
      isSameDay(new Date(a.start), day)
    );
    return {
      day: day.toLocaleDateString(undefined, { weekday: "short" }),
      confirmed: dayAppointments.filter((a) => a.status === "confirmed").length,
      pending: dayAppointments.filter((a) => a.status === "pending_payment").length,
    };
  });

  const calendarEvents: CalendarEvent[] = appointments.data.map((a) => ({
    date: a.start,
    tone: a.status === "confirmed" ? "primary" : "warning",
  }));

  const requestColumns: Column<Case>[] = [
    { key: "patient", header: t("columns.patient"), render: (c) => c.patientId },
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
      key: "submitted",
      header: t("columns.submitted"),
      render: (c) => new Date(c.createdAt).toLocaleString(),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (c) => <Badge tone={CASE_STATUS_TONE[c.status]}>{c.status}</Badge>,
    },
  ];

  const appointmentColumns: Column<Appointment>[] = [
    { key: "patient", header: t("columns.patient"), render: (a) => a.patientId },
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleString(),
    },
    { key: "fee", header: t("columns.fee"), render: (a) => `ETB ${a.fee}` },
    {
      key: "status",
      header: t("columns.status"),
      render: (a) => (
        <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{a.status}</Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("statIncomingRequests")}
          value={incoming.pagination.total}
          icon={Inbox}
          tone="highlight"
        />
        <StatCard
          label={t("statTodayAppointments")}
          value={todayCount}
          icon={CalendarClock}
        />
        <StatCard
          label={t("statWeeklyEarnings")}
          value={`ETB ${earnings.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LineChartCard
            title={t("scheduleChartTitle")}
            subtitle={t("scheduleChartSubtitle")}
            data={chartData}
            xKey="day"
            series={[
              { key: "confirmed", label: t("legendConfirmed"), color: "var(--color-primary)" },
              { key: "pending", label: t("legendPending"), color: "var(--color-accent)" },
            ]}
          />
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
            {t("incomingRequestsTitle")}
          </h2>
          <p className="text-sm text-muted">{t("incomingRequestsSubtitle")}</p>
        </div>
        <DataTable
          columns={requestColumns}
          rows={incoming.data}
          rowKey={(c) => c.id}
        />
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("scheduleTitle")}</h2>
          <p className="text-sm text-muted">{t("scheduleSubtitle")}</p>
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
