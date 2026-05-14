import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type StationsPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

type FreshnessKey = "fresh" | "delayed" | "stale" | "unknown";

function toFreshnessBucket(measuredAt: string | null | undefined): FreshnessKey {
  if (!measuredAt) {
    return "unknown";
  }

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

export default async function StationsPage({ searchParams }: StationsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const payload = await getDashboardPayload();
  const locale = language === "es" ? "es-ES" : "en-GB";
  const stations = payload.stations?.items ?? [];
  const latest = payload.latest?.items ?? [];
  const no2ByStation = new Map(
    latest.filter((item) => item.pollutant_code === "NO2").map((item) => [item.station_id, item]),
  );
  const rows = stations
    .map((station) => {
      const no2 = no2ByStation.get(station.station_id) ?? null;
      return {
        station,
        no2,
        freshnessKey: toFreshnessBucket(no2?.measured_at),
      };
    })
    .sort((left, right) => (right.no2?.value ?? -1) - (left.no2?.value ?? -1));
  const coordinatesReady = stations.filter((station) => station.latitude != null && station.longitude != null).length;
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/map?lang=${language}`}>
              {copy.openMap}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/about?lang=${language}`}>
              {copy.openAbout}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/stations" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.openStations}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.stationsPageTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.stationsPageSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{stations.length}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.mapCoordinatesReady}</p>
              <p className="mt-4 font-data text-3xl text-bone">{coordinatesReady}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.worstStation}</p>
              <p className="mt-4 font-data text-3xl text-bone">{payload.summary?.worst_station_id ?? "-"}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 lg:hidden">
          {rows.map(({ station, no2, freshnessKey }) => (
            <Link
              key={station.station_id}
              className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere transition hover:bg-white/10"
              href={`/stations/${station.station_id}?lang=${language}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-data text-sm text-bone">{station.station_id}</p>
                  <p className="mt-2 text-lg text-soft">{station.name ?? station.municipality ?? station.station_id}</p>
                </div>
                <p className="font-data text-2xl text-bone">{no2?.value == null ? "-" : no2.value.toLocaleString(locale, { maximumFractionDigits: 1 })}</p>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-soft/68">
                <p>{station.municipality ?? "-"}</p>
                <p>{station.area_type ?? "-"} · {station.station_type ?? "-"}</p>
                <p>{copy.stationsTableFreshness}: {copy.freshness[freshnessKey]}</p>
                <p className="eyebrow text-soft/52">{copy.stationsOpenDetail}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="hidden lg:block">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-atmosphere">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.tableStation}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsTableMunicipality}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsTableAreaType}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsTableStationType}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsTableLatestNo2}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsTableFreshness}</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.stationsOpenDetail}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ station, no2, freshnessKey }) => (
                  <tr key={station.station_id} className="border-b border-white/6 last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="font-data text-sm text-bone">{station.station_id}</p>
                      <p className="mt-2 text-sm text-soft/72">{station.name ?? station.municipality ?? station.station_id}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-soft/76">{station.municipality ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-soft/76">{station.area_type ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-soft/76">{station.station_type ?? "-"}</td>
                    <td className="px-5 py-4 font-data text-sm text-bone">
                      {no2?.value == null ? "-" : no2.value.toLocaleString(locale, { maximumFractionDigits: 1 })}
                    </td>
                    <td className="px-5 py-4 text-sm text-soft/76">{copy.freshness[freshnessKey]}</td>
                    <td className="px-5 py-4">
                      <Link className="font-data text-sm text-lime" href={`/stations/${station.station_id}?lang=${language}`}>
                        {copy.stationsOpenDetail}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="stations" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}
