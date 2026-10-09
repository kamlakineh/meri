"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationPickerLoader } from "@/components/map/LocationPickerLoader";
import { clientApiFetch } from "@/lib/api/clientFetch";
import { fileToDataUrl } from "@/lib/files";
import type { Facility, FacilityHours } from "@/lib/api/types";

export function ProfileForm({
  facility,
  showSpecialtiesAndDepartments,
  labels,
}: {
  facility: Facility;
  showSpecialtiesAndDepartments: boolean;
  labels: {
    nameLabel: string;
    addressLabel: string;
    phoneLabel: string;
    locationLabel: string;
    hoursEditorLabel: string;
    hoursDayPlaceholder: string;
    hoursOpenPlaceholder: string;
    hoursClosePlaceholder: string;
    addHoursRow: string;
    servicesCsvLabel: string;
    specialtiesCsvLabel: string;
    departmentsCsvLabel: string;
    photoLabel: string;
    saveProfile: string;
    saved: string;
  };
}) {
  const [name, setName] = useState(facility.name);
  const [address, setAddress] = useState(facility.address);
  const [phone, setPhone] = useState(facility.phone);
  const [location, setLocation] = useState(facility.location);
  const [hours, setHours] = useState<FacilityHours[]>(
    facility.hours.length > 0 ? facility.hours : [{ day: "", open: "", close: "" }]
  );
  const [services, setServices] = useState(facility.services.join(", "));
  const [specialties, setSpecialties] = useState(facility.specialties.join(", "));
  const [departments, setDepartments] = useState(facility.departments.join(", "));
  const [photoUrl, setPhotoUrl] = useState(facility.photoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateHoursRow(index: number, patch: Partial<FacilityHours>) {
    setHours((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function addHoursRow() {
    setHours((prev) => [...prev, { day: "", open: "", close: "" }]);
  }
  function removeHoursRow(index: number) {
    setHours((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePhoto(file: File) {
    setPhotoUrl(await fileToDataUrl(file));
  }

  function toList(value: string) {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await clientApiFetch(`/facilities/${facility.id}`, {
        method: "PATCH",
        body: {
          name,
          address,
          phone,
          location,
          hours: hours.filter((h) => h.day.trim()),
          services: toList(services),
          specialties: showSpecialtiesAndDepartments ? toList(specialties) : undefined,
          departments: showSpecialtiesAndDepartments ? toList(departments) : undefined,
          photoUrl: photoUrl || undefined,
        },
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {labels.nameLabel}
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {labels.phoneLabel}
          </label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.addressLabel}
        </label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.locationLabel}
        </label>
        <LocationPickerLoader value={location} onChange={setLocation} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {labels.hoursEditorLabel}
        </label>
        <div className="flex flex-col gap-2">
          {hours.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
              <Input
                placeholder={labels.hoursDayPlaceholder}
                value={row.day}
                onChange={(e) => updateHoursRow(i, { day: e.target.value })}
              />
              <Input
                placeholder={labels.hoursOpenPlaceholder}
                value={row.open}
                onChange={(e) => updateHoursRow(i, { open: e.target.value })}
              />
              <Input
                placeholder={labels.hoursClosePlaceholder}
                value={row.close}
                onChange={(e) => updateHoursRow(i, { close: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeHoursRow(i)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={addHoursRow}
            className="w-fit"
          >
            <Plus className="h-4 w-4" /> {labels.addHoursRow}
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.servicesCsvLabel}
        </label>
        <Input value={services} onChange={(e) => setServices(e.target.value)} />
      </div>

      {showSpecialtiesAndDepartments && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {labels.specialtiesCsvLabel}
            </label>
            <Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {labels.departmentsCsvLabel}
            </label>
            <Input value={departments} onChange={(e) => setDepartments(e.target.value)} />
          </div>
        </>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {labels.photoLabel}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhoto(file);
          }}
          className="text-sm text-foreground"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} isLoading={saving}>
          {labels.saveProfile}
        </Button>
        {saved && <span className="text-sm text-success">{labels.saved}</span>}
      </div>
    </div>
  );
}
