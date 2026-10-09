"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Case, CaseStatus } from "@/lib/api/types";

const STATUS_TONE: Record<
  CaseStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  submitted: "info",
  accepted: "success",
  declined: "danger",
  referred: "warning",
  closed: "neutral",
};

export function ReferredCasesTable({
  cases,
  acceptLabel,
}: {
  cases: Case[];
  acceptLabel: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markAccepted(caseId: string) {
    setBusyId(caseId);
    try {
      await clientApiFetch(`/cases/${caseId}`, { method: "PATCH", body: { status: "accepted" } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (cases.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">—</p>;
  }

  return (
    <div className="divide-y divide-border">
      {cases.map((caseRecord) => (
        <div
          key={caseRecord.id}
          className="flex items-center justify-between gap-3 p-4"
        >
          <div>
            <p className="font-medium text-foreground">{caseRecord.patientId}</p>
            <p className="line-clamp-1 max-w-md text-sm text-muted">{caseRecord.symptoms}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[caseRecord.status]}>{caseRecord.status}</Badge>
            {caseRecord.status === "referred" && (
              <Button
                size="sm"
                onClick={() => markAccepted(caseRecord.id)}
                isLoading={busyId === caseRecord.id}
              >
                {acceptLabel}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
