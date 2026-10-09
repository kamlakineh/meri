"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Case, Facility } from "@/lib/api/types";

export function RequestsTable({
  cases,
  facilities,
  labels,
}: {
  cases: Case[];
  facilities: Facility[];
  labels: {
    accept: string;
    decline: string;
    refer: string;
    referTitle: string;
    referConfirm: string;
    confirmAcceptTitle: string;
    confirmAcceptBody: string;
    confirmDeclineTitle: string;
    confirmDeclineBody: string;
  };
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    caseId: string;
    action: "accepted" | "declined";
  } | null>(null);
  const [referCaseId, setReferCaseId] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState("");

  async function updateStatus(caseId: string, status: "accepted" | "declined") {
    setBusyId(caseId);
    try {
      await clientApiFetch(`/cases/${caseId}`, { method: "PATCH", body: { status } });
      router.refresh();
    } finally {
      setBusyId(null);
      setConfirmAction(null);
    }
  }

  async function referCase() {
    if (!referCaseId || !selectedFacility) return;
    setBusyId(referCaseId);
    try {
      await clientApiFetch(`/cases/${referCaseId}`, {
        method: "PATCH",
        body: { status: "referred", referredToFacilityId: selectedFacility },
      });
      router.refresh();
    } finally {
      setBusyId(null);
      setReferCaseId(null);
      setSelectedFacility("");
    }
  }

  if (cases.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">—</p>;
  }

  return (
    <>
      <div className="divide-y divide-border">
        {cases.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link href={`/doctor/cases/${c.id}`} className="hover:underline">
              <p className="font-medium text-foreground">{c.patientId}</p>
              <p className="line-clamp-1 max-w-md text-sm text-muted">{c.symptoms}</p>
            </Link>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setConfirmAction({ caseId: c.id, action: "accepted" })}
                isLoading={busyId === c.id}
              >
                {labels.accept}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirmAction({ caseId: c.id, action: "declined" })}
                isLoading={busyId === c.id}
              >
                {labels.decline}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setReferCaseId(c.id)}>
                {labels.refer}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && updateStatus(confirmAction.caseId, confirmAction.action)}
        title={
          confirmAction?.action === "accepted"
            ? labels.confirmAcceptTitle
            : labels.confirmDeclineTitle
        }
        description={
          confirmAction?.action === "accepted"
            ? labels.confirmAcceptBody
            : labels.confirmDeclineBody
        }
        isLoading={!!busyId}
        danger={confirmAction?.action === "declined"}
        confirmLabel={confirmAction?.action === "accepted" ? labels.accept : labels.decline}
      />

      <Modal
        open={!!referCaseId}
        onClose={() => setReferCaseId(null)}
        title={labels.referTitle}
        footer={
          <Button onClick={referCase} isLoading={!!busyId} disabled={!selectedFacility}>
            {labels.referConfirm}
          </Button>
        }
      >
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="h-10 w-full rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">—</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
      </Modal>
    </>
  );
}
