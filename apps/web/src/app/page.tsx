import Link from "next/link";

import { AtmosphericField } from "@/components/AtmosphericField";
import { AtmosphericMiniMap } from "@/components/AtmosphericMiniMap";
import { CinematicOverlay } from "@/components/CinematicOverlay";
import { IsobarLines } from "@/components/IsobarLines";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { PollutantGlow } from "@/components/PollutantGlow";
import { RiskBadge } from "@/components/RiskBadge";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload, type LatestObservationItem, type StationSummary } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName } from "@/lib/presentation";

type HomePageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function buildHomeMapNodes(
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const summary = dashboard.summary;
  const stations = dashboard.stations?.items ?? [];
  const latestItems = dashboard.latest?.items ?? [];
  const locale = language === "es" ? "es-ES" : "en-GB";
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });
  const landingCopy = language === "es"
    ? {
        eyebrow: "Inicio",
        claim: "Una portada limpia para entrar rápido a la situación actual, el mapa, las estaciones y el pronóstico sin perderte en explicaciones técnicas.",
        support: "Consulta primero el resumen, abre el mapa si quieres comparar zonas y entra en estaciones o pronóstico cuando ya sepas qué punto te interesa.",
        liveLabel: "Red pública activa",
        latestLabel: "Última actualización",
        mapLabel: "Vista general",
        quickLinksTitle: "Accesos directos",
        quickLinksBody: "Cinco rutas claras. Sin menús densos ni contenido duplicado.",
        openGuide: "Cómo leer la web",
        openGuideBody: "Guía breve para entender niveles, tiempos y contexto sin entrar en la parte interna.",
      }
    : {
        eyebrow: "Home",
        claim: "A clean front page to reach the current summary, the map, stations, and the forecast without getting lost in technical explanation.",
        support: "Start with the overview, open the map to compare areas, and move into stations or forecast once you know which place matters to you.",
        liveLabel: "Public network live",
        latestLabel: "Latest update",
        mapLabel: "Overview map",
        quickLinksTitle: "Direct routes",
        quickLinksBody: "Five clear routes. No dense menus and no duplicated content.",
        openGuide: "How to read the site",
        openGuideBody: "A short guide to levels, timing, and context without getting into the internal layer.",
      };
  const latestTimestampValue = summary?.latest_timestamp
    ? formatter.format(new Date(summary.latest_timestamp))
    : "-";
  const worstStation = stations.find((item) => item.station_id === summary?.worst_station_id) ?? null;
  const worstNo2 = latestItems.find(
    (item) => item.station_id === summary?.worst_station_id && item.pollutant_code === "NO2",
  ) ?? null;
  const homeMapNodes = buildHomeMapNodes(stations, latestItems, summary?.worst_station_id ?? null);
  const routeCards = [
    {
      href: `/dashboard?lang=${language}`,
      title: copy.dashboardTitle,
      description: language === "es" ? "Qué está pasando ahora, explicado de forma rápida." : "What is happening right now, explained quickly.",
    },
    {
      href: `/map?lang=${language}`,
      title: copy.mapPageTitle,
      description: language === "es" ? "Comparar zonas y abrir un punto concreto del mapa." : "Compare areas and open a specific point on the map.",
    },
    {
      href: `/stations?lang=${language}`,
      title: copy.stationsPageTitle,
      description: language === "es" ? "Encontrar una estación y ver su contexto en detalle." : "Find a station and inspect its context in detail.",
    },
    {
      href: `/predictions?lang=${language}`,
      title: copy.predictionsTitle,
      description: language === "es" ? "Orientación a 24 horas para planificar mejor." : "A 24-hour outlook to help you plan ahead.",
    },
    {
      href: `/about?lang=${language}`,
      title: copy.openAbout,
      description: landingCopy.openGuideBody,
    },
  ];

  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <CinematicOverlay className="absolute inset-0" />
        <AtmosphericField className="absolute inset-x-[-10%] top-[-8%] h-[72vh] opacity-55" />
        <IsobarLines className="absolute inset-0 opacity-40" />
        <NoiseOverlay className="absolute inset-0" />
        <PollutantGlow className="absolute left-[10%] top-[16%] h-56 w-56 animate-pulseSoft reduced-motion:animate-none" variant="lime" />
        <PollutantGlow className="absolute bottom-[14%] right-[10%] h-72 w-72 animate-float reduced-motion:animate-none" variant="alert" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-5 pb-12 pt-5 sm:px-7 lg:px-10 3xl:px-14">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="glass-panel rounded-full px-4 py-3 shadow-atmosphere">
            <MadridAireWordmark className="items-center" size="compact" />
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 shadow-atmosphere">
              <span className="status-dot" />
              <span className="eyebrow text-soft/80">{landingCopy.liveLabel}</span>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/" />
          </div>
        </header>

        <div className="grid flex-1 gap-10 py-12">
          <div className="max-w-3xl xl:pr-6">
            <p className="eyebrow mb-6 text-soft/68">{landingCopy.eyebrow}</p>
            <h1 className="sr-only">{language === "es" ? "Madrid Aire, inicio" : "Madrid Aire home"}</h1>
            <div className="max-w-full pb-2">
              <MadridAireWordmark className="max-w-full" size="landing" />
            </div>
            <p className="mt-8 max-w-2xl text-balance text-xl leading-8 text-soft/82 sm:text-2xl sm:leading-9 lg:text-[2rem] lg:leading-[1.34]">
              {landingCopy.claim}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-soft/68 sm:text-lg sm:leading-8">
              {landingCopy.support}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime px-7 py-3 font-medium text-graphite transition hover:bg-[#ebff93]"
                href={`/dashboard?lang=${language}`}
              >
                {copy.dashboardTitle}
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/5 px-7 py-3 font-medium text-soft transition hover:bg-white/10"
                href={`/map?lang=${language}`}
              >
                {copy.mapPageTitle}
              </Link>
            </div>
          </div>

          <div className="glass-panel max-w-[1120px] rounded-[2.2rem] p-2 shadow-atmosphere">
            <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/40">
              <AtmosphericMiniMap nodes={homeMapNodes} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,11,0.16),rgba(6,8,11,0.34)_38%,rgba(6,8,11,0.72))]" />

              <div className="absolute inset-x-5 top-5 z-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(4,6,8,0.74)] p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{landingCopy.latestLabel}</p>
                  <p className="mt-3 text-sm leading-6 text-bone">{latestTimestampValue}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(4,6,8,0.74)] p-4 backdrop-blur-md">
                  <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                  <p className="mt-3 font-data text-2xl text-bone">{summary?.station_count ?? 0}</p>
                  <p className="mt-2 text-xs text-soft/62">
                    {summary?.pollutant_count ?? 0} {copy.pollutantCoverage.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="absolute inset-x-5 bottom-5 z-10 rounded-[1.75rem] border border-white/10 bg-[rgba(4,6,8,0.76)] p-5 backdrop-blur-md">
                <p className="eyebrow text-soft/55">{landingCopy.mapLabel}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-2xl font-medium tracking-[-0.03em] text-bone">
                      {worstStation?.name
                        ? formatPlaceName(worstStation.name)
                        : worstStation?.municipality
                        ? formatPlaceName(worstStation.municipality)
                        : language === "es"
                        ? "Sin estación destacada"
                        : "No highlighted station"}
                    </p>
                    <p className="mt-2 font-data text-sm text-soft/60">
                      NO2 · {worstNo2?.value == null ? "-" : worstNo2.value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³
                    </p>
                  </div>
                  {worstNo2?.risk_level ? <RiskBadge riskLevel={worstNo2.risk_level} language={language} /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="border-t border-white/8 pt-8">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-soft/55">{landingCopy.quickLinksTitle}</p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-soft/68">{landingCopy.quickLinksBody}</p>
            </div>
            <Link className="text-sm text-lime/78 transition hover:text-lime" href={`/about?lang=${language}`}>
              {landingCopy.openGuide}
            </Link>
          </div>

          <nav className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" aria-label={copy.mobileNavAriaLabel}>
            {routeCards.map((card) => (
              <Link
                key={card.href}
                className="group rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-lime/35 hover:bg-white/[0.07]"
                href={card.href}
              >
                <p className="eyebrow text-soft/50">{card.title}</p>
                <p className="mt-4 text-base leading-7 text-soft/78">{card.description}</p>
                <p className="mt-6 text-sm text-lime/72 transition group-hover:text-lime">
                  {language === "es" ? "Abrir ruta →" : "Open route →"}
                </p>
              </Link>
            ))}
          </nav>
        </section>
      </section>
    </main>
  );
}

