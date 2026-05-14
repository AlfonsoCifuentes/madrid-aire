import Link from "next/link";

import { MobileBottomNav } from "@/components/MobileBottomNav";
import { OperationalStatusStrip } from "@/components/OperationalStatusStrip";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { getDashboardPayload, getSystemStatusPayload } from "@/lib/api";
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
  const [dashboard, system] = await Promise.all([getDashboardPayload(), getSystemStatusPayload()]);
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
  const navigationLabels: PublicNavLabels = {
    home: language === "es" ? "Inicio" : "Home",
    dashboard: copy.mobileNavDashboard,
    map: copy.mobileNavMap,
    stations: copy.mobileNavStations,
    predictions: copy.mobileNavPredictions,
    about: copy.mobileNavAbout,
  };
  const mobileNavItems = buildPublicMobileNavItems(language, navigationLabels);

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <PublicPageHeader language={language} pathname="/about" currentPage="about" labels={navigationLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutEyebrow}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.aboutTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.aboutSubtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <OperationalStatusStrip language={language} system={system} freshnessLabels={copy.freshness} currentPage="about" />

        <section id="advanced" className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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