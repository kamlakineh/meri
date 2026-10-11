import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { listAppointments } from "@/lib/api/appointments";
import { listPayouts } from "@/lib/api/doctors";
import { getSession } from "@/lib/session";
import type { Appointment, Payout } from "@/lib/api/types";

export const instant = false;

export default async function DoctorEarningsPage() {
  const session = await getSession();
  const t = await getTranslations("doctor");

  const [appointments, payouts] = await Promise.all([
    listAppointments({ pageSize: 50 }),
    listPayouts(session!.doctorId!),
  ]);

  const paidAppointments = appointments.data.filter((a) => a.paymentStatus === "paid");
  const totalEarned = paidAppointments.reduce((sum, a) => sum + a.fee, 0);

  const appointmentColumns: Column<Appointment>[] = [
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleDateString(),
    },
    { key: "patient", header: t("columns.patient"), render: (a) => a.patientId },
    { key: "fee", header: t("columns.fee"), render: (a) => `ETB ${a.fee}` },
  ];

  const payoutColumns: Column<Payout>[] = [
    { key: "period", header: t("columns.date"), render: (p) => p.period },
    { key: "amount", header: t("columns.fee"), render: (p) => `ETB ${p.amount}` },
    {
      key: "status",
      header: t("columns.status"),
      render: (p) => <Badge tone={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("earningsTitle")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label={t("totalEarned")} value={`ETB ${totalEarned.toLocaleString()}`} tone="highlight" />
        <StatCard label={t("paidAppointmentsCount")} value={paidAppointments.length} />
      </div>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("scheduleTitle")}</h2>
        </div>
        <DataTable columns={appointmentColumns} rows={paidAppointments} rowKey={(a) => a.id} />
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-foreground">{t("payoutHistoryTitle")}</h2>
        </div>
        <DataTable columns={payoutColumns} rows={payouts.data} rowKey={(p) => p.id} />
      </Card>
    </div>
  );
}
