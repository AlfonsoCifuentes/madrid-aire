import Link from "next/link";

import { AtmosphericField } from "@/components/AtmosphericField";
import { CinematicOverlay } from "@/components/CinematicOverlay";
import { IsobarLines } from "@/components/IsobarLines";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { PollutantGlow } from "@/components/PollutantGlow";
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
  const madridDateTimeFormatter = new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });
  const freshnessLabel = copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending;
  const latestTimestampValue = summary?.latest_timestamp
    ? madridDateTimeFormatter.format(new Date(summary.latest_timestamp))
    : "-";
  const worstStationId = summary?.worst_station_id ?? "-";
  const signalCopy = buildSignalCopy(
    Boolean(summary?.observations_ready),
    summary?.station_count ?? 0,
    summary?.pollutant_count ?? 0,
    freshnessLabel,
    copy,
  );
  const footerLinks = [
    { href: `/dashboard?lang=${language}`, label: copy.dashboardTitle },
    { href: `/map?lang=${language}`, label: copy.mapPageTitle },
    { href: `/stations?lang=${language}`, label: copy.stationsPageTitle },
    { href: `/predictions?lang=${language}`, label: copy.predictionsTitle },
    { href: `/methodology?lang=${language}`, label: copy.methodologyTitle },
    { href: `/about?lang=${language}`, label: copy.aboutTitle },
  ];

  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <CinematicOverlay className="absolute inset-0" />
        <AtmosphericField className="absolute inset-x-[-10%] top-[-8%] h-[70vh] opacity-60" />
        <IsobarLines className="absolute inset-0 opacity-45" />
        <NoiseOverlay className="absolute inset-0" />
        <PollutantGlow className="absolute left-[14%] top-[20%] h-64 w-64 animate-pulseSoft reduced-motion:animate-none" variant="lime" />
        <PollutantGlow className="absolute bottom-[16%] right-[12%] h-72 w-72 animate-float reduced-motion:animate-none" variant="alert" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-5 pb-16 pt-5 sm:px-7 lg:px-10 3xl:px-14">
        <header className="flex items-start justify-between gap-6">
          <a className="glass-panel rounded-full px-4 py-3 shadow-atmosphere" href="#build">
            <MadridAireWordmark className="items-center" size="compact" />
          </a>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 shadow-atmosphere">
              <span className="status-dot" />
              <span className="eyebrow text-soft/80">{copy.headerStatus}</span>
            </div>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/about?lang=${language}`}>
              {copy.openAbout}
            </Link>
            <LanguageSelector currentLanguage={language} pathname="/landing" />
          </div>
        </header>

        <div className="relative flex flex-1 flex-col justify-center py-12 lg:py-20">
          <div className="max-w-full">
            <p className="eyebrow mb-6 text-soft/70">{copy.heroEyebrow}</p>
            <MadridAireWordmark className="max-w-full" size="landing" />
            <p className="mt-8 max-w-2xl text-balance text-xl leading-8 text-soft/78 sm:text-2xl sm:leading-9 lg:text-[2rem] lg:leading-[1.35]">
              {copy.heroClaim}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-7 py-3 font-medium text-graphite transition hover:bg-[#ebff93]"
                href="#build"
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
            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.signalTitle}</p>
                <p className="mt-3 font-data text-2xl text-bone">{signalCopy.headline}</p>
                <p className="mt-3 text-sm leading-6 text-soft/68">
                  {summary?.observations_ready ? copy.signalReadyBody : signalCopy.body}
                </p>
              </div>
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.forecastPolicy}</p>
                <p className="mt-3 font-data text-2xl text-no2">NO2 · 24h</p>
                <p className="mt-3 text-sm leading-6 text-soft/68">{copy.forecastBody}</p>
              </div>
            </div>
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
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {copy.cycleFocus.map((item, index) => (
              <div key={item} className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/50">0{index + 1}</p>
                <p className="mt-6 text-lg leading-7 text-soft/84">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="overview" className="relative border-t border-white/8 px-5 py-16 sm:px-7 lg:px-10 3xl:px-14">
        <div className="mx-auto grid w-full max-w-[1800px] gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
          <div>
            <p className="eyebrow text-soft/55">{copy.landingMapPreviewEyebrow}</p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.mapPageTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-soft/74">{copy.mapPageSubtitle}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-7 py-3 font-medium text-graphite transition hover:bg-[#ebff93]"
                href={`/map?lang=${language}`}
              >
                {copy.openMap}
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/5 px-7 py-3 font-medium text-soft transition hover:bg-white/10"
                href={`/stations?lang=${language}`}
              >
                {copy.openStations}
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 p-5">
              <CinematicOverlay className="absolute inset-0" variant="panel" />
              <AtmosphericField className="absolute inset-0 opacity-35" />
              <IsobarLines className="absolute inset-0 opacity-10" />
              <NoiseOverlay className="absolute inset-0 opacity-60" />
              <PollutantGlow className="absolute left-[12%] top-[14%] h-36 w-36 opacity-55" variant="lime" />
              <PollutantGlow className="absolute bottom-[12%] right-[10%] h-32 w-32 opacity-45" variant="alert" />
              <PollutantGlow className="absolute right-[22%] top-[20%] h-24 w-24 opacity-40" variant="cool" />
              <div className="absolute left-[18%] top-[28%] h-5 w-5 rounded-full bg-[#f6ff9e] shadow-[0_0_36px_rgba(209,255,117,0.7)]" />
              <div className="absolute left-[35%] top-[54%] h-4 w-4 rounded-full bg-[#87f2ff] shadow-[0_0_28px_rgba(135,242,255,0.55)]" />
              <div className="absolute left-[52%] top-[35%] h-6 w-6 rounded-full bg-[#ff8c5f] shadow-[0_0_44px_rgba(255,140,95,0.7)]" />
              <div className="absolute left-[61%] top-[62%] h-4 w-4 rounded-full bg-[#b7ff80] shadow-[0_0_30px_rgba(183,255,128,0.6)]" />
              <div className="absolute left-[74%] top-[44%] h-5 w-5 rounded-full bg-[#ffd36b] shadow-[0_0_34px_rgba(255,211,107,0.6)]" />
              <div className="absolute inset-x-[12%] top-[18%] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
              <div className="absolute inset-x-[18%] bottom-[24%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <div className="absolute inset-y-[20%] left-[24%] w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />
              <div className="absolute inset-y-[14%] right-[18%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

              <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 backdrop-blur">
                  <p className="eyebrow text-soft/55">{copy.worstStation}</p>
                  <p className="mt-3 font-data text-xl text-bone">{worstStationId}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 backdrop-blur">
                  <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                  <p className="mt-3 font-data text-xl text-bone">{summary?.station_count ?? 0}</p>
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 backdrop-blur">
                  <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
                  <p className="mt-2 font-data text-lg text-bone">{summary?.pollutant_count ?? 0}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 backdrop-blur">
                  <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
                  <p className="mt-2 text-sm leading-6 text-soft/80">{latestTimestampValue}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 backdrop-blur">
                  <p className="eyebrow text-soft/55">{copy.mapMetadataStatus}</p>
                  <p className="mt-2 font-data text-lg text-bone">{freshnessLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-black/10 px-5 py-16 sm:px-7 lg:px-10 3xl:px-14">
        <div className="mx-auto grid w-full max-w-[1800px] gap-10 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
          <div>
            <p className="eyebrow text-soft/55">{copy.landingDeepDiveEyebrow}</p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.landingDeepDiveTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-soft/74">{copy.landingDeepDiveBody}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="glass-panel rounded-[1.9rem] p-6 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
              <h3 className="mt-4 max-w-[14ch] text-3xl font-medium tracking-[-0.03em] text-soft">{copy.modelTitle}</h3>
              <p className="mt-4 text-base leading-7 text-soft/74">{copy.modelSubtitle}</p>
              <Link
                className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                href={`/model?lang=${language}`}
              >
                {copy.openModel}
              </Link>
            </article>

            <article className="glass-panel rounded-[1.9rem] p-6 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
              <h3 className="mt-4 max-w-[14ch] text-3xl font-medium tracking-[-0.03em] text-soft">{copy.methodologyTitle}</h3>
              <p className="mt-4 text-base leading-7 text-soft/74">{copy.methodologySubtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                  href={`/methodology?lang=${language}`}
                >
                  {copy.openMethodology}
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                  href={`/about?lang=${language}`}
                >
                  {copy.openAbout}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/8 px-5 py-10 sm:px-7 lg:px-10 3xl:px-14">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <MadridAireWordmark size="compact" />
            <p className="mt-6 eyebrow text-soft/55">{copy.landingFooterTitle}</p>
            <p className="mt-3 text-base leading-7 text-soft/72">{copy.landingFooterBody}</p>
          </div>

          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={copy.mobileNavAriaLabel}>
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm text-soft/76 transition hover:bg-white/10"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}