import Link from "next/link";

import { FreshnessIndicator } from "@/components/FreshnessIndicator";
import { RiskBadge } from "@/components/RiskBadge";
import { HistoryForecastChart } from "@/components/HistoryForecastChart";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { ObservationTable } from "@/components/ObservationTable";
import { type StationPulseNode } from "@/components/StationPulseField";
import { AtmosphericMiniMap } from "@/components/AtmosphericMiniMap";
import { getDashboardPayload, getHistoryPayload, getSystemStatusPayload } from "@/lib/api";
import type { LatestObservationItem, StationSummary } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName } from "@/lib/presentation";

type DashboardPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function buildStationNodes(
  stations: StationSummary[],
  latestItems: LatestObservationItem[],
  worstStationId: string | null,
): StationPulseNode[] {
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
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => {
      const obs = no2Map.get(s.station_id);
      let freshness: StationPulseNode["freshness"] = "unknown";
      if (obs) {
        const ageH = (now - new Date(obs.measured_at).getTime()) / (1000 * 3600);
        freshness = ageH < 2 ? "fresh" : ageH < 8 ? "delayed" : "stale";
      }
      return {
        station_id: s.station_id,
        label: s.name ?? s.station_id,
        latitude: s.latitude!,
        longitude: s.longitude!,
        value: obs?.value ?? 0,
        risk_level: obs?.risk_level ?? null,
        freshness,
        highlight: s.station_id === worstStationId,
      };
    });
}

function resolveModelName(value: string | null | undefined, language: "es" | "en") {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("hist_gradient_boosting")) {
    return language === "es" ? "Modelo NO2 v1" : "NO2 model v1";
  }
  return value?.replaceAll("_", " ") || "-";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const [payload, system] = await Promise.all([getDashboardPayload(), getSystemStatusPayload()]);
  const summary = payload.summary;
  const latest = payload.latest?.items ?? [];
  const stations = payload.stations?.items ?? [];
  const worstStationId = summary?.worst_station_id ?? null;
  const worstStationName = (() => {
    if (!worstStationId) return null;
    const found = stations.find((s) => s.station_id === worstStationId);
    if (found?.name) return formatPlaceName(found.name);
    if (found?.municipality) return formatPlaceName(found.municipality);
    return worstStationId;
  })();
  const worstRiskLevel = summary?.worst_risk_level
    ?? (worstStationId
      ? latest.find((item) => item.station_id === worstStationId && item.pollutant_code === "NO2")?.risk_level ?? null
      : null);
  const history = worstStationId ? await getHistoryPayload(worstStationId, "NO2", 24) : null;
  const topRows = latest
    .filter((item) => item.pollutant_code === "NO2")
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
  const stationNodes = buildStationNodes(stations, latest, worstStationId);
  const historyObserved = (history?.items ?? []).map((item) => ({
    timestamp: item.measured_at,
    value: item.value,
  }));
  const no2Values = latest
    .filter((item) => item.pollutant_code === "NO2" && item.valid !== false)
    .map((item) => item.value);
  const averageNo2 =
    no2Values.length > 0 ? no2Values.reduce((a, b) => a + b, 0) / no2Values.length : null;
  const dominantPollutant = summary?.worst_pollutant_code ?? "NO2";
  const improvement = system?.model?.improvement_pct_vs_best_baseline;
  const modelImprovementLabel =
    improvement != null ? `${improvement >= 0 ? "+" : ""}${improvement.toFixed(1)}%` : "-";
  const modelDisplayName = resolveModelName(system?.model?.selected_model, language);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const predictionsGeneratedAt = system?.predictions?.generated_at
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Europe/Madrid",
      }).format(new Date(system.predictions.generated_at))
    : null;
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
        <PublicPageHeader language={language} pathname="/dashboard" currentPage="dashboard" labels={navigationLabels} />

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
              <p className="mt-4 font-data text-3xl text-bone">{worstStationName ?? "-"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-soft/70">
                  {summary?.worst_pollutant_code ?? "-"}
                  {summary?.worst_value != null ? ` · ${summary.worst_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³` : ""}
                </span>
                {worstRiskLevel && (
                  <RiskBadge riskLevel={worstRiskLevel} language={language} />
                )}
              </div>
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
              <div className="mt-3 flex items-center gap-2">
                <FreshnessIndicator
                  freshness={summary?.freshness ?? "unknown"}
                  label={copy.freshness[summary?.freshness ?? "unknown"]}
                />
              </div>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.pollutant_count ?? 0}</p>
              <p className="mt-3 text-sm text-soft/70">NO2 · O3 · PM10 · PM25 · SO2 · CO</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.station_count ?? 0}</p>
              <p className="mt-3 text-sm text-soft/70">{copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.observationsPanel}</p>
              <p className="font-data text-sm text-soft/55">{language === "es" ? "NO2 · últimas lecturas" : "NO2 · latest readings"}</p>
            </div>
            <div className="mt-5">
              <ObservationTable items={topRows} language={language} stations={stations} />
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-soft/60">{copy.mapStatusTitle}</p>
                <FreshnessIndicator
                  freshness={summary?.freshness ?? "unknown"}
                  label={copy.freshness[summary?.freshness ?? "unknown"]}
                />
              </div>
              <div className="mt-4">
                {stationNodes.length > 0 ? (
                  <AtmosphericMiniMap nodes={stationNodes} className="h-[260px] w-full overflow-hidden rounded-[1.75rem] isolate" />
                ) : (
                  <p className="font-data text-2xl text-bone">{copy.pendingCoords}</p>
                )}
              </div>
              <Link
                className="mt-4 inline-flex text-sm text-soft/60 hover:text-soft"
                href={`/map?lang=${language}`}
              >
                {copy.openMap} →
              </Link>
            </div>
          </aside>
        </div>

        {historyObserved.length > 0 && (
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.dashboardHistoryTitle}</p>
              <p className="font-data text-sm text-soft/55">{worstStationName ?? worstStationId ?? ""}</p>
            </div>
            <div className="mt-5">
              <HistoryForecastChart
                observed={historyObserved}
                predicted={[]}
                observedLabel={copy.observedLabel}
                predictedLabel={copy.predictedLabel}
                language={language}
              />
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
            <p className="eyebrow text-soft/55">{copy.dashboardDominantPollutant}</p>
            <p className="mt-4 font-data text-3xl text-bone">{dominantPollutant}</p>
            {averageNo2 != null && (
              <p className="mt-3 text-sm text-soft/70">
                {copy.dashboardAverageNo2Label} ·{" "}
                <span className="font-data text-bone">{averageNo2.toLocaleString(locale, { maximumFractionDigits: 1 })}</span>
                {" "}µg/m³
              </p>
            )}
            {no2Values.length > 0 && (
              <p className="mt-2 font-data text-xs text-soft/40">
                {no2Values.length} {language === "es" ? "estaciones activas" : "active stations"}
              </p>
            )}
          </div>
          <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
            <p className="eyebrow text-soft/55">{copy.dashboardForecastTrendTitle}</p>
            {summary?.predictions_ready ? (
              <p className="mt-4 font-data text-xl text-bone">{copy.dashboardForecastTrendReady}</p>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-soft/70">{copy.dashboardForecastTrendBody}</p>
            <p className="mt-3 font-data text-xs text-soft/45">
              {language === "es"
                ? `${system?.predictions.station_count ?? 0} estaciones · ${system?.predictions.horizon_count ?? 0} horizontes`
                : `${system?.predictions.station_count ?? 0} stations · ${system?.predictions.horizon_count ?? 0} horizons`}
            </p>
            {predictionsGeneratedAt && (
              <p className="mt-2 text-xs text-soft/55">
                {language === "es" ? `generado: ${predictionsGeneratedAt}` : `generated: ${predictionsGeneratedAt}`}
              </p>
            )}
            <Link
              className="mt-4 inline-flex text-sm text-soft/60 hover:text-soft"
              href={`/predictions?lang=${language}`}
            >
              {copy.openPredictions} →
            </Link>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
            <p className="eyebrow text-soft/55">{copy.dashboardModelStatusTitle}</p>
            <p className="mt-4 font-data text-2xl text-bone">{modelDisplayName}</p>
            {improvement != null ? (
              <p className={`mt-3 font-data text-xl ${improvement >= 0 ? "text-lime" : "text-red-400"}`}>
                {modelImprovementLabel}
                <span className="ml-1 text-xs text-soft/50">{copy.dashboardModelImprovementLabel}</span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-soft/70">{copy.dashboardModelImprovementLabel} · {modelImprovementLabel}</p>
            )}
            <Link
              className="mt-4 inline-flex text-sm text-soft/60 hover:text-soft"
              href={`/model?lang=${language}`}
            >
              {copy.openModel} →
            </Link>
          </div>
        </div>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="dashboard" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}