import Link from "next/link";

import { AdvancedPageHeader, buildAdvancedMobileNavItems, type AdvancedNavLabels } from "@/components/AdvancedPageHeader";
import { MetricBars } from "@/components/MetricBars";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { OperationalStatusStrip } from "@/components/OperationalStatusStrip";
import { getModelMetricsPayload, getSystemStatusPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type MethodologyPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function formatWindow(start: string | null, end: string | null) {
  if (!start || !end) {
    return "-";
  }

  return `${start.slice(0, 10)} → ${end.slice(0, 10)}`;
}

function countWindowDays(start: string | null, end: string | null) {
  if (!start || !end) {
    return null;
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return null;
  }

  return Math.floor((endMs - startMs) / 86_400_000) + 1;
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

function buildIntro(language: "es" | "en") {
  if (language === "es") {
    return {
      title: "Antes del detalle técnico",
      body: "Si solo quieres interpretar la situación actual, empieza por el resumen, el mapa o la previsión. Esta página entra en el proceso completo: datos, preparación, validación y límites.",
      cta: "Volver a la guía",
    };
  }

  return {
    title: "Before the technical detail",
    body: "If you only want to interpret current conditions, start with the overview, the map, or the forecast. This page goes through the full process: data, preparation, validation, and limits.",
    cta: "Back to guide",
  };
}

function buildSections(language: "es" | "en", stationCount: number, pollutantCount: number) {
  if (language === "es") {
    return {
      sourcesTitle: "Fuentes",
      etlTitle: "ETL",
      validationTitle: "Validación",
      featuresTitle: "Ingeniería de variables",
      splitTitle: "Separación temporal",
      evaluationTitle: "Evaluación",
      limitationsTitle: "Limitaciones",
      sources: [
        `Comunidad de Madrid: históricos oficiales 2025 y 2026 para calidad del aire.`,
        `Cloudflare D1 sirve la señal observacional reciente ya normalizada; los CSV oficiales diarios siguen siendo la materia prima y el respaldo verificable del flujo.`,
        `Metadatos oficiales de estación para municipio, dirección, zona y coordenadas.`,
        `Las variables meteorológicas siguen documentadas para iteraciones futuras, pero todavía no forman parte del modelo v1 publicado.`,
      ],
      etl: [
        "Lectura flexible de CSV oficiales con pandas.",
        "Normalización wide-to-long a observaciones por estación, contaminante y hora.",
        "Consolidación de snapshots `.normalized.csv` con deduplicación por timestamp antes de publicar la señal operativa.",
        "Asignación conservadora de `risk_level` y descarte explícito de valores inválidos.",
      ],
      validation: [
        `Cobertura observacional actual: ${stationCount} estaciones y ${pollutantCount} contaminantes activos.`,
        "Sin estaciones sintéticas, sin coordenadas inventadas y sin previsión calculada en el frontend.",
        "Chequeos de frescura y consistencia antes de exponer `/api/latest`, `/api/summary` y `/api/system-status`.",
        "Artefactos ML publicados solo tras split temporal honesto y métricas comparadas contra una referencia simple.",
      ],
      features: [
        "Variables temporales: hora, día de la semana, mes e indicador de fin de semana.",
        "Codificación de estación para capturar diferencias estructurales entre nodos oficiales.",
        "Lags de 1h, 3h, 6h, 24h y 168h sobre la señal de NO2.",
        "Rolling means de 3h, 6h y 24h calculadas por estación sin fuga temporal.",
      ],
      evaluationNote: "Comparativa real entre el predictor seleccionado y las referencias simples sobre la ventana de test.",
      splitNote: "La validación actual usa train 2025 / test 2026; todavía no existe una ventana intermedia persistida entre ambos bloques.",
      limitations: [
        "La API pública todavía no expone error por estación aunque el artefacto sí lo calcula.",
        "La lectura observacional ya sale de Cloudflare D1, pero la frescura sigue dependiendo de que el ciclo protegido complete la ingestión a tiempo.",
        "No hay features meteorológicas en el modelo v1 actual.",
        "Las previsiones y métricas siguen publicándose como artefactos versionados; todavía no existe persistencia longitudinal semanal para informes históricos.",
      ],
    };
  }

  return {
    sourcesTitle: "Sources",
    etlTitle: "ETL",
    validationTitle: "Validation",
    featuresTitle: "Feature engineering",
    splitTitle: "Temporal split",
    evaluationTitle: "Evaluation",
    limitationsTitle: "Limitations",
    sources: [
      "Comunidad de Madrid: official 2025 and 2026 historical air-quality exports.",
      "Cloudflare D1 serves the recent normalized observation signal, while official daily CSV exports remain the verified raw input and fallback source.",
      "Official station metadata for municipality, address, zone, and coordinates.",
      "Weather variables remain documented for future iterations, but they are not part of the published v1 model yet.",
    ],
    etl: [
      "Flexible ingestion of official CSV files with pandas.",
      "Wide-to-long normalization into station, pollutant, and hourly observations.",
      "Consolidation of `.normalized.csv` snapshots with timestamp-level deduplication before the operational signal is published.",
      "Conservative `risk_level` assignment and explicit removal of invalid values.",
    ],
    validation: [
      `Current observation coverage: ${stationCount} stations and ${pollutantCount} active pollutants.`,
      "No synthetic stations, no invented coordinates, and no frontend-side forecasting.",
      "Freshness and consistency checks gate `/api/latest`, `/api/summary`, and `/api/system-status`.",
      "ML artifacts are published only after an honest temporal split and baseline comparison.",
    ],
    features: [
      "Temporal variables: hour, day of week, month, and weekend flag.",
      "Station encoding to capture structural differences across official nodes.",
      "NO2 lags at 1h, 3h, 6h, 24h, and 168h.",
      "3h, 6h, and 24h rolling means computed per station without temporal leakage.",
    ],
    evaluationNote: "Real comparison between the selected predictor and the reference baselines on the test window.",
    splitNote: "The current validation uses train 2025 / test 2026; an intermediate persisted validation window does not exist yet.",
    limitations: [
      "The public API still does not expose station-level error even though the artifact computes it.",
      "Observations already come from Cloudflare D1, but freshness still depends on the protected ingest cycle completing on time.",
      "Weather features are not part of the current v1 model.",
      "Forecasts and metrics are still published as versioned artifacts, and weekly historical reporting is not persisted yet.",
    ],
  };
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
      <h2 className="text-2xl font-medium text-bone">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-soft/74">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

export default async function MethodologyPage({ searchParams }: MethodologyPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const [system, metrics] = await Promise.all([getSystemStatusPayload(), getModelMetricsPayload()]);
  const sections = buildSections(language, system?.data_quality.station_count ?? 0, system?.data_quality.pollutant_count ?? 0);
  const intro = buildIntro(language);
  const trainingDays = countWindowDays(metrics?.training_period_start ?? null, metrics?.training_period_end ?? null);
  const testDays = countWindowDays(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null);
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
        ? "Aquí se documentan fuentes, preparación, validación y límites. Es la capa para comprobar trazabilidad, no la puerta de entrada pública al producto."
        : "This is where sources, preparation, validation, and limits are documented. It is the layer for traceability, not the public entry point to the product.",
  };
  const mobileNavItems = buildAdvancedMobileNavItems(language, advancedLabels);

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <AdvancedPageHeader language={language} pathname="/methodology" currentPage="methodology" labels={advancedLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.methodologyTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.methodologySubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {system?.model.improvement_pct_vs_best_baseline != null
                  ? `${system.model.improvement_pct_vs_best_baseline > 0 ? "+" : ""}${system.model.improvement_pct_vs_best_baseline.toLocaleString(language === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 1 })}% ${language === "es" ? "vs. referencia" : "vs. baseline"}`
                  : "-"}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{metrics?.horizon_hours ? `${metrics.horizon_hours}h` : "-"}</p>
              <p className="mt-3 text-sm text-soft/70">
                {language === "es"
                  ? `${system?.data_quality.station_count ?? 0} estaciones · ${system?.data_quality.pollutant_count ?? 0} contaminantes`
                  : `${system?.data_quality.station_count ?? 0} stations · ${system?.data_quality.pollutant_count ?? 0} pollutants`}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.trainingWindow}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatWindow(metrics?.training_period_start ?? null, metrics?.training_period_end ?? null)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {trainingDays != null
                  ? language === "es"
                    ? `${trainingDays} días de entrenamiento`
                    : `${trainingDays} training days`
                  : "-"}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.testWindow}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatWindow(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null)}</p>
              <p className="mt-3 text-sm text-soft/70">
                {testDays != null
                  ? language === "es"
                    ? `${testDays} días de validación`
                    : `${testDays} validation days`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <OperationalStatusStrip language={language} system={system} freshnessLabels={copy.freshness} currentPage="methodology" />

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <h2 className="text-2xl font-medium text-bone">{intro.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-soft/74">{intro.body}</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-2.5 text-sm font-medium text-soft transition hover:bg-white/10" href={`/about?lang=${language}#advanced`}>
            {intro.cta}
          </Link>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <DetailCard title={sections.sourcesTitle} items={sections.sources} />
          <DetailCard title={sections.etlTitle} items={sections.etl} />
          <DetailCard title={sections.validationTitle} items={sections.validation} />
          <DetailCard title={sections.featuresTitle} items={sections.features} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{sections.splitTitle}</h2>
            <p className="mt-5 text-sm leading-6 text-soft/74">{sections.splitNote}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.trainingWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(metrics?.training_period_start ?? null, metrics?.training_period_end ?? null)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.testWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null)}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <h2 className="text-2xl font-medium text-bone">{sections.evaluationTitle}</h2>
            <p className="mt-5 text-sm leading-6 text-soft/74">{sections.evaluationNote}</p>
            <div className="mt-5">
              <MetricBars items={metrics?.items ?? []} maeLabel={copy.metricMae} rmseLabel={copy.metricRmse} r2Label={copy.metricR2} />
            </div>
          </section>
        </div>

        <DetailCard title={sections.limitationsTitle} items={sections.limitations} />
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="methodology" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}