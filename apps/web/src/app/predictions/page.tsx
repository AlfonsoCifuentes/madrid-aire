import Link from "next/link";

import { HistoryForecastChart } from "@/components/HistoryForecastChart";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload, getHistoryPayload, getPredictionsPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type PredictionsPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function PredictionsPage({ searchParams }: PredictionsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const stationId = dashboard.summary?.worst_station_id ?? dashboard.latest?.items.find((item) => item.pollutant_code === "NO2")?.station_id;
  const [history, predictions] = stationId
    ? await Promise.all([getHistoryPayload(stationId, "NO2", 24), getPredictionsPayload(stationId)])
    : [null, null];
  const observed = (history?.items ?? []).map((item) => ({ timestamp: item.measured_at, value: item.value }));
  const predicted = (predictions?.items ?? []).map((item) => ({ timestamp: item.predicted_for, value: item.predicted_value }));
  const maxPredicted = predicted.length > 0 ? Math.max(...predicted.map((item) => item.value)) : null;
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/dashboard?lang=${language}`}>
              {copy.dashboardTitle}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/stations?lang=${language}`}>
              {copy.openStations}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/model?lang=${language}`}>
              {copy.openModel}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/system?lang=${language}`}>
              {copy.openSystem}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/predictions" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.forecastPolicy}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.predictionsTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.predictionsSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.worstStation}</p>
              <p className="mt-4 font-data text-3xl text-bone">{stationId ?? "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{predictions?.items[0]?.baseline_name ?? "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">24h</p>
              <p className="mt-3 text-sm text-soft/70">max {maxPredicted == null ? "-" : maxPredicted.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow text-soft/60">{copy.historyLabel}</p>
            <p className="font-data text-sm text-soft/55">NO2 · 24h observed + 24h predicted</p>
          </div>
          <div className="mt-5">
            <HistoryForecastChart observed={observed} predicted={predicted} observedLabel={copy.observedLabel} predictedLabel={copy.predictedLabel} />
          </div>
          <p className="mt-5 text-sm leading-6 text-soft/70">{copy.notOfficialForecast}</p>
        </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="predictions" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}
