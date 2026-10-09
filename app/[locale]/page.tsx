import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Entirely personalized (depends on the mock session cookie) — not a useful
// prerender target. See contracts/README.md and CLAUDE.md for the Cache
// Components model this opts out of.
export const instant = false;

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  redirect(session ? `/${locale}/${session.role}` : `/${locale}/login`);
}
