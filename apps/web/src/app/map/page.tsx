import { MapShell } from "@/components/MapShell";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

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
  const pulseNodes = coordinatesReady
    .map((station) => {
      const observation = no2ByStation.get(station.station_id);
      if (!observation) {
        return null;
      }

      return {
        station_id: station.station_id,
        label: station.name ?? station.station_id,
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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
              <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere md:col-span-2">
                <p className="eyebrow text-soft/55">{copy.worstStation}</p>
                <p className="mt-4 font-data text-3xl text-bone">{payload.summary?.worst_station_id ?? "-"}</p>
                <p className="mt-3 text-sm text-soft/70">{priorityStations[0] ? `${priorityStations[0].label} · ${priorityStations[0].value.toFixed(1)}` : "-"}</p>
              </div>
            </div>
          </div>

          {/* Interactive MapLibre GL map */}
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
          <section className="grid gap-6 xl:grid-cols-2">
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
                    <div key={station.station_id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-data text-sm text-bone">{station.station_id}</p>
                          <p className="mt-2 text-sm text-soft/74">
                            {stationMeta?.name ?? stationMeta?.municipality ?? station.station_id}
                          </p>
                        </div>
                        <p className="font-data text-xl text-bone">{station.value.toFixed(1)}</p>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-soft/55">
                        {station.risk_level ?? "unknown"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.mapLegendTitle}</p>
              <div className="mt-5 grid gap-4 text-sm text-soft/72">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeSize}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeColor}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeFreshness}</div>
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