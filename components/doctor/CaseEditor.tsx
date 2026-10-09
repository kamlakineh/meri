"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Case, PrescriptionMedicine } from "@/lib/api/types";

export function CaseEditor({
  caseRecord,
  labels,
}: {
  caseRecord: Case;
  labels: {
    notesLabel: string;
    medicineName: string;
    dosage: string;
    instructions: string;
    addMedicine: string;
    saveNotes: string;
    saved: string;
  };
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(caseRecord.doctorNotes ?? "");
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>(caseRecord.medicines);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateMedicine(index: number, field: keyof PrescriptionMedicine, value: string) {
    setMedicines((prev) =>
      prev.map((medicine, i) => (i === index ? { ...medicine, [field]: value } : medicine))
    );
  }

  function addMedicine() {
    setMedicines((prev) => [...prev, { name: "", dosage: "", instructions: "" }]);
  }

  function removeMedicine(index: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await clientApiFetch(`/cases/${caseRecord.id}`, {
        method: "PATCH",
        body: {
          doctorNotes: notes,
          medicines: medicines.filter((m) => m.name.trim()),
        },
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.notesLabel}
        </label>
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        {medicines.map((medicine, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
            <Input
              placeholder={labels.medicineName}
              value={medicine.name}
              onChange={(e) => updateMedicine(i, "name", e.target.value)}
            />
            <Input
              placeholder={labels.dosage}
              value={medicine.dosage}
              onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
            />
            <Input
              placeholder={labels.instructions}
              value={medicine.instructions}
              onChange={(e) => updateMedicine(i, "instructions", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeMedicine(i)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addMedicine} className="self-start">
          {labels.addMedicine}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} isLoading={saving}>
          {labels.saveNotes}
        </Button>
        {saved && <span className="text-sm text-success">{labels.saved}</span>}
      </div>
    </div>
  );
}
