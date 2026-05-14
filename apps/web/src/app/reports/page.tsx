import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MetricBars } from "@/components/MetricBars";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getAlertsPayload, getDashboardPayload, getModelMetricsPayload, getSystemStatusPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type ReportsPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function formatMoment(value: string | null, locale: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

function formatWindow(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) {
    return "-";
  }

  return `${start.slice(0, 10)} → ${end.slice(0, 10)}`;
}

function formatModelName(value: string | null | undefined, language: "es" | "en") {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("hist_gradient_boosting")) {
    return language === "es" ? "Modelo NO2 v1" : "NO2 model v1";
  }
  if (normalized === "persistence") {
    return language === "es" ? "Tendencia reciente" : "Recent trend reference";
  }
  if (normalized === "same_hour_yesterday") {
    return language === "es" ? "Ayer a esta hora" : "Same time yesterday";
  }
  if (normalized === "rolling_mean_24h") {
    return language === "es" ? "Media reciente" : "Recent average";
  }

  return value?.replaceAll("_", " ") ?? "-";
}

function severityClasses(severity: string) {
  if (severity === "critical") {
    return "border-[#ff7b7b]/30 bg-[#ff7b7b]/10 text-[#ffd1d1]";
  }
  if (severity === "warning") {
    return "border-[#f2d06b]/30 bg-[#f2d06b]/10 text-[#fff1bf]";
  }
  return "border-white/10 bg-white/5 text-soft/78";
}

function buildCopy(language: "es" | "en") {
  if (language === "es") {
    return {
      dailyTitle: "Daily summary",
      weeklyTitle: "Weekly model report",
      freshnessTitle: "Data freshness",
      issuesTitle: "Known issues",
      dailyNote: "Resumen rápido de la situación del día: estación más presionada, momento de actualización y alcance actual de la red.",
      weeklyNote: "Lectura breve del modelo actual y de las métricas más útiles para seguir su comportamiento.",
      freshnessNote: "Este bloque resume si la señal y la previsión se están actualizando con normalidad.",
      issuesEmpty: "No hay incidencias activas adicionales más allá del estado operativo ya resumido arriba.",
      worstStationLabel: "Peor estación del día",
      activeAlertsLabel: "Alertas activas",
      predictorLabel: "Modelo actual",
      overallNote: "No es un parte oficial; es una lectura editorial construida sobre datos oficiales y el estado actual del proyecto.",
    };
  }

  return {
    dailyTitle: "Daily summary",
    weeklyTitle: "Weekly model report",
    freshnessTitle: "Data freshness",
    issuesTitle: "Known issues",
    dailyNote: "A quick summary of the day: most pressured station, latest update time, and current network coverage.",
    weeklyNote: "A short reading of the current model and the metrics that matter most when tracking its behaviour.",
    freshnessNote: "This block summarises whether the signal and the forecast are updating normally.",
    issuesEmpty: "There are no extra active issues beyond the operational state already summarized above.",
    worstStationLabel: "Worst station today",
    activeAlertsLabel: "Active alerts",
    predictorLabel: "Current model",
    overallNote: "This is not an official bulletin; it is an editorial reading built on official data and the current state of the project.",
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const copy = copyByLanguage[language];
  const pageCopy = buildCopy(language);
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "model", href: `/model?lang=${language}`, label: copy.mobileNavModel },
    { key: "methodology", href: `/methodology?lang=${language}`, label: copy.mobileNavMethodology },
    { key: "reports", href: `/reports?lang=${language}`, label: copy.mobileNavReports },
    { key: "system", href: `/system?lang=${language}`, label: copy.mobileNavSystem },
  ];
  const [dashboard, metrics, system, alerts] = await Promise.all([
    getDashboardPayload(),
    getModelMetricsPayload(),
    getSystemStatusPayload(),
    getAlertsPayload(),
  ]);

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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/about?lang=${language}`}>
              {copy.openAbout}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/methodology?lang=${language}`}>
              {copy.openMethodology}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/model?lang=${language}`}>
              {copy.openModel}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/system?lang=${language}`}>
              {copy.openSystem}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/reports" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutLiveLabel}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.reportsTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.reportsSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.worstStationLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{dashboard.summary?.worst_station_id ?? "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.activeAlertsLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{alerts?.items.length ?? 0}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(dashboard.summary?.latest_timestamp ?? null, locale)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.predictorLabel}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.dailyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.dailyNote}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(dashboard.summary?.latest_timestamp ?? null, locale)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.mapNodeFreshness}</p>
                <p className="mt-2 font-data text-sm text-bone">{copy.freshness[dashboard.summary?.freshness ?? "pending"] ?? copy.freshness.pending}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                <p className="mt-2 font-data text-3xl text-bone">{dashboard.summary?.station_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
                <p className="mt-2 font-data text-3xl text-bone">{dashboard.summary?.pollutant_count ?? 0}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.weeklyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.weeklyNote}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{metrics?.horizon_hours ? `${metrics.horizon_hours}h` : "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.testWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null)}</p>
              </div>
            </div>
            <div className="mt-5">
              <MetricBars items={metrics?.items ?? []} maeLabel={copy.metricMae} rmseLabel={copy.metricRmse} r2Label={copy.metricR2} />
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.freshnessTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.freshnessNote}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.systemGlobalStatusLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.status ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.mapNodeFreshness}</p>
                <p className="mt-2 font-data text-sm text-bone">{copy.freshness[system?.data_quality.freshness ?? "unknown"] ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemGeneratedAtLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(system?.predictions.generated_at ?? null, locale)}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-soft/70">{pageCopy.overallNote}</p>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.issuesTitle}</h2>
            <div className="mt-5 grid gap-4">
              {alerts?.items.length ? (
                alerts.items.map((alert) => (
                  <article key={alert.id} className={`rounded-[1.5rem] border p-4 ${severityClasses(alert.severity)}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="eyebrow">{alert.category}</p>
                      <p className="font-data text-xs uppercase tracking-[0.24em]">{alert.severity}</p>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-bone">{alert.title}</h3>
                    <p className="mt-2 text-sm leading-6">{alert.body}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-6 text-soft/74">{pageCopy.issuesEmpty}</p>
              )}
            </div>
          </section>
        </div>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="reports" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}