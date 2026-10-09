"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Registration } from "@/lib/api/types";

export function ApprovalsTable({
  registrations,
  labels,
}: {
  registrations: Registration[];
  labels: {
    nameHeader: string;
    kindHeader: string;
    phoneHeader: string;
    submittedHeader: string;
    approve: string;
    reject: string;
    viewLicense: string;
    noApprovals: string;
  };
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await clientApiFetch(`/registrations/${id}`, { method: "PATCH", body: { status } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (registrations.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">{labels.noApprovals}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {registrations.map((registration) => (
        <div
          key={registration.id}
          className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{registration.name}</p>
              <Badge tone="info">
                {registration.kind === "doctor" ? registration.specialty : registration.facilityType}
              </Badge>
            </div>
            <p className="text-sm text-muted">
              {registration.phone} ·{" "}
              {new Date(registration.createdAt).toLocaleDateString()}
            </p>
            <a
              href={registration.licenseUrl}
              download
              className="text-sm font-medium text-primary"
            >
              {labels.viewLicense}
            </a>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => review(registration.id, "approved")}
              isLoading={busyId === registration.id}
            >
              {labels.approve}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => review(registration.id, "rejected")}
              isLoading={busyId === registration.id}
            >
              {labels.reject}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
