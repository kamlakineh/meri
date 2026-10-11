"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/Card";
import { clientApiFetch } from "@/lib/api/clientFetch";
import { loginWithSeedUser } from "@/lib/actions/session";
import type { SeedUser } from "@/lib/api/types";

export function OtpForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const phone = useSearchParams().get("phone") ?? "";

  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) return;
    let active = true;
    // Re-requesting here (dev convenience) surfaces the code even on a
    // direct visit/refresh — there's no real SMS, see contracts/README.md.
    clientApiFetch<{ devCode: string }>("/auth/request-otp", {
      method: "POST",
      body: { phone },
    })
      .then((res) => {
        if (active) setDevCode(res.devCode);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [phone]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    let user: SeedUser;
    try {
      const result = await clientApiFetch<{ user: SeedUser }>("/auth/verify-otp", {
        method: "POST",
        body: { phone, code, name: name || undefined },
      });
      user = result.user;
    } catch {
      setError(t("invalidCode"));
      setLoading(false);
      return;
    }

    await loginWithSeedUser(user, locale);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <Card className="p-6">
        <h1 className="text-xl font-semibold text-foreground">{t("otpTitle")}</h1>
        <p className="mt-1 text-sm text-muted">{t("otpSubtitle", { phone })}</p>
        {devCode && (
          <p className="mt-3 rounded-[var(--radius-control)] bg-warning-soft px-3 py-2 text-xs text-warning">
            {t("devCodeNotice", { code: devCode })}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FormField label={t("codeLabel")} htmlFor="code" required>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("nameLabel")} htmlFor="name" hint={t("nameHint")}>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={loading}>
            {t("verify")}
          </Button>
        </form>
      </Card>
      <Link href="/auth/phone" className="text-center text-sm text-muted hover:text-primary">
        {t("changeNumber")}
      </Link>
    </div>
  );
}
