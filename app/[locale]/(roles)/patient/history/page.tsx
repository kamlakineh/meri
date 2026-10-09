import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { listAppointments } from "@/lib/api/appointments";
import { listCases } from "@/lib/api/cases";
import { listOrders } from "@/lib/api/orders";
import type { Appointment, Case } from "@/lib/api/types";

export const instant = false;

type Tab = "cases" | "appointments" | "orders" | "payments";

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

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (["cases", "appointments", "orders", "payments"] as Tab[]).includes(
    tabParam as Tab
  )
    ? (tabParam as Tab)
    : "cases";

  const t = await getTranslations("patient");

  const tabs: { key: Tab; label: string }[] = [
    { key: "cases", label: t("historyCasesTab") },
    { key: "appointments", label: t("historyAppointmentsTab") },
    { key: "orders", label: t("historyOrdersTab") },
    { key: "payments", label: t("historyPaymentsTab") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("historyTitle")}
        actions={
          tab === "cases" && (
            <Link
              href="/patient/cases/new"
              className="rounded-[var(--radius-control)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {t("newCaseButton")}
            </Link>
          )
        }
      />

      <div className="flex gap-1 border-b border-border">
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`/patient/history?tab=${item.key}`}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              tab === item.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Card>
        {tab === "cases" && <CasesTab t={t} />}
        {tab === "appointments" && <AppointmentsTab t={t} />}
        {tab === "orders" && <OrdersTab t={t} />}
        {tab === "payments" && <PaymentsTab t={t} />}
      </Card>
    </div>
  );
}

type T = Awaited<ReturnType<typeof getTranslations>>;

async function CasesTab({ t }: { t: T }) {
  const { data } = await listCases({ pageSize: 50 });
  const columns: Column<Case>[] = [
    {
      key: "symptoms",
      header: t("columns.symptoms"),
      render: (c) => (
        <span className="line-clamp-1 max-w-xs text-foreground">{c.symptoms}</span>
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
    {
      key: "view",
      header: "",
      render: (c) => (
        <Link href={`/patient/cases/${c.id}`} className="text-sm font-medium text-primary">
          {t("viewCase")}
        </Link>
      ),
    },
  ];
  return <DataTable columns={columns} rows={data} rowKey={(c) => c.id} />;
}

async function AppointmentsTab({ t }: { t: T }) {
  const { data } = await listAppointments({ pageSize: 50 });
  const columns: Column<Appointment>[] = [
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleString(),
    },
    { key: "doctor", header: t("columns.doctor"), render: (a) => a.doctorId },
    {
      key: "status",
      header: t("columns.status"),
      render: (a) => (
        <Badge tone={APPOINTMENT_STATUS_TONE[a.status]}>{a.status}</Badge>
      ),
    },
    {
      key: "action",
      header: "",
      render: (a) =>
        a.paymentStatus === "unpaid" ? (
          <Link
            href={`/patient/appointments/${a.id}/pay`}
            className="text-sm font-medium text-primary"
          >
            {t("payNow")}
          </Link>
        ) : a.status === "completed" ? (
          <Link
            href={`/patient/appointments/${a.id}/review`}
            className="text-sm font-medium text-primary"
          >
            {t("leaveReview")}
          </Link>
        ) : null,
    },
  ];
  return <DataTable columns={columns} rows={data} rowKey={(a) => a.id} />;
}

async function OrdersTab({ t }: { t: T }) {
  const { data } = await listOrders();
  const columns: Column<(typeof data)[number]>[] = [
    {
      key: "items",
      header: t("columns.symptoms"),
      render: (o) => o.items.map((i) => `${i.name} ×${i.quantity}`).join(", "),
    },
    { key: "fulfillment", header: t("columns.type"), render: (o) => o.fulfillment },
    {
      key: "status",
      header: t("columns.status"),
      render: (o) => <Badge tone="info">{o.status}</Badge>,
    },
    {
      key: "date",
      header: t("columns.date"),
      render: (o) => new Date(o.createdAt).toLocaleDateString(),
    },
  ];
  return <DataTable columns={columns} rows={data} rowKey={(o) => o.id} />;
}

async function PaymentsTab({ t }: { t: T }) {
  const { data } = await listAppointments({ pageSize: 50 });
  const columns: Column<Appointment>[] = [
    {
      key: "date",
      header: t("columns.date"),
      render: (a) => new Date(a.start).toLocaleDateString(),
    },
    { key: "doctor", header: t("columns.doctor"), render: (a) => a.doctorId },
    { key: "fee", header: t("columns.fee"), render: (a) => `ETB ${a.fee}` },
    {
      key: "status",
      header: t("columns.status"),
      render: (a) => (
        <Badge tone={a.paymentStatus === "paid" ? "success" : "warning"}>
          {a.paymentStatus}
        </Badge>
      ),
    },
  ];
  return <DataTable columns={columns} rows={data} rowKey={(a) => a.id} />;
}
