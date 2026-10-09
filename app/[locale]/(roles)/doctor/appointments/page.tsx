import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { listAppointments } from "@/lib/api/appointments";
import type { Appointment } from "@/lib/api/types";

export const instant = false;

const APPOINTMENT_STATUS_TONE: Record<
  Appointment["status"],
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending_payment: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "neutral",
};

export default async function DoctorAppointmentsPage() {
  const t = await getTranslations("doctor");
  const { data } = await listAppointments({ pageSize: 50 });

  const columns: Column<Appointment>[] = [
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
      <PageHeader title={t("scheduleTitle")} subtitle={t("scheduleSubtitle")} />
      <Card>
        <DataTable columns={columns} rows={data} rowKey={(a) => a.id} />
      </Card>
    </div>
  );
}
