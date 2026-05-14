import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { StationPulseField } from "@/components/StationPulseField";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
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
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "map", href: `/map?lang=${language}`, label: copy.mobileNavMap },
    { key: "stations", href: `/stations?lang=${language}`, label: copy.mobileNavStations },
    { key: "predictions", href: `/predictions?lang=${language}`, label: copy.mobileNavPredictions },
    { key: "about", href: `/about?lang=${language}`, label: copy.mobileNavAbout },
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/about?lang=${language}`}>
              {copy.openAbout}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/map" />
          </div>
        </header>

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
              <p className="mt-4 font-data text-3xl text-bone">{stations.length}</p>
              <p className="mt-3 text-sm text-soft/70">{copy.pendingCoords}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.mapCoordinatesReady}</p>
              <p className="mt-4 font-data text-3xl text-bone">{coordinatesReady.length}</p>
              <p className="mt-3 text-sm text-soft/70">{copy.freshness[payload.summary?.freshness ?? "unknown"] ?? copy.freshness.unknown}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere md:col-span-2">
              <p className="eyebrow text-soft/55">{copy.worstStation}</p>
              <p className="mt-4 font-data text-2xl text-bone">{payload.summary?.worst_station_id ?? "-"}</p>
              <p className="mt-3 text-sm text-soft/70">{priorityStations[0] ? `${priorityStations[0].label} · ${priorityStations[0].value.toFixed(1)}` : "-"}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.mapRosterTitle}</p>
              <p className="font-data text-sm text-soft/55">{language === "es" ? "NO2 · lectura actual · nivel" : "NO2 · latest reading · level"}</p>
            </div>
            <div className="mt-5">
              <StationPulseField nodes={pulseNodes} />
            </div>
          </div>

          <div className="grid gap-6">
            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.mapLegendTitle}</p>
              <div className="mt-5 grid gap-4 text-sm text-soft/72">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeSize}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeColor}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">{copy.mapNodeFreshness}</div>
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-soft/60">{copy.mapPriorityStations}</p>
                <p className="font-data text-sm text-soft/55">{copy.freshness[payload.summary?.freshness ?? "unknown"] ?? copy.freshness.unknown}</p>
              </div>
              <div className="mt-5 grid gap-3">
                {priorityStations.map((station) => {
                  const stationMeta = stations.find((item) => item.station_id === station.station_id);
                  return (
                    <div key={station.station_id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-data text-sm text-bone">{station.station_id}</p>
                          <p className="mt-2 text-sm text-soft/74">{stationMeta?.name ?? stationMeta?.municipality ?? station.station_id}</p>
                        </div>
                        <p className="font-data text-xl text-bone">{station.value.toFixed(1)}</p>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-soft/55">{station.risk_level ?? "unknown"}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.mapStationContext}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {stations.slice(0, 6).map((station) => (
                  <div key={station.station_id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-data text-sm text-bone">{station.station_id}</p>
                    <p className="mt-2 text-sm text-soft/74">{station.name ?? station.municipality ?? station.station_id}</p>
                    <p className="mt-3 text-sm text-soft/62">{station.postal_address ?? station.zone_description ?? station.metadata_status}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
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