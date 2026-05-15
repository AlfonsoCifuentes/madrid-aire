import { redirect } from "next/navigation";

import { resolveLanguage } from "@/lib/i18n";

type LandingRedirectPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};
export default async function LandingRedirectPage({ searchParams }: LandingRedirectPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  redirect(`/?lang=${language}`);
}