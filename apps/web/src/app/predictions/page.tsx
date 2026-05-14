import Link from "next/link";

import { HistoryForecastChart } from "@/components/HistoryForecastChart";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { getDashboardPayload, getHistoryPayload, getPredictionsPayload, getSystemStatusPayload } from "@/lib/api";
import { buildPredictionsHref } from "@/lib/editorial";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

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
  acceptable: "border-[#ffd36a]/35 bg-[#ffd36a]/10 text-[#fff2c0]",
  good: "border-[#d8ff4f]/35 bg-[#d8ff4f]/10 text-[#efffb4]",
  moderate: "border-[#ffb000]/35 bg-[#ffb000]/10 text-[#ffe0a0]",
  poor: "border-[#ff7a00]/35 bg-[#ff7a00]/12 text-[#ffd3ad]",
  unhealthy: "border-[#c60b1e]/35 bg-[#c60b1e]/12 text-[#ffccd2]",
  unknown: "border-white/10 bg-white/[0.04] text-soft/72",
  very_unhealthy: "border-[#c60b1e]/35 bg-[#c60b1e]/12 text-[#ffccd2]",
};

function buildPredictionsPageCopy(language: "es" | "en"): PredictionsPageCopy {
  if (language === "es") {
    return {
      artifactContextTitle: "Cómo leer esta previsión",
      forecastForLabel: "Pronóstico para",
      generatedAtLabel: "Actualizado a las",
      horizonSelectorBody:
        "Cada horizonte ya está listo para consultar. Puedes revisar el valor previsto, la hora estimada y el nivel de riesgo para el próximo día.",
      horizonSelectorTitle: "Selector de horizonte",
      modelVersionLabel: "Modelo usado",
      priorityStationLabel: "Estación prioritaria",
      riskEvolutionTitle: "Evolución del riesgo",
      riskLabel: "Riesgo",
      riskLabels: {
        acceptable: "aceptable",
        good: "bueno",
        moderate: "moderado",
        poor: "malo",
        unhealthy: "insalubre",
        unknown: "desconocido",
        very_unhealthy: "muy insalubre",
      },
      selectedForecastTitle: "Previsión seleccionada",
      stationSelectorBody: "Puedes cambiar de estación para revisar cómo cambia el forecast previsto en cada punto prioritario de la red.",
      stationSelectorTitle: "Selector de estación",
      statusLabel: "Horizontes disponibles",
      targetLabel: "Contaminante",
    };
  }

  return {
    artifactContextTitle: "How to read this forecast",
    forecastForLabel: "Forecast for",
    generatedAtLabel: "Updated at",
    horizonSelectorBody:
      "Each horizon is ready to view. You can inspect the expected value, estimated time, and risk level for the next day.",
    horizonSelectorTitle: "Horizon selector",
    modelVersionLabel: "Model used",
    priorityStationLabel: "Priority station",
    riskEvolutionTitle: "Risk evolution",
    riskLabel: "Risk",
    riskLabels: {
      acceptable: "acceptable",
      good: "good",
      moderate: "moderate",
      poor: "poor",
      unhealthy: "unhealthy",
      unknown: "unknown",
      very_unhealthy: "very unhealthy",
    },
    selectedForecastTitle: "Selected forecast",
    stationSelectorBody: "Switch stations to inspect how the forecast changes across the most relevant points in the network.",
    stationSelectorTitle: "Station selector",
    statusLabel: "Available horizons",
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
  const normalized = (riskLevel ?? "unknown").toLowerCase();
  return RISK_SURFACE_CLASS[normalized] ?? RISK_SURFACE_CLASS.unknown;
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
      const leftLabel = `${left.municipality ?? ""} ${left.name ?? left.station_id}`.trim();
      const rightLabel = `${right.municipality ?? ""} ${right.name ?? right.station_id}`.trim();
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
  const observed = (history?.items ?? []).map((item) => ({ timestamp: item.measured_at, value: item.value }));
  const predicted = stationPredictions.map((item) => ({ timestamp: item.predicted_for, value: item.predicted_value }));
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
              <p className="mt-4 font-data text-2xl text-bone">{station?.name ?? stationId ?? "-"}</p>
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
              <p className="mt-4 font-data text-3xl text-bone">{selectedHorizon == null ? "-" : `H+${selectedHorizon}`}</p>
              <p className="mt-3 text-sm text-soft/70">
                {selectedPrediction ? `${selectedPrediction.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 })} · ${resolveRiskLabel(selectedPrediction.risk_level, pageCopy)}` : "-"}
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
                    <span className="font-data text-sm">{candidate.name ?? candidate.station_id}</span>
                    <span className="mt-2 text-xs text-soft/65">{candidate.municipality ?? candidate.station_id}</span>
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
            <p className="font-data text-sm text-soft/55">{language === "es" ? `${targetPollutant} · ${availableHorizons.length} horizontes` : `${targetPollutant} · ${availableHorizons.length} horizons`}</p>
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
                    <span className="font-data text-sm">H+{horizon}</span>
                    <span className="mt-2 text-xs text-soft/65">{forecast ? forecast.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 }) : "-"}</span>
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
              <HistoryForecastChart observed={observed} predicted={predicted} observedLabel={copy.observedLabel} predictedLabel={copy.predictedLabel} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{pageCopy.forecastForLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(selectedPrediction?.predicted_for, locale)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="eyebrow text-soft/55">{copy.tableValue}</p>
                <p className="mt-2 font-data text-2xl text-bone">
                  {selectedPrediction ? selectedPrediction.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 }) : "-"}
                </p>
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
                          <p className="font-data text-sm text-bone">H+{item.horizon_hours}</p>
                          <p className="text-xs uppercase tracking-[0.18em]">{resolveRiskLabel(item.risk_level, pageCopy)}</p>
                        </div>
                        <p className="mt-3 font-data text-xl text-bone">{item.predicted_value.toLocaleString(locale, { maximumFractionDigits: 1 })}</p>
                        <p className="mt-3 text-xs text-soft/70">{formatMoment(item.predicted_for, locale)}</p>
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
                  <p className="mt-2 font-data text-sm text-bone">{station?.name ?? stationId ?? "-"}</p>
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
