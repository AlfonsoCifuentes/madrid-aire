import Link from "next/link";

import { AtmosphericField } from "@/components/AtmosphericField";
import { AtmosphericMiniMap } from "@/components/AtmosphericMiniMap";
import { CinematicOverlay } from "@/components/CinematicOverlay";
import { IsobarLines } from "@/components/IsobarLines";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { PollutantGlow } from "@/components/PollutantGlow";
import { RiskBadge } from "@/components/RiskBadge";
import { ScrollCue } from "@/components/ScrollCue";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload, type LatestObservationItem, type StationSummary } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName, getPublicRiskScale } from "@/lib/presentation";

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

function buildLandingMapNodes(
  stations: StationSummary[],
  latestItems: LatestObservationItem[],
  worstStationId: string | null,
) {
  const no2Map = new Map<string, LatestObservationItem>();

  for (const item of latestItems) {
    if (item.pollutant_code === "NO2" && item.valid !== false) {
      const existing = no2Map.get(item.station_id);
      if (!existing || item.measured_at > existing.measured_at) {
        no2Map.set(item.station_id, item);
      }
    }
  }

  const now = Date.now();

  return stations
    .filter(
      (station): station is StationSummary & { latitude: number; longitude: number } =>
        station.latitude != null && station.longitude != null,
    )
    .map((station) => {
      const observation = no2Map.get(station.station_id);
      let freshness: "fresh" | "delayed" | "stale" | "unknown" = "unknown";

      if (observation) {
        const ageHours = (now - new Date(observation.measured_at).getTime()) / (1000 * 3600);
        freshness = ageHours < 2 ? "fresh" : ageHours < 8 ? "delayed" : "stale";
      }

      return {
        station_id: station.station_id,
        label: station.name ? formatPlaceName(station.name) : station.station_id,
        latitude: station.latitude,
        longitude: station.longitude,
        value: observation?.value ?? 0,
        risk_level: observation?.risk_level ?? null,
        freshness,
        highlight: station.station_id === worstStationId,
      };
    });
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const summary = dashboard.summary;
  const stations = dashboard.stations?.items ?? [];
  const madridDateTimeFormatter = new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });
  const freshnessLabel = copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending;
  const latestTimestampValue = summary?.latest_timestamp
    ? madridDateTimeFormatter.format(new Date(summary.latest_timestamp))
    : "-";
  const worstStationName = (() => {
    if (!summary?.worst_station_id) return "-";
    const found = stations.find((s) => s.station_id === summary.worst_station_id);
    if (found?.name) return formatPlaceName(found.name);
    if (found?.municipality) return formatPlaceName(found.municipality);
    return summary.worst_station_id;
  })();
  const latestItems = dashboard.latest?.items ?? [];
  const landingMapNodes = buildLandingMapNodes(stations, latestItems, summary?.worst_station_id ?? null);
  const worstRiskLevel = summary?.worst_station_id
    ? latestItems.find(
        (item) => item.station_id === summary.worst_station_id && item.pollutant_code === "NO2",
      )?.risk_level ?? null
    : null;
  const locale = language === "es" ? "es-ES" : "en-GB";
  const signalCopy = buildSignalCopy(
    Boolean(summary?.observations_ready),
    summary?.station_count ?? 0,
    summary?.pollutant_count ?? 0,
    freshnessLabel,
    copy,
  );
  const publicRoutes = [
    { href: `/dashboard?lang=${language}`, title: copy.dashboardTitle, description: copy.aboutDashboardDesc },
    { href: `/map?lang=${language}`, title: copy.mapPageTitle, description: copy.aboutMapDesc },
    { href: `/stations?lang=${language}`, title: copy.stationsPageTitle, description: copy.aboutStationsDesc },
    { href: `/predictions?lang=${language}`, title: copy.predictionsTitle, description: copy.aboutPredictionsDesc },
  ];
  const footerLinks = [
    { href: `/dashboard?lang=${language}`, label: copy.dashboardTitle },
    { href: `/map?lang=${language}`, label: copy.mapPageTitle },
    { href: `/stations?lang=${language}`, label: copy.stationsPageTitle },
    { href: `/predictions?lang=${language}`, label: copy.predictionsTitle },
    { href: `/about?lang=${language}`, label: copy.aboutTitle },
    { href: `/about?lang=${language}#advanced`, label: copy.aboutTechnicalLabel },
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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <a className="glass-panel rounded-full px-4 py-3 shadow-atmosphere" href="#build">
            <MadridAireWordmark className="items-center" size="compact" />
          </a>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
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
          <div className="max-w-[72rem]">
            <p className="eyebrow mb-6 text-soft/70">{copy.heroEyebrow}</p>
            <div className="max-w-[min(100%,66rem)] pb-2">
              <MadridAireWordmark className="max-w-full" size="landing" />
            </div>
            <p className="mt-8 max-w-2xl text-balance text-xl leading-8 text-soft/78 sm:text-2xl sm:leading-9 lg:text-[2rem] lg:leading-[1.35]">
              {copy.heroClaim}
            </p>
            <div className="mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-7 py-3 font-medium text-graphite transition hover:bg-[#ebff93]"
                href={`/dashboard?lang=${language}`}
              >
                {copy.heroCtaPrimary}
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/5 px-7 py-3 font-medium text-soft transition hover:bg-white/10"
                href={`/map?lang=${language}`}
              >
                {copy.heroCtaSecondary}
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-soft/68">
              <Link className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 transition hover:bg-white/[0.08] hover:text-soft" href={`/about?lang=${language}`}>
                {copy.openAbout}
              </Link>
              <Link className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 transition hover:bg-white/[0.08] hover:text-soft" href={`/about?lang=${language}#advanced`}>
                {copy.aboutTechnicalLabel}
              </Link>
            </div>
            <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.signalTitle}</p>
                <p className="mt-3 font-data text-2xl text-bone">{signalCopy.headline}</p>
                {summary?.observations_ready && summary.worst_station_id ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-bone">{worstStationName}</span>
                      {worstRiskLevel && <RiskBadge riskLevel={worstRiskLevel} language={language} />}
                    </div>
                    {summary.worst_value != null && (
                      <p className="font-data text-xs text-soft/50">
                        NO2 · {summary.worst_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-soft/68">{signalCopy.body}</p>
                )}
              </div>
              <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/60">{copy.forecastPolicy}</p>
                <p className="mt-3 font-data text-2xl text-no2">NO2 · 24h</p>
                <p className="mt-3 text-sm leading-6 text-soft/68">{copy.forecastBody}</p>
              </div>
            </div>
            {/* Risk scale bar */}
            <div className="mt-6 max-w-3xl">
              <p className="eyebrow mb-3 text-soft/50">{language === "es" ? "Escala de riesgo NO2" : "NO2 risk scale"}</p>
              <div className="flex flex-wrap gap-2">
                {getPublicRiskScale(language).map(({ color, label, range }) => (
                  <div key={color} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-soft/80">{label}</span>
                    <span className="font-data text-[10px] text-soft/40">{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-2 pt-8">
          <ScrollCue targetId="build" />
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

          <div className="glass-panel rounded-[2rem] p-2 shadow-atmosphere">
            <div className="relative min-h-[380px] overflow-hidden rounded-[1.75rem] border border-white/10">
              {/* Full-bleed dark map — no decorative overlays so tiles are visible */}
              <AtmosphericMiniMap nodes={landingMapNodes} className="pointer-events-none absolute inset-0 h-full w-full" />
              {/* Minimal scrim for card readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />

              {/* Top stat cards */}
              <div className="absolute inset-x-4 top-4 z-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{copy.worstStation}</p>
                  <p className="mt-3 font-data text-xl text-bone">{worstStationName}</p>
                  {summary?.worst_value != null && (
                    <p className="mt-2 font-data text-xs text-soft/60">NO2 · {summary.worst_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³</p>
                  )}
                  {worstRiskLevel && (
                    <div className="mt-3">
                      <RiskBadge riskLevel={worstRiskLevel} language={language} />
                    </div>
                  )}
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                  <p className="mt-3 font-data text-xl text-bone">{summary?.station_count ?? 0}</p>
                  <p className="mt-2 text-xs text-soft/60">
                    {summary?.pollutant_count ?? 0} {copy.pollutantCoverage.toLowerCase()} · {freshnessLabel}
                  </p>
                </div>
              </div>

              {/* Bottom stat row */}
              <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
                  <p className="mt-2 font-data text-lg text-bone">{summary?.pollutant_count ?? 0}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
                  <p className="mt-2 text-sm leading-6 text-soft/80">{latestTimestampValue}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/50 p-4 backdrop-blur-md">
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
            {publicRoutes.map((route) => (
              <article key={route.href} className="glass-panel rounded-[1.9rem] p-6 shadow-atmosphere transition hover:bg-white/10">
                <p className="eyebrow text-soft/55">{copy.aboutLiveLabel}</p>
                <h3 className="mt-4 max-w-[14ch] text-3xl font-medium tracking-[-0.03em] text-soft">{route.title}</h3>
                <p className="mt-4 text-base leading-7 text-soft/74">{route.description}</p>
                <Link
                  className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                  href={route.href}
                >
                  {route.title}
                </Link>
              </article>
            ))}
            <article className="glass-panel rounded-[1.9rem] border border-white/10 p-6 shadow-atmosphere lg:col-span-2">
              <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
              <h3 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-soft">{copy.aboutTitle}</h3>
              <p className="mt-4 text-base leading-7 text-soft/74">{copy.aboutTechnicalRoutesBody}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                  href={`/about?lang=${language}`}
                >
                  {copy.openAbout}
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-5 py-2.5 font-medium text-soft transition hover:bg-white/10"
                  href={`/about?lang=${language}#advanced`}
                >
                  {copy.aboutTechnicalLabel}
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