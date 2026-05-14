import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type LandingPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function buildSignalCopy(
  observationsReady: boolean,
  stationCount: number,
  pollutantCount: number,
  freshnessLabel: string,
  copy: (typeof copyByLanguage)["es"],
) {
  if (!observationsReady) {
    return {
      headline: copy.signalPending,
      body: copy.signalPendingBody,
    };
  }

  return {
    headline: `${stationCount} · ${copy.stationsOnline}`,
    body: `${pollutantCount} · ${copy.pollutantCoverage.toLowerCase()} · ${freshnessLabel}`,
  };
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const summary = dashboard.summary;
  const workspaceBuild = new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());
  const freshnessLabel = copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending;
  const signalCopy = buildSignalCopy(
    Boolean(summary?.observations_ready),
    summary?.station_count ?? 0,
    summary?.pollutant_count ?? 0,
    freshnessLabel,
    copy,
  );
  const metricCards = summary?.observations_ready
    ? [
        `${copy.worstStation}: ${summary?.worst_station_id ?? "-"}`,
        `${copy.latestTimestamp}: ${summary?.latest_timestamp ? new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Europe/Madrid",
        }).format(new Date(summary.latest_timestamp)) : "-"}`,
        `${copy.pollutantCoverage}: ${summary?.pollutant_count ?? 0}`,
      ]
    : copy.principles;

  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,176,0,0.12),transparent_0_20%),linear-gradient(180deg,rgba(8,10,12,0),rgba(8,10,12,0.9))]" />
        <div className="atmosphere-grid absolute inset-x-[-10%] top-[-8%] h-[70vh] opacity-60" />
        <div className="atmosphere-isobars absolute inset-0 opacity-45 animate-drift reduced-motion:animate-none" />
        <div className="noise-layer absolute inset-0" />
        <div className="absolute left-[14%] top-[20%] h-64 w-64 rounded-full bg-halo blur-3xl animate-pulseSoft reduced-motion:animate-none" />
        <div className="absolute bottom-[16%] right-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(198,11,30,0.18),rgba(198,11,30,0))] blur-3xl animate-float reduced-motion:animate-none" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-5 pb-8 pt-5 sm:px-7 lg:px-10 3xl:px-14">
        <header className="flex items-start justify-between gap-6">
          <a className="glass-panel rounded-full px-4 py-3 shadow-atmosphere" href="#signal">
            <MadridAireWordmark className="items-center" size="compact" />
          </a>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 shadow-atmosphere">
              <span className="status-dot" />
              <span className="eyebrow text-soft/80">{copy.headerStatus}</span>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/landing" />
          </div>
        </header>

        <div className="relative flex flex-1 flex-col justify-center py-12 lg:py-20">
          <div className="grid gap-14 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:gap-10">
            <div className="max-w-[980px]">
              <p className="eyebrow mb-6 text-soft/70">{copy.heroEyebrow}</p>
              <MadridAireWordmark size="hero" />
              <p className="mt-8 max-w-2xl text-balance text-xl leading-8 text-soft/78 sm:text-2xl sm:leading-9 lg:text-[2rem] lg:leading-[1.35]">
                {copy.heroClaim}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-7 py-3 font-medium text-graphite transition hover:bg-[#ebff93]"
                  href="#signal"
                >
                  {copy.heroCtaPrimary}
                </a>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/5 px-7 py-3 font-medium text-soft transition hover:bg-white/10"
                  href={`/dashboard?lang=${language}`}
                >
                  {copy.heroCtaSecondary}
                </Link>
              </div>
            </div>

            <aside className="grid gap-4 self-end xl:pb-12">
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.signalTitle}</p>
                <p className="mt-3 font-data text-3xl text-bone">{signalCopy.headline}</p>
                <p className="mt-3 max-w-[28ch] text-sm leading-6 text-soft/68">
                  {summary?.observations_ready ? copy.signalReadyBody : signalCopy.body}
                </p>
              </div>
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.forecastPolicy}</p>
                <p className="mt-3 font-data text-2xl text-no2">NO2 · 24h</p>
                <p className="mt-3 text-sm leading-6 text-soft/68">{copy.forecastBody}</p>
              </div>
            </aside>
          </div>
        </div>

        <div className="grid gap-4 pb-3 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr]">
          <div id="signal" className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.currentSignal}</p>
              <p className="font-data text-sm text-soft/55">{copy.noSyntheticMetrics}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {metricCards.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                  <p className="eyebrow text-soft/55">{copy.constraintLabel}</p>
                  <p className="mt-4 text-base leading-7 text-soft/82">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.workspaceBuild}</p>
              <p className="font-data text-sm text-soft/55">UTC</p>
            </div>
            <p className="mt-4 font-data text-2xl text-bone">{workspaceBuild}</p>
            <p className="mt-4 text-sm leading-6 text-soft/68">
              {copy.buildTimestampBody}
            </p>
          </div>
        </div>
      </section>

      <section id="build" className="relative border-t border-white/8 bg-black/10 px-5 py-16 sm:px-7 lg:px-10 3xl:px-14">
        <div className="mx-auto grid w-full max-w-[1800px] gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div>
            <p className="eyebrow text-soft/55">{copy.cycleLabel}</p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.cycleTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {copy.cycleFocus.map((item, index) => (
              <div key={item} className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/50">0{index + 1}</p>
                <p className="mt-6 text-lg leading-7 text-soft/84">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}