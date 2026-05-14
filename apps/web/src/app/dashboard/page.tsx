import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { ObservationTable } from "@/components/ObservationTable";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type DashboardPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const payload = await getDashboardPayload();
  const summary = payload.summary;
  const latest = payload.latest?.items ?? [];
  const topRows = latest
    .filter((item) => item.pollutant_code === "NO2")
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "map", href: `/map?lang=${language}`, label: copy.mobileNavMap },
    { key: "stations", href: `/stations?lang=${language}`, label: copy.mobileNavStations },
    { key: "predictions", href: `/predictions?lang=${language}`, label: copy.mobileNavPredictions },
    { key: "system", href: `/system?lang=${language}`, label: copy.mobileNavSystem },
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/map?lang=${language}`}>
              {copy.openMap}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/stations?lang=${language}`}>
              {copy.openStations}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/predictions?lang=${language}`}>
              {copy.openPredictions}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/model?lang=${language}`}>
              {copy.openModel}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/system?lang=${language}`}>
              {copy.openSystem}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/dashboard" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.dashboardMetricsTitle}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.dashboardTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.dashboardSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.worstStation}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.worst_station_id ?? "-"}</p>
              <p className="mt-3 text-sm text-soft/70">
                {summary?.worst_pollutant_code ?? "-"}
                {summary?.worst_value != null ? ` · ${summary.worst_value.toLocaleString(locale, { maximumFractionDigits: 1 })}` : ""}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-3xl text-bone">
                {summary?.latest_timestamp
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "Europe/Madrid",
                    }).format(new Date(summary.latest_timestamp))
                  : "-"}
              </p>
              <p className="mt-3 text-sm text-soft/70">{copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.pollutant_count ?? 0}</p>
              <p className="mt-3 text-sm text-soft/70">NO2 · O3 · PM10 · PM25 · SO2 · CO</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.station_count ?? 0}</p>
              <p className="mt-3 text-sm text-soft/70">{copy.sourceLabel}: {summary?.source ?? "api_unavailable"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.observationsPanel}</p>
              <p className="font-data text-sm text-soft/55">NO2 snapshot</p>
            </div>
            <div className="mt-5">
              <ObservationTable items={topRows} language={language} />
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.mapStatusTitle}</p>
              <p className="mt-4 font-data text-2xl text-bone">{copy.pendingCoords}</p>
              <p className="mt-4 text-sm leading-6 text-soft/72">{copy.mapStatusBody}</p>
            </div>
            <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.sourceLabel}</p>
              <p className="mt-4 break-all font-data text-sm text-bone">{summary?.source ?? "local_api_unavailable"}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-soft/50">{copy.localFileLabel}</p>
              <p className="mt-2 break-all font-data text-xs text-soft/65">{summary?.local_file ?? "-"}</p>
            </div>
          </aside>
        </div>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="dashboard" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}