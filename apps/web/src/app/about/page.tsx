import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type AboutPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function formatMoment(value: string | null | undefined, locale: string) {
  if (!value) {
    return "-";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(timestamp);
}

type RouteCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
};

function RouteCard({ href, eyebrow, title, description }: RouteCardProps) {
  return (
    <Link className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere transition hover:bg-white/10" href={href}>
      <p className="eyebrow text-soft/55">{eyebrow}</p>
      <h2 className="mt-4 text-2xl font-medium text-bone">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-soft/72">{description}</p>
    </Link>
  );
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const summary = dashboard.summary;
  const publicRoutes = [
    { href: `/dashboard?lang=${language}`, title: copy.dashboardTitle, description: copy.aboutDashboardDesc },
    { href: `/map?lang=${language}`, title: copy.mapPageTitle, description: copy.aboutMapDesc },
    { href: `/stations?lang=${language}`, title: copy.stationsPageTitle, description: copy.aboutStationsDesc },
    { href: `/predictions?lang=${language}`, title: copy.predictionsTitle, description: copy.aboutPredictionsDesc },
  ];
  const technicalRoutes = [
    { href: `/model?lang=${language}`, title: copy.modelTitle, description: copy.aboutModelDesc },
    { href: `/methodology?lang=${language}`, title: copy.methodologyTitle, description: copy.aboutMethodologyDesc },
    { href: `/reports?lang=${language}`, title: copy.reportsTitle, description: copy.aboutReportsDesc },
    { href: `/system?lang=${language}`, title: copy.systemTitle, description: copy.aboutSystemDesc },
  ];
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "map", href: `/map?lang=${language}`, label: copy.mobileNavMap },
    { key: "stations", href: `/stations?lang=${language}`, label: copy.mobileNavStations },
    { key: "predictions", href: `/predictions?lang=${language}`, label: copy.mobileNavPredictions },
    { key: "about", href: `/about?lang=${language}`, label: copy.mobileNavAbout },
  ];

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="glass-panel rounded-full px-4 py-3 shadow-atmosphere">
            <MadridAireWordmark className="items-center" size="compact" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/landing?lang=${language}`}>
                {copy.backHome}
              </Link>
              <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/dashboard?lang=${language}`}>
                {copy.dashboardTitle}
              </Link>
              <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/predictions?lang=${language}`}>
                {copy.openPredictions}
              </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/about" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutEyebrow}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.aboutTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.aboutSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.station_count ?? 0}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.pollutant_count ?? 0}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(summary?.latest_timestamp, locale)}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutPublicRoutesTitle}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft/74">{copy.aboutPublicRoutesBody}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {publicRoutes.map((route) => (
              <RouteCard
                key={route.href}
                href={route.href}
                eyebrow={copy.aboutLiveLabel}
                title={route.title}
                description={route.description}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutTechnicalRoutesTitle}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft/74">{copy.aboutTechnicalRoutesBody}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {technicalRoutes.map((route) => (
              <RouteCard
                key={route.href}
                href={route.href}
                eyebrow={copy.aboutTechnicalLabel}
                title={route.title}
                description={route.description}
              />
            ))}
          </div>
        </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="about" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}