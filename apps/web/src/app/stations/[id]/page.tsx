import { notFound } from "next/navigation";

import { DataTimestamp } from "@/components/DataTimestamp";
import { HistoryForecastChart } from "@/components/HistoryForecastChart";
import { HourlyHeatmap } from "@/components/HourlyHeatmap";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { Sparkline } from "@/components/Sparkline";
import { getDashboardPayload, getHistoryPayload, getModelMetricsPayload, getPredictionsPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName, formatRiskLabel } from "@/lib/presentation";

type StationDetailPageProps = {
  params: Promise<{ id: string }>;
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

function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude == null || longitude == null) {
    return "-";
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function formatModelName(value: string | null | undefined, language: "es" | "en") {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("hist_gradient_boosting")) {
    return language === "es" ? "Modelo NO2 v1" : "NO2 model v1";
  }
  if (normalized === "persistence") {
    return language === "es" ? "Tendencia reciente" : "Recent trend reference";
  }
  if (normalized === "same_hour_yesterday") {
    return language === "es" ? "Ayer a esta hora" : "Same time yesterday";
  }
  if (normalized === "rolling_mean_24h") {
    return language === "es" ? "Media reciente" : "Recent average";
  }

  return value?.replaceAll("_", " ") ?? "-";
}

export default async function StationDetailPage({ params, searchParams }: StationDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(resolvedSearchParams?.lang);
  const copy = copyByLanguage[language];
  const locale = language === "es" ? "es-ES" : "en-GB";
  const stationId = resolvedParams.id;
  const dashboard = await getDashboardPayload();
  const station = dashboard.stations?.items.find((item) => item.station_id === stationId) ?? null;

  if (!station) {
    notFound();
  }

  const [history, predictions, metrics] = await Promise.all([
    getHistoryPayload(stationId, "NO2", 24),
    getPredictionsPayload(stationId),
    getModelMetricsPayload(),
  ]);

  const currentValues = (dashboard.latest?.items ?? [])
    .filter((item) => item.station_id === stationId)
    .sort((left, right) => {
      if (left.pollutant_code === "NO2") {
        return -1;
      }
      if (right.pollutant_code === "NO2") {
        return 1;
      }
      return left.pollutant_code.localeCompare(right.pollutant_code);
    });
  const no2Current = currentValues.find((item) => item.pollutant_code === "NO2") ?? null;
  const freshnessKey = toFreshnessBucket(no2Current?.measured_at ?? currentValues[0]?.measured_at);
  const observed = (history?.items ?? []).map((item) => ({ timestamp: item.measured_at, value: item.value }));
  const predicted = (predictions?.items ?? []).map((item) => ({ timestamp: item.predicted_for, value: item.predicted_value }));
  const no2SparklineData = observed.map((o) => o.value);
  const pollutants = [...new Set(currentValues.map((item) => item.pollutant_code))];

  // Build hourly heatmap data: one value per hour (0–23)
  const hourlyHeatmapData = Object.values(
    (history?.items ?? []).reduce<Record<number, { hour: number; value: number }>>(
      (acc, item) => {
        const hour = new Date(item.measured_at).getHours();
        acc[hour] = { hour, value: item.value };
        return acc;
      },
      {}
    )
  );
  const selectedMetric =
    metrics?.items.find((item) => item.baseline_name === metrics.selected_baseline && item.split_name === "test") ??
    metrics?.items[0] ??
    null;
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
        <PublicPageHeader language={language} pathname={`/stations/${stationId}`} currentPage="stations" labels={navigationLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.stationDetailTitle}</p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {station.name ? formatPlaceName(station.name) : station.municipality ? formatPlaceName(station.municipality) : station.station_id}
            </h1>
            <p className="mt-4 font-data text-lg text-soft/62">{station.station_id}</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.stationDetailSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationLatestNo2}</p>
              <p className="mt-4 font-data text-3xl text-bone">
                {no2Current?.value == null ? "-" : no2Current.value.toLocaleString(locale, { maximumFractionDigits: 1 })}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationsTableFreshness}</p>
              <p className="mt-4 font-data text-3xl text-bone">{copy.freshness[freshnessKey]}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
              <p className="mt-4 font-data text-3xl text-bone">{pollutants.length}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.stationCoordinates}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatCoordinates(station.latitude, station.longitude)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.stationHistoryForecastTitle}</p>
              <p className="font-data text-sm text-soft/55">{language === "es" ? "NO2 · últimas 24 h + previsión" : "NO2 · last 24h + forecast"}</p>
            </div>
            <div className="mt-5">
              {observed.length > 0 || predicted.length > 0 ? (
                <HistoryForecastChart observed={observed} predicted={predicted} observedLabel={copy.observedLabel} predictedLabel={copy.predictedLabel} language={language} />
              ) : (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-soft/72">
                  {copy.stationNoHistory}
                </div>
              )}
            </div>
            {predicted.length === 0 ? <p className="mt-5 text-sm text-soft/68">{copy.stationNoPredictions}</p> : null}
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.stationCurrentValuesTitle}</p>
              <DataTimestamp
                isoString={currentValues[0]?.measured_at}
                language={language}
                className="font-data text-sm text-soft/55"
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {currentValues.map((item) => (
                <div key={`${item.station_id}-${item.pollutant_code}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-data text-sm text-bone">{item.pollutant_code}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-soft/52">{formatRiskLabel(item.risk_level, language)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="font-data text-xl text-bone">{item.value.toLocaleString(locale, { maximumFractionDigits: 1 })}</p>
                      {item.pollutant_code === "NO2" && no2SparklineData.length >= 2 && (
                        <Sparkline data={no2SparklineData} width={60} height={20} color="#FFB000" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.stationModelErrorTitle}</p>
              <p className="font-data text-sm text-soft/55">{formatModelName(metrics?.selected_baseline, language)}</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{copy.metricMae}</p>
                <p className="mt-3 font-data text-2xl text-bone">{selectedMetric?.mae == null ? "-" : selectedMetric.mae.toFixed(2)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{copy.metricRmse}</p>
                <p className="mt-3 font-data text-2xl text-bone">{selectedMetric?.rmse == null ? "-" : selectedMetric.rmse.toFixed(2)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{copy.metricR2}</p>
                <p className="mt-3 font-data text-2xl text-bone">{selectedMetric?.r2 == null ? "-" : selectedMetric.r2.toFixed(3)}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-soft/70">{copy.stationGlobalErrorNote}</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.stationAvailablePollutantsTitle}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {pollutants.map((pollutant) => (
                  <span key={pollutant} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-data text-sm text-bone">
                    {pollutant}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{copy.stationOfficialContextTitle}</p>
              <div className="mt-5 grid gap-4 text-sm text-soft/74">
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationMunicipality}</p>
                  <p className="mt-2">{station.municipality ? formatPlaceName(station.municipality) : "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationAddress}</p>
                  <p className="mt-2">{station.postal_address ?? "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationZone}</p>
                  <p className="mt-2">{station.zone_description ?? "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationAreaType}</p>
                  <p className="mt-2">{station.area_type ?? "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationStationType}</p>
                  <p className="mt-2">{station.station_type ?? "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationAltitude}</p>
                  <p className="mt-2">{station.altitude_meters == null ? "-" : `${station.altitude_meters.toFixed(0)} m`}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationCoordinates}</p>
                  <p className="mt-2">{formatCoordinates(station.latitude, station.longitude)}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/50">{copy.stationGlobalErrorReference}</p>
                  <p className="mt-2">{formatModelName(metrics?.selected_baseline, language)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

        {hourlyHeatmapData.length > 0 && (
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="eyebrow text-soft/60">{language === "es" ? "Patrón horario NO2" : "NO2 hourly pattern"}</p>
              <p className="font-data text-sm text-soft/55">{language === "es" ? "últimas 24 h" : "last 24h"}</p>
            </div>
            <HourlyHeatmap
              data={hourlyHeatmapData}
              hourLabel="h"
              unit="µg/m³"
              language={language}
            />
          </section>
        )}

      <MobileBottomNav currentLanguage={language} currentPage="stations" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}