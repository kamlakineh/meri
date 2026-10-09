"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";

export function ArticleForm({
  titleLabel,
  bodyLabel,
  submitLabel,
}: {
  titleLabel: string;
  bodyLabel: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await clientApiFetch("/articles", { method: "POST", body: { title, body } });
      setTitle("");
      setBody("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder={titleLabel}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder={bodyLabel}
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <Button type="submit" isLoading={saving} className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
