"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(event) => {
        router.replace(pathname, { locale: event.target.value });
      }}
      className="h-10 rounded-[var(--radius-control)] border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
