import Link from "next/link";

import { FreshnessIndicator } from "@/components/FreshnessIndicator";
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
              <div className="mt-2">
                <FreshnessIndicator freshness={summary?.freshness ?? "unknown"} label={copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending} />
              </div>
            </div>
            {system?.model.improvement_pct_vs_best_baseline != null && (
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{language === "es" ? "Mejora modelo v1" : "Model v1 improvement"}</p>
                <p className="mt-4 font-data text-2xl text-lime">
                  +{system.model.improvement_pct_vs_best_baseline.toLocaleString(locale, { maximumFractionDigits: 1 })}%
                </p>
                <p className="mt-2 text-xs text-soft/55">{language === "es" ? "vs. mejor referencia" : "vs. best baseline"}</p>
              </div>
            )}
            {system?.model.horizon_hours != null && (
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{language === "es" ? "Horizonte de pronóstico" : "Forecast horizon"}</p>
                <p className="mt-4 font-data text-2xl text-bone">H+{system.model.horizon_hours}</p>
                <p className="mt-2 text-xs text-soft/55">{language === "es" ? "horas por adelantado" : "hours ahead"}</p>
                {system.model.selected_model && (
                  <p className="mt-2 inline-block rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 font-data text-[10px] uppercase tracking-widest text-lime/80">
                    {system.model.selected_model}
                  </p>
                )}
              </div>
            )}
            {system?.predictions.station_count != null && (
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{language === "es" ? "Estaciones con pronóstico" : "Stations with forecast"}</p>
                <p className="mt-4 font-data text-2xl text-bone">{system.predictions.station_count}</p>
                <p className="mt-2 text-xs text-soft/55">NO2 · {system.predictions.horizon_count ?? "-"} {language === "es" ? "horizontes" : "horizons"}</p>
              </div>
            )}
            {system?.model.training_period_start != null && (
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{language === "es" ? "Periodo de entrenamiento" : "Training period"}</p>
                <p className="mt-4 font-data text-xs text-bone leading-5">
                  {formatMoment(system.model.training_period_start, locale)}
                </p>
                <p className="font-data text-xs text-soft/55 leading-5">
                  → {formatMoment(system.model.training_period_end, locale)}
                </p>
                {system.model.test_period_start != null && (
                  <p className="mt-2 text-[10px] text-soft/40 uppercase tracking-widest">
                    {language === "es" ? "Test" : "Test"}: {formatMoment(system.model.test_period_start, locale)}
                  </p>
                )}
              </div>
            )}
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