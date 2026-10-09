"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/Card";
import { clientApiFetch } from "@/lib/api/clientFetch";

export default function PhoneSignInPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await clientApiFetch("/auth/request-otp", { method: "POST", body: { phone } });
      router.push(`/auth/otp?phone=${encodeURIComponent(phone)}`);
    } catch {
      setError(t("genericError"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-16">
      <Card className="p-6">
        <h1 className="text-xl font-semibold text-foreground">{t("phoneTitle")}</h1>
        <p className="mt-1 text-sm text-muted">{t("phoneSubtitle")}</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FormField label={t("phoneLabel")} htmlFor="phone" required>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </FormField>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={loading}>
            {t("sendCode")}
          </Button>
        </form>
      </Card>
      <Link href="/login" className="text-center text-sm text-muted hover:text-primary">
        {t("orDevSignIn")}
      </Link>
    </div>
  );
}
