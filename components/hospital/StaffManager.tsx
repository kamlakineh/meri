"use client";

import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Doctor, SeedUser } from "@/lib/api/types";

type StaffMember = SeedUser & { doctor: Doctor | null };

export function StaffManager({
  facilityId,
  staff,
  labels,
}: {
  facilityId: string;
  staff: StaffMember[];
  labels: {
    addStaffButton: string;
    nameLabel: string;
    specialtyLabel: string;
    feeLabel: string;
    removeAction: string;
    noStaff: string;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [fee, setFee] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function addStaff(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await clientApiFetch(`/facilities/${facilityId}/staff`, {
        method: "POST",
        body: { name, specialty, consultationFee: fee ? Number(fee) : undefined },
      });
      setName("");
      setSpecialty("");
      setFee("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeStaff(userId: string) {
    setRemovingId(userId);
    try {
      await clientApiFetch(`/facilities/${facilityId}/staff/${userId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addStaff} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <Input
            placeholder={labels.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <Input
            placeholder={labels.specialtyLabel}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Input
            type="number"
            placeholder={labels.feeLabel}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={saving}>
          {labels.addStaffButton}
        </Button>
      </form>

      {staff.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{labels.noStaff}</p>
      ) : (
        <div className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-4">
              <Avatar name={member.name} />
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-sm text-muted">{member.doctor?.specialty}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStaff(member.id)}
                isLoading={removingId === member.id}
              >
                {labels.removeAction}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
