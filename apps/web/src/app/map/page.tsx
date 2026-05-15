import Link from "next/link";

import { MapShell } from "@/components/MapShell";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { RiskBadge } from "@/components/RiskBadge";
import { getDashboardPayload } from "@/lib/api";
import { buildMunicipalitySnapshots, buildStationDetailHref } from "@/lib/editorial";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName } from "@/lib/presentation";

type MapPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const payload = await getDashboardPayload();
  const stations = payload.stations?.items ?? [];
  const latest = payload.latest?.items ?? [];
  const no2ByStation = new Map(
    latest
      .filter((item) => item.pollutant_code === "NO2")
      .map((item) => [item.station_id, item]),
  );
  const coordinatesReady = stations.filter((station) => station.latitude != null && station.longitude != null);
  const municipalitiesRepresented = new Set(
    coordinatesReady.map((station) => {
      const label = station.municipality ?? station.name;
      return label ? formatPlaceName(label) : station.station_id;
    }),
  ).size;
  const municipalityWatch = buildMunicipalitySnapshots(stations, latest).slice(0, 6);
  const pulseNodes = coordinatesReady
    .map((station) => {
      const observation = no2ByStation.get(station.station_id);
      if (!observation) {
        return null;
      }

      return {
        station_id: station.station_id,
        label: station.name ? formatPlaceName(station.name) : station.station_id,
        latitude: station.latitude as number,
        longitude: station.longitude as number,
        value: observation.value,
        risk_level: observation.risk_level,
        freshness: toFreshnessBucket(observation.measured_at),
        highlight: station.station_id === payload.summary?.worst_station_id,
      };
    })
    .filter((node): node is NonNullable<typeof node> => node !== null);
  const priorityStations = [...pulseNodes].sort((left, right) => right.value - left.value).slice(0, 6);
  const worstPulseNode = pulseNodes.find((n) => n.station_id === payload.summary?.worst_station_id) ?? null;
  const worstStationLabel = worstPulseNode?.label ?? payload.summary?.worst_station_id ?? "-";
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
        <PublicPageHeader language={language} pathname="/map" currentPage="map" labels={navigationLabels} />

        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.mapStatusTitle}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.mapPageTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.mapPageSubtitle}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-soft/58">{copy.mapStatusBody}</p>
          </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{copy.mapStationsReady}</p>
                <p className="mt-4 font-data text-3xl text-bone">{pulseNodes.length}</p>
                <p className="mt-3 text-sm text-soft/70">{language === "es" ? "Estaciones con lectura reciente listas para comparar." : "Stations with recent readings ready to compare."}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
                <p className="mt-4 font-data text-2xl text-bone">
                  {payload.summary?.latest_timestamp
                    ? new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "Europe/Madrid",
                      }).format(new Date(payload.summary.latest_timestamp))
                    : "-"}
                </p>
                <p className="mt-3 text-sm text-soft/70">{copy.freshness[payload.summary?.freshness ?? "unknown"] ?? copy.freshness.unknown}</p>
              </div>
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{copy.worstStation}</p>
                <p className="mt-4 font-data text-3xl text-bone">{worstStationLabel}</p>
                <p className="mt-3 text-sm text-soft/70">
                  {worstPulseNode ? `NO2 \u00b7 ${worstPulseNode.value.toFixed(1)} \u00b5g/m\u00b3` : "-"}
                </p>
              </div>
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{language === "es" ? "Cobertura territorial" : "Territorial coverage"}</p>
                <p className="mt-4 font-data text-3xl text-bone">{municipalitiesRepresented}</p>
                <p className="mt-3 text-sm text-soft/70">
                  {language === "es"
                    ? "Municipios con al menos una estación representada en el mapa actual."
                    : "Municipalities with at least one station represented in the current map."}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive map */}
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.mapRosterTitle}</p>
              <p className="font-data text-sm text-soft/55">
                {language === "es" ? "NO2 · lectura actual · toca un punto" : "NO2 · latest reading · tap a point"}
              </p>
            </div>
            <MapShell nodes={pulseNodes} language={language} />
          </section>

          {/* Below-map panels */}
          <section className="grid gap-6 xl:grid-cols-3">
            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-soft/60">{copy.mapPriorityStations}</p>
                <p className="font-data text-sm text-soft/55">
                  {copy.freshness[payload.summary?.freshness ?? "unknown"] ?? copy.freshness.unknown}
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {priorityStations.map((station) => {
                  const stationMeta = stations.find((item) => item.station_id === station.station_id);
                  return (
                    <Link
                      key={station.station_id}
                      href={buildStationDetailHref(language, station.station_id)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-bone">
                            {stationMeta?.name ? formatPlaceName(stationMeta.name) : stationMeta?.municipality ? formatPlaceName(stationMeta.municipality) : station.station_id}
                          </p>
                          <p className="mt-0.5 font-data text-xs text-soft/40">{station.station_id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="font-data text-xl text-bone">
                            {station.value.toFixed(1)}
                            <span className="ml-1 font-sans text-xs text-soft/50">µg/m³</span>
                          </p>
                          <RiskBadge riskLevel={station.risk_level} language={language} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-soft/60">{language === "es" ? "Municipios a comparar" : "Municipalities to compare"}</p>
                <p className="font-data text-sm text-soft/55">{municipalityWatch.length}</p>
              </div>
              <div className="mt-5 grid gap-3">
                {municipalityWatch.length > 0 ? (
                  municipalityWatch.map((municipality) => (
                    <Link
                      key={municipality.municipality}
                      href={buildStationDetailHref(language, municipality.stationId)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-soft/72">{formatPlaceName(municipality.municipality)}</p>
                          <p className="mt-1 font-data text-sm text-bone">{formatPlaceName(municipality.stationName)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="font-data text-xl text-bone">
                            {municipality.peakValue.toFixed(1)}
                            <span className="ml-1 font-sans text-xs text-soft/50">µg/m³</span>
                          </p>
                          <RiskBadge riskLevel={municipality.riskLevel ?? null} language={language} />
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-soft/55">
                        {language === "es"
                          ? `${municipality.stationCount} estación${municipality.stationCount === 1 ? "" : "es"} con señal`
                          : `${municipality.stationCount} active station${municipality.stationCount === 1 ? "" : "s"}`}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-soft/70">
                    {language === "es"
                      ? "Todavía no hay suficiente lectura reciente para comparar municipios con contexto territorial."
                      : "There is not enough recent signal yet to compare municipalities with territorial context."}
                  </div>
                )}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.mapLegendTitle}</p>
              <div className="mt-5 grid gap-4 text-sm text-soft/72">
                {/* Size legend */}
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-end gap-3">
                    <span className="inline-block rounded-full bg-white/30" style={{ width: 8, height: 8 }} />
                    <span className="inline-block rounded-full bg-white/30" style={{ width: 14, height: 14 }} />
                    <span className="inline-block rounded-full bg-white/30" style={{ width: 20, height: 20 }} />
                  </div>
                  {copy.mapNodeSize}
                </div>
                {/* Color legend */}
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {[
                      { color: "#80FFB2", label: language === "es" ? "Bueno" : "Good" },
                      { color: "#D8FF4F", label: language === "es" ? "Aceptable" : "Acceptable" },
                      { color: "#FFB000", label: language === "es" ? "Moderado" : "Moderate" },
                      { color: "#FF6B35", label: language === "es" ? "Malo" : "Poor" },
                      { color: "#C2410C", label: language === "es" ? "Muy malo" : "Unhealthy" },
                      { color: "#F43F5E", label: language === "es" ? "Peligroso" : "Hazardous" },
                    ].map(({ color, label }) => (
                      <span key={color} className="flex items-center gap-1 text-xs">
                        <span className="inline-block h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-soft/60">{label}</span>
                      </span>
                    ))}
                  </div>
                  {copy.mapNodeColor}
                </div>
                {/* Freshness legend */}
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full bg-white/90" />
                    <span className="inline-block h-3 w-3 rounded-full bg-white/50" />
                    <span className="inline-block h-3 w-3 rounded-full bg-white/20" />
                  </div>
                  {copy.mapNodeFreshness}
                </div>
              </div>
            </section>
          </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="map" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}

function toFreshnessBucket(measuredAt: string): "fresh" | "delayed" | "stale" | "unknown" {
  const timestamp = new Date(measuredAt);
  if (Number.isNaN(timestamp.getTime())) {
    return "unknown";
  }

  const ageHours = (Date.now() - timestamp.getTime()) / 3_600_000;
  if (ageHours < 3) {
    return "fresh";
  }
  if (ageHours < 12) {
    return "delayed";
  }
  return "stale";
}