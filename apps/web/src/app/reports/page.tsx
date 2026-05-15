import Link from "next/link";

import { AdvancedPageHeader, buildAdvancedMobileNavItems, type AdvancedNavLabels } from "@/components/AdvancedPageHeader";
import { MetricBars } from "@/components/MetricBars";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { OperationalStatusStrip } from "@/components/OperationalStatusStrip";
import { RiskBadge } from "@/components/RiskBadge";
import { getAlertsPayload, getDashboardPayload, getModelMetricsPayload, getPredictionsPayload, getSystemStatusPayload } from "@/lib/api";
import { buildForecastHotspots, buildMunicipalitySnapshots, buildPredictionsHref, buildStationDetailHref } from "@/lib/editorial";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatAlertBody, formatAlertCategory, formatAlertSeverity, formatAlertTitle, formatOperationalLabel, formatPlaceName } from "@/lib/presentation";

type ReportsPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function formatMoment(value: string | null, locale: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

function formatWindow(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) {
    return "-";
  }

  return `${start.slice(0, 10)} → ${end.slice(0, 10)}`;
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

function severityClasses(severity: string) {
  if (severity === "critical") {
    return "border-[#ff7b7b]/30 bg-[#ff7b7b]/10 text-[#ffd1d1]";
  }
  if (severity === "warning") {
    return "border-[#f2d06b]/30 bg-[#f2d06b]/10 text-[#fff1bf]";
  }
  return "border-white/10 bg-white/5 text-soft/78";
}

function buildCopy(language: "es" | "en") {
  if (language === "es") {
    return {
      dailyTitle: "Resumen diario",
      weeklyTitle: "Lectura del modelo",
      freshnessTitle: "Estado de actualización",
      issuesTitle: "Puntos a revisar",
      dailyNote: "Resumen rápido de la situación del día: estación más presionada, momento de actualización y alcance actual de la red.",
      weeklyNote: "Lectura breve del modelo actual y de las métricas más útiles para seguir su comportamiento.",
      freshnessNote: "Este bloque resume si la señal y la previsión se están actualizando con normalidad.",
      issuesEmpty: "No hay incidencias activas adicionales más allá del estado operativo ya resumido arriba.",
      worstStationLabel: "Peor estación del día",
      activeAlertsLabel: "Alertas activas",
      predictorLabel: "Modelo actual",
      overallNote: "No es un parte oficial; es una lectura editorial construida sobre datos oficiales y el estado actual del proyecto.",
      editorialTitle: "Lectura editorial del día",
      editorialBody: "Un resumen corto para entender dónde mirar ahora, qué zona concentra más presión y qué tramo de la previsión conviene seguir a continuación.",
      municipalitiesTitle: "Municipios a vigilar",
      municipalitiesBody: "La lectura territorial se apoya en el peor valor actual de NO2 por municipio con presencia operativa en la red.",
      forecastWatchTitle: "Próximos picos previstos",
      forecastWatchBody: "Estos son los puntos donde la previsión actual concentra los valores más altos en la próxima ventana operativa.",
      municipalityStationsLabel: "estaciones con señal",
      peakStationLabel: "Punto más alto",
      forecastForLabel: "Previsto para",
      forecastHotspotLabel: "Siguiente foco previsto",
    };
  }

  return {
    dailyTitle: "Daily summary",
    weeklyTitle: "Weekly model report",
    freshnessTitle: "Data freshness",
    issuesTitle: "Known issues",
    dailyNote: "A quick summary of the day: most pressured station, latest update time, and current network coverage.",
    weeklyNote: "A short reading of the current model and the metrics that matter most when tracking its behaviour.",
    freshnessNote: "This block summarises whether the signal and the forecast are updating normally.",
    issuesEmpty: "There are no extra active issues beyond the operational state already summarized above.",
    worstStationLabel: "Worst station today",
    activeAlertsLabel: "Active alerts",
    predictorLabel: "Current model",
    overallNote: "This is not an official bulletin; it is an editorial reading built on official data and the current state of the project.",
    editorialTitle: "Editorial briefing",
    editorialBody: "A short read to understand where to look now, which area is carrying more pressure, and which part of the forecast is worth watching next.",
    municipalitiesTitle: "Municipalities to watch",
    municipalitiesBody: "The territorial reading is based on the highest current NO2 value per municipality with active network presence.",
    forecastWatchTitle: "Next forecast peaks",
    forecastWatchBody: "These are the points where the current forecast concentrates the highest values in the next operating window.",
    municipalityStationsLabel: "stations with signal",
    peakStationLabel: "Highest point",
    forecastForLabel: "Forecast for",
    forecastHotspotLabel: "Next forecast hotspot",
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const copy = copyByLanguage[language];
  const pageCopy = buildCopy(language);
  const advancedLabels: AdvancedNavLabels = {
    guide: copy.openAbout,
    dashboard: copy.mobileNavDashboard,
    model: copy.mobileNavModel,
    methodology: copy.mobileNavMethodology,
    reports: copy.mobileNavReports,
    system: copy.mobileNavSystem,
    eyebrow: copy.aboutTechnicalLabel,
    body:
      language === "es"
        ? "Esta sección junta lectura editorial y seguimiento técnico en un mismo plano. Úsala cuando quieras contexto, no solo una pantalla pública."
        : "This section brings editorial reading and technical follow-up together. Use it when you want context, not just a public-facing screen.",
  };
  const mobileNavItems = buildAdvancedMobileNavItems(language, advancedLabels);
  const [dashboard, metrics, system, alerts, predictions] = await Promise.all([
    getDashboardPayload(),
    getModelMetricsPayload(),
    getSystemStatusPayload(),
    getAlertsPayload(),
    getPredictionsPayload(),
  ]);
  const stations = dashboard.stations?.items ?? [];
  const latest = dashboard.latest?.items ?? [];
  const targetPollutant = predictions?.target ?? "NO2";
  const worstStationMeta = stations.find((s) => s.station_id === dashboard.summary?.worst_station_id);
  const worstStationLabel =
    worstStationMeta?.name
      ? formatPlaceName(worstStationMeta.name)
      : worstStationMeta?.municipality
        ? formatPlaceName(worstStationMeta.municipality)
        : (dashboard.summary?.worst_station_id ?? "-");
  const worstStationObservation = latest.find(
    (item) => item.station_id === dashboard.summary?.worst_station_id && item.pollutant_code === targetPollutant,
  ) ?? null;
  const leadAlert = alerts?.items[0] ?? null;
  const selectedMetric = (metrics?.items ?? []).find((item) => item.baseline_name === metrics?.selected_baseline) ?? null;
  const municipalityWatch = buildMunicipalitySnapshots(stations, latest).slice(0, 6);
  const forecastWatch = buildForecastHotspots(stations, predictions?.items ?? [], predictions?.target ?? "NO2", 4);
  const leadingMunicipality = municipalityWatch[0] ?? null;
  const leadingForecast = forecastWatch[0] ?? null;

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <AdvancedPageHeader language={language} pathname="/reports" currentPage="reports" labels={advancedLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.reportsTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.reportsSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.worstStationLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{worstStationLabel}</p>
              <p className="mt-3 text-sm text-soft/70">
                {worstStationObservation?.value != null
                  ? `${worstStationObservation.value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³ · ${targetPollutant}`
                  : (dashboard.summary?.worst_station_id ?? "-")}
              </p>
              {worstStationObservation?.risk_level && (
                <div className="mt-3">
                  <RiskBadge riskLevel={worstStationObservation.risk_level} language={language} />
                </div>
              )}
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.activeAlertsLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{alerts?.items.length ?? 0}</p>
              <p className="mt-3 text-sm text-soft/70">
                {leadAlert
                  ? `${formatAlertSeverity(leadAlert.severity, language)} · ${formatAlertCategory(leadAlert.category, language)}`
                  : (language === "es" ? "Sin incidencias activas" : "No active issues")}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(dashboard.summary?.latest_timestamp ?? null, locale)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {language === "es" ? `${dashboard.summary?.station_count ?? 0} estaciones activas` : `${dashboard.summary?.station_count ?? 0} active stations`}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{pageCopy.predictorLabel}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {system?.model.improvement_pct_vs_best_baseline != null
                  ? `${system.model.improvement_pct_vs_best_baseline > 0 ? "+" : ""}${system.model.improvement_pct_vs_best_baseline.toLocaleString(locale, { maximumFractionDigits: 1 })}% ${language === "es" ? "vs. referencia" : "vs. baseline"}`
                  : selectedMetric?.mae != null
                    ? `${copy.metricMae}: ${selectedMetric.mae.toLocaleString(locale, { maximumFractionDigits: 2 })} µg/m³`
                    : "-"}
              </p>
            </div>
          </div>
        </div>

        <OperationalStatusStrip language={language} system={system} freshnessLabels={copy.freshness} currentPage="reports" />

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.editorialTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.editorialBody}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link
                href={leadingMunicipality ? buildStationDetailHref(language, leadingMunicipality.stationId) : `/stations?lang=${language}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
              >
                <p className="eyebrow text-soft/55">{pageCopy.worstStationLabel}</p>
                <p className="mt-3 text-lg text-bone">
                  {leadingMunicipality
                    ? language === "es"
                      ? `${formatPlaceName(leadingMunicipality.municipality)} lidera la lectura territorial actual.`
                      : `${formatPlaceName(leadingMunicipality.municipality)} is currently leading the territorial read.`
                    : "-"}
                </p>
                <p className="mt-3 text-sm leading-6 text-soft/70">
                  {leadingMunicipality
                    ? language === "es"
                      ? `${pageCopy.peakStationLabel}: ${formatPlaceName(leadingMunicipality.stationName)} (${leadingMunicipality.stationId}) con ${leadingMunicipality.peakValue.toFixed(1)} µg/m³.`
                      : `${pageCopy.peakStationLabel}: ${formatPlaceName(leadingMunicipality.stationName)} (${leadingMunicipality.stationId}) with ${leadingMunicipality.peakValue.toFixed(1)} µg/m³.`
                    : "-"}
                </p>
              </Link>
              <Link
                href={leadingForecast ? buildPredictionsHref(language, leadingForecast.stationId, leadingForecast.horizonHours) : `/predictions?lang=${language}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
              >
                <p className="eyebrow text-soft/55">{pageCopy.forecastHotspotLabel}</p>
                <p className="mt-3 text-lg text-bone">
                  {leadingForecast
                    ? language === "es"
                      ? `${formatPlaceName(leadingForecast.municipality)} concentra el próximo pico previsto.`
                      : `${formatPlaceName(leadingForecast.municipality)} concentrates the next forecast peak.`
                    : "-"}
                </p>
                <p className="mt-3 text-sm leading-6 text-soft/70">
                  {leadingForecast
                    ? language === "es"
                      ? `${formatPlaceName(leadingForecast.stationName)} marca ${leadingForecast.predictedValue.toFixed(1)} µg/m³ en H+${leadingForecast.horizonHours}.`
                      : `${formatPlaceName(leadingForecast.stationName)} reaches ${leadingForecast.predictedValue.toFixed(1)} µg/m³ at H+${leadingForecast.horizonHours}.`
                    : "-"}
                </p>
              </Link>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.municipalitiesTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.municipalitiesBody}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {municipalityWatch.length > 0 ? (
                municipalityWatch.map((municipality) => (
                  <Link
                    key={municipality.municipality}
                    href={buildStationDetailHref(language, municipality.stationId)}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-soft/72">{formatPlaceName(municipality.municipality)}</p>
                        <p className="mt-2 font-data text-sm text-bone">{formatPlaceName(municipality.stationName)}</p>
                      </div>
                      <p className="font-data text-xl text-bone">{municipality.peakValue.toFixed(1)}</p>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-soft/55">
                      {municipality.stationCount} {pageCopy.municipalityStationsLabel} · {municipality.stationId}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-soft/74">-</p>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.dailyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.dailyNote}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(dashboard.summary?.latest_timestamp ?? null, locale)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.mapNodeFreshness}</p>
                <p className="mt-2 font-data text-sm text-bone">{copy.freshness[dashboard.summary?.freshness ?? "pending"] ?? copy.freshness.pending}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                <p className="mt-2 font-data text-3xl text-bone">{dashboard.summary?.station_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
                <p className="mt-2 font-data text-3xl text-bone">{dashboard.summary?.pollutant_count ?? 0}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.weeklyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.weeklyNote}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{metrics?.horizon_hours ? `${metrics.horizon_hours}h` : "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.testWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null)}</p>
              </div>
            </div>
            <div className="mt-5">
              <MetricBars items={metrics?.items ?? []} maeLabel={copy.metricMae} rmseLabel={copy.metricRmse} r2Label={copy.metricR2} />
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.freshnessTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.freshnessNote}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.systemGlobalStatusLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatOperationalLabel(system?.status, language)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.mapNodeFreshness}</p>
                <p className="mt-2 font-data text-sm text-bone">{copy.freshness[system?.data_quality.freshness ?? "unknown"] ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemGeneratedAtLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(system?.predictions.generated_at ?? null, locale)}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-soft/70">{pageCopy.overallNote}</p>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.issuesTitle}</h2>
            <div className="mt-5 grid gap-4">
              {alerts?.items.length ? (
                alerts.items.map((alert) => (
                  <article key={alert.id} className={`rounded-[1.5rem] border p-4 ${severityClasses(alert.severity)}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="eyebrow">{formatAlertCategory(alert.category, language)}</p>
                      <p className="font-data text-xs uppercase tracking-[0.24em]">{formatAlertSeverity(alert.severity, language)}</p>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-bone">{formatAlertTitle(alert.title, language)}</h3>
                    <p className="mt-2 text-sm leading-6">{formatAlertBody(alert.body, language)}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-6 text-soft/74">{pageCopy.issuesEmpty}</p>
              )}
            </div>
          </section>
        </div>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-medium text-bone">{pageCopy.forecastWatchTitle}</h2>
            <p className="font-data text-sm text-soft/55">{predictions?.target ?? "NO2"} · {forecastWatch.length}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-soft/74">{pageCopy.forecastWatchBody}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {forecastWatch.length > 0 ? (
              forecastWatch.map((forecast) => (
                <Link
                  key={`${forecast.stationId}-${forecast.horizonHours}`}
                  href={buildPredictionsHref(language, forecast.stationId, forecast.horizonHours)}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-lime/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-soft/72">{formatPlaceName(forecast.municipality)}</p>
                      <p className="mt-2 font-data text-sm text-bone">{formatPlaceName(forecast.stationName)}</p>
                    </div>
                    <p className="font-data text-xl text-bone">{forecast.predictedValue.toFixed(1)}</p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-soft/55">H+{forecast.horizonHours} · {forecast.stationId}</p>
                  <p className="mt-2 text-xs leading-5 text-soft/65">
                    {pageCopy.forecastForLabel}: {formatMoment(forecast.predictedFor, locale)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-soft/74">-</p>
            )}
          </div>
        </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="reports" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}