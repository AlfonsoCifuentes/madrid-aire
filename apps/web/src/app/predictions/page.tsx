import Link from "next/link";

import { HistoryForecastChart } from "@/components/HistoryForecastChart";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { getDashboardPayload, getHistoryPayload, getPredictionsPayload, getSystemStatusPayload } from "@/lib/api";
import { buildPredictionsHref } from "@/lib/editorial";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatHoursAhead, formatPlaceName, formatPublicModelName, getPublicRiskColor, resolvePublicRiskBand } from "@/lib/presentation";

type PredictionsPageProps = {
  searchParams?: Promise<{ h?: string | string[]; lang?: string | string[]; station?: string | string[] }>;
};

type PredictionsPageCopy = {
  artifactContextTitle: string;
  forecastForLabel: string;
  generatedAtLabel: string;
  horizonSelectorBody: string;
  horizonSelectorTitle: string;
  modelVersionLabel: string;
  priorityStationLabel: string;
  riskEvolutionTitle: string;
  riskLabel: string;
  riskLabels: Record<string, string>;
  selectedForecastTitle: string;
  stationSelectorBody: string;
  stationSelectorTitle: string;
  statusLabel: string;
  targetLabel: string;
};

const RISK_SURFACE_CLASS: Record<string, string> = {
  low: "border-[#d8ff4f]/35 bg-[#d8ff4f]/10 text-[#efffb4]",
  medium: "border-[#ffb000]/35 bg-[#ffb000]/10 text-[#ffe0a0]",
  high: "border-[#ff7a00]/35 bg-[#ff7a00]/12 text-[#ffd3ad]",
  very_high: "border-[#c60b1e]/35 bg-[#c60b1e]/12 text-[#ffccd2]",
  unknown: "border-white/10 bg-white/[0.04] text-soft/72",
};

const RISK_BAR_WIDTH: Record<string, number> = {
  low: 25,
  medium: 50,
  high: 75,
  very_high: 100,
  unknown: 0,
};

function resolveRiskBarColor(riskLevel: string | null | undefined) {
  return getPublicRiskColor(riskLevel);
}

function resolveRiskBarWidth(riskLevel: string | null | undefined) {
  const key = resolvePublicRiskBand(riskLevel);
  return RISK_BAR_WIDTH[key] ?? 0;
}

function buildPredictionsPageCopy(language: "es" | "en"): PredictionsPageCopy {
  if (language === "es") {
    return {
      artifactContextTitle: "Cómo leer esta previsión",
      forecastForLabel: "Pronóstico para",
      generatedAtLabel: "Actualizado a las",
      horizonSelectorBody:
        "Elige dentro de cuántas horas quieres consultar la previsión. Verás el valor esperado, la hora estimada y el nivel de aviso.",
      horizonSelectorTitle: "Horas por delante",
      modelVersionLabel: "Modelo usado",
      priorityStationLabel: "Estación prioritaria",
      riskEvolutionTitle: "Evolución del aviso",
      riskLabel: "Aviso",
      riskLabels: {
        acceptable: "bajo",
        good: "bajo",
        moderate: "medio",
        poor: "alto",
        unhealthy: "muy alto",
        unknown: "desconocido",
        very_unhealthy: "muy alto",
      },
      selectedForecastTitle: "Tramo seleccionado",
      stationSelectorBody: "Puedes cambiar de estación para revisar cómo cambia la previsión esperada en cada punto prioritario de la red.",
      stationSelectorTitle: "Selector de estación",
      statusLabel: "Horas disponibles",
      targetLabel: "Contaminante",
    };
  }

  return {
    artifactContextTitle: "How to read this forecast",
    forecastForLabel: "Forecast for",
    generatedAtLabel: "Updated at",
    horizonSelectorBody:
      "Choose how many hours ahead you want to inspect. You will see the expected value, estimated time and alert level.",
    horizonSelectorTitle: "Hours ahead",
    modelVersionLabel: "Model used",
    priorityStationLabel: "Priority station",
    riskEvolutionTitle: "Alert trend",
    riskLabel: "Alert",
    riskLabels: {
      acceptable: "low",
      good: "low",
      moderate: "medium",
      poor: "high",
      unhealthy: "very high",
      unknown: "unknown",
      very_unhealthy: "very high",
    },
    selectedForecastTitle: "Selected slot",
    stationSelectorBody: "Switch stations to inspect how the forecast changes across the most relevant points in the network.",
    stationSelectorTitle: "Station selector",
    statusLabel: "Available hours",
    targetLabel: "Pollutant",
  };
}

function formatMoment(value: string | null | undefined, locale: string) {
  if (!value) {
    return "-";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(timestamp);
}

function resolveNumericSearchParam(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) {
    return null;
  }

  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveStringSearchParam(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate ? candidate.trim() : null;
}

function resolveRiskLabel(riskLevel: string | null | undefined, pageCopy: PredictionsPageCopy) {
  const normalized = (riskLevel ?? "unknown").toLowerCase();
  return pageCopy.riskLabels[normalized] ?? normalized.replaceAll("_", " ");
}

function resolveRiskSurfaceClass(riskLevel: string | null | undefined) {
  const normalized = resolvePublicRiskBand(riskLevel);
  return RISK_SURFACE_CLASS[normalized] ?? RISK_SURFACE_CLASS.unknown;
}

function formatModelName(value: string | null | undefined, language: "es" | "en") {
  return formatPublicModelName(value, language);
}

export default async function PredictionsPage({ searchParams }: PredictionsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const copy = copyByLanguage[language];
  const pageCopy = buildPredictionsPageCopy(language);
  const [dashboard, predictions, system] = await Promise.all([
    getDashboardPayload(),
    getPredictionsPayload(),
    getSystemStatusPayload(),
  ]);
  const targetPollutant = predictions?.target ?? "NO2";
  const allPredictionItems = (predictions?.items ?? [])
    .filter((item) => item.pollutant_code === targetPollutant)
    .sort((left, right) => left.horizon_hours - right.horizon_hours || left.station_id.localeCompare(right.station_id));
  const predictedStationIds = [...new Set(allPredictionItems.map((item) => item.station_id))];
  const requestedStationId = resolveStringSearchParam(params?.station);
  const preferredStationId = dashboard.summary?.worst_station_id ?? dashboard.latest?.items.find((item) => item.pollutant_code === targetPollutant)?.station_id ?? null;
  const stationId = requestedStationId && predictedStationIds.includes(requestedStationId)
    ? requestedStationId
    : preferredStationId && predictedStationIds.includes(preferredStationId)
    ? preferredStationId
    : (predictedStationIds[0] ?? preferredStationId);
  const station = dashboard.stations?.items.find((item) => item.station_id === stationId) ?? null;
  const stationOptions = dashboard.stations?.items
    .filter((item) => predictedStationIds.includes(item.station_id))
    .sort((left, right) => {
      const leftLabel = `${left.municipality ? formatPlaceName(left.municipality) : ""} ${left.name ? formatPlaceName(left.name) : left.station_id}`.trim();
      const rightLabel = `${right.municipality ? formatPlaceName(right.municipality) : ""} ${right.name ? formatPlaceName(right.name) : right.station_id}`.trim();
      return leftLabel.localeCompare(rightLabel);
    }) ?? [];
  const stationPredictions = stationId
    ? allPredictionItems.filter((item) => item.station_id === stationId).sort((left, right) => left.horizon_hours - right.horizon_hours)
    : [];
  const availableHorizons = [...new Set(stationPredictions.map((item) => item.horizon_hours))];
  const requestedHorizon = resolveNumericSearchParam(params?.h);
  const selectedHorizon = requestedHorizon && availableHorizons.includes(requestedHorizon)
    ? requestedHorizon
    : (availableHorizons.at(-1) ?? null);
  const selectedPrediction = selectedHorizon == null
    ? null
    : (stationPredictions.find((item) => item.horizon_hours === selectedHorizon) ?? null);
  const history = stationId ? await getHistoryPayload(stationId, targetPollutant, 24) : null;
  const historyItems = history?.items ?? [];
  const observed = historyItems.map((item) => ({ timestamp: item.measured_at, value: item.value }));
  const predicted = stationPredictions.map((item) => ({ timestamp: item.predicted_for, value: item.predicted_value }));
  const latestObservedItem = historyItems.reduce<(typeof historyItems)[number] | null>((latestItem, item) => {
    if (!latestItem || item.measured_at > latestItem.measured_at) {
      return item;
    }
    return latestItem;
  }, null);
  const forecastDelta = latestObservedItem && selectedPrediction
    ? selectedPrediction.predicted_value - latestObservedItem.value
    : null;
  const currentNo2ByStation = new Map(
    (dashboard.latest?.items ?? [])
      .filter((item) => item.pollutant_code === targetPollutant)
      .map((item) => [item.station_id, item]),
  );
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
        <PublicPageHeader language={language} pathname="/predictions" currentPage="predictions" labels={navigationLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.forecastPolicy}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.predictionsTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.predictionsSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.priorityStationLabel}</p>
              <p className="mt-4 font-data text-2xl text-bone">{station?.name ? formatPlaceName(station.name) : stationId ?? "-"}</p>
              <p className="mt-3 text-sm text-soft/70">{stationId ?? "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.modelVersionLabel}</p>
              <p className="mt-4 font-data text-xl text-bone">{formatModelName(selectedPrediction?.baseline_name ?? system?.model.selected_model, language)}</p>
              <p className="mt-3 text-sm text-soft/70">{copy.selectedBaseline}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.generatedAtLabel}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(predictions?.generated_at ?? system?.predictions.generated_at, locale)}</p>
              <p className="mt-3 text-sm text-soft/70">{selectedPrediction ? `${pageCopy.forecastForLabel}: ${formatMoment(selectedPrediction.predicted_for, locale)}` : "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.selectedForecastTitle}</p>
              <p className="mt-4 font-data text-3xl text-bone">{formatHoursAhead(selectedHorizon, language)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {selectedPrediction ? `${selectedPrediction.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³ · ${resolveRiskLabel(selectedPrediction.risk_level, pageCopy)}` : "-"}
              </p>
            </div>
          </div>
        </div>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-soft/60">{pageCopy.stationSelectorTitle}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-soft/70">{pageCopy.stationSelectorBody}</p>
            </div>
            <p className="font-data text-sm text-soft/55">{stationOptions.length}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {stationOptions.length > 0 ? (
              stationOptions.map((candidate) => {
                const isActive = candidate.station_id === stationId;

                return (
                  <Link
                    key={candidate.station_id}
                    href={buildPredictionsHref(language, candidate.station_id, selectedHorizon)}
                    className={[
                      "inline-flex min-w-[11rem] flex-col rounded-[1.25rem] border px-4 py-3 transition",
                      isActive
                        ? "border-lime/60 bg-lime/15 text-bone shadow-[0_18px_40px_rgba(216,255,79,0.12)]"
                        : "border-white/10 bg-white/[0.03] text-soft/78 hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    <span className="font-data text-sm">{candidate.name ? formatPlaceName(candidate.name) : candidate.station_id}</span>
                    {candidate.municipality && formatPlaceName(candidate.municipality) !== formatPlaceName(candidate.name ?? "") && (
                      <span className="mt-2 text-xs text-soft/65">{formatPlaceName(candidate.municipality)}</span>
                    )}
                    {(() => {
                      const obs = currentNo2ByStation.get(candidate.station_id);
                      if (!obs?.value) return null;
                      return (
                        <span className="mt-1.5 flex items-center gap-1.5">
                          {obs.risk_level && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: resolveRiskBarColor(obs.risk_level) }} />
                          )}
                          <span className="font-data text-[10px] text-soft/50">
                            {obs.value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³
                          </span>
                        </span>
                      );
                    })()}
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-soft/70">{copy.stationNoPredictions}</p>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-soft/60">{pageCopy.horizonSelectorTitle}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-soft/70">{pageCopy.horizonSelectorBody}</p>
            </div>
            <p className="font-data text-sm text-soft/55">
              {targetPollutant} · {language === "es" ? "hasta" : "up to"} {formatHoursAhead(availableHorizons.at(-1) ?? null, language, true)}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {availableHorizons.length > 0 ? (
              availableHorizons.map((horizon) => {
                const forecast = stationPredictions.find((item) => item.horizon_hours === horizon);
                const isActive = horizon === selectedHorizon;

                return (
                  <Link
                    key={horizon}
                    href={buildPredictionsHref(language, stationId, horizon)}
                    className={[
                      "inline-flex min-w-[6.5rem] flex-col rounded-[1.25rem] border px-4 py-3 transition",
                      isActive
                        ? "border-lime/60 bg-lime/15 text-bone shadow-[0_18px_40px_rgba(216,255,79,0.12)]"
                        : "border-white/10 bg-white/[0.03] text-soft/78 hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    <span className="font-data text-sm">{formatHoursAhead(horizon, language, true)}</span>
                    <span className="mt-2 text-xs text-soft/65">{forecast ? `${forecast.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³` : "-"}</span>
                    {forecast?.risk_level && (
                      <span className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: resolveRiskBarColor(forecast.risk_level) }} />
                        <span className="text-[10px] text-soft/50 capitalize">{resolveRiskLabel(forecast.risk_level, pageCopy)}</span>
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-soft/70">{copy.stationNoPredictions}</p>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-soft/60">{copy.historyLabel}</p>
              <p className="font-data text-sm text-soft/55">{language === "es" ? `${targetPollutant} · últimas 24 h + previsión` : `${targetPollutant} · last 24h + forecast`}</p>
            </div>
            <div className="mt-5">
              <HistoryForecastChart observed={observed} predicted={predicted} observedLabel={copy.observedLabel} predictedLabel={copy.predictedLabel} language={language} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{pageCopy.forecastForLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(selectedPrediction?.predicted_for, locale)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{language === "es" ? "Última observación" : "Latest observation"}</p>
                <p className="mt-2 font-data text-2xl text-bone">
                  {latestObservedItem ? latestObservedItem.value.toLocaleString(locale, { maximumFractionDigits: 1 }) : "-"}
                  {latestObservedItem && <span className="ml-1 font-sans text-xs text-soft/50">µg/m³</span>}
                </p>
                <p className="mt-2 text-xs text-soft/55">{formatMoment(latestObservedItem?.measured_at, locale)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{copy.tableValue}</p>
                <p className="mt-2 font-data text-2xl text-bone">
                  {selectedPrediction ? selectedPrediction.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 }) : "-"}
                </p>
                {forecastDelta != null && (
                  <p className={`mt-2 text-xs ${forecastDelta > 0 ? "text-[#FFB000]" : forecastDelta < 0 ? "text-lime" : "text-soft/55"}`}>
                    {forecastDelta > 0 ? "+" : ""}{forecastDelta.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³ {language === "es" ? "vs. ahora" : "vs. now"}
                  </p>
                )}
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{pageCopy.riskLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{resolveRiskLabel(selectedPrediction?.risk_level, pageCopy)}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-soft/70">{copy.notOfficialForecast}</p>
          </section>

          <aside className="grid gap-6">
            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-soft/60">{pageCopy.riskEvolutionTitle}</p>
                <p className="font-data text-sm text-soft/55">{language === "es" ? `${stationPredictions.length} tramos` : `${stationPredictions.length} steps`}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {stationPredictions.length > 0 ? (
                  stationPredictions.map((item) => {
                    const isActive = item.horizon_hours === selectedHorizon;

                    return (
                      <Link
                        key={`${item.station_id}-${item.horizon_hours}`}
                        href={buildPredictionsHref(language, item.station_id, item.horizon_hours)}
                        className={[
                          "rounded-[1.5rem] border p-4 transition hover:translate-y-[-1px]",
                          resolveRiskSurfaceClass(item.risk_level),
                          isActive ? "ring-1 ring-lime/60" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-data text-sm text-bone">{formatHoursAhead(item.horizon_hours, language, true)}</p>
                          <p className="text-xs uppercase tracking-[0.18em]">{resolveRiskLabel(item.risk_level, pageCopy)}</p>
                        </div>
                        <p className="mt-3 font-data text-xl text-bone">
                          {item.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 })}
                          <span className="ml-1 font-sans text-xs text-soft/50">µg/m³</span>
                        </p>
                        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${resolveRiskBarWidth(item.risk_level)}%`,
                              backgroundColor: resolveRiskBarColor(item.risk_level),
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-soft/70">{formatMoment(item.predicted_for, locale)}</p>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-sm leading-6 text-soft/70">{copy.stationNoPredictions}</p>
                )}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/60">{pageCopy.artifactContextTitle}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <p className="eyebrow text-soft/55">{pageCopy.targetLabel}</p>
                  <p className="mt-2 font-data text-sm text-bone">{targetPollutant}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/55">{pageCopy.statusLabel}</p>
                  <p className="mt-2 font-data text-sm text-bone">{availableHorizons.length}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/55">{pageCopy.priorityStationLabel}</p>
                  <p className="mt-2 font-data text-sm text-bone">{station?.name ? formatPlaceName(station.name) : stationId ?? "-"}</p>
                </div>
                <div>
                  <p className="eyebrow text-soft/55">{pageCopy.generatedAtLabel}</p>
                  <p className="mt-2 font-data text-sm text-bone">{formatMoment(predictions?.generated_at ?? system?.predictions.generated_at, locale)}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="predictions" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}
