import { redirect } from "next/navigation";

import { resolveLanguage } from "@/lib/i18n";

type SplashPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function SplashPage({ searchParams }: SplashPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);

  redirect(`/dashboard?lang=${language}`);
}

