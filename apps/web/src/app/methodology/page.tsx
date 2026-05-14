import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MetricBars } from "@/components/MetricBars";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
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
      cta: "Ir a Acerca de",
    };
  }

  return {
    title: "Before the technical detail",
    body: "If you only want to interpret current conditions, start with the overview, the map, or the forecast. This page goes through the full process: data, preparation, validation, and limits.",
    cta: "Go to About",
  };
}

function buildSections(language: "es" | "en", stationCount: number, pollutantCount: number) {
  if (language === "es") {
    return {
      sourcesTitle: "Sources",
      etlTitle: "ETL",
      validationTitle: "Validation",
      featuresTitle: "Feature engineering",
      splitTitle: "Temporal split",
      evaluationTitle: "Evaluation",
      limitationsTitle: "Limitations",
      sources: [
        `Comunidad de Madrid: históricos oficiales 2025 y 2026 para calidad del aire.`,
        `CSV oficial de día actual para extender la señal operativa del slice local-first.`,
        `Metadatos oficiales de estación para municipio, dirección, zona y coordenadas.`,
        `Meteorología documentada en el bible, pero todavía no integrada en el modelo v1.`,
      ],
      etl: [
        "Lectura flexible de CSV oficiales con pandas.",
        "Normalización wide-to-long a observaciones por estación, contaminante y hora.",
        "Merge local de todos los snapshots `.normalized.csv` con deduplicación por timestamp.",
        "Asignación conservadora de `risk_level` y descarte explícito de valores inválidos.",
      ],
      validation: [
        `Cobertura observacional actual: ${stationCount} estaciones y ${pollutantCount} contaminantes activos.`,
        "Sin estaciones sintéticas, sin coordenadas inventadas y sin forecast en frontend.",
        "Chequeos de frescura y consistencia antes de exponer `/api/latest`, `/api/summary` y `/api/system-status`.",
        "Artefactos ML publicados solo tras split temporal honesto y métricas comparadas contra baseline.",
      ],
      features: [
        "Variables temporales: hora, día de la semana, mes e indicador de fin de semana.",
        "Codificación de estación para capturar diferencias estructurales entre nodos oficiales.",
        "Lags de 1h, 3h, 6h, 24h y 168h sobre la señal de NO2.",
        "Rolling means de 3h, 6h y 24h calculadas por estación sin fuga temporal.",
      ],
      evaluationNote: "Comparativa real entre el predictor seleccionado y los baselines de referencia sobre la ventana de test.",
      splitNote: "La validación local actual es train 2025 / test 2026; todavía no existe una ventana intermedia persistida.",
      limitations: [
        "La API pública todavía no expone error por estación aunque el artefacto sí lo calcula.",
        "La ruta operativa sigue siendo local-first; Cloudflare D1 y el cron remoto aún no gobiernan el flujo real.",
        "No hay features meteorológicas en el modelo v1 actual.",
        "Los reports longitudinales todavía no tienen persistencia semanal histórica.",
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
      "Official current-day CSV used to extend the operational signal in the local-first slice.",
      "Official station metadata for municipality, address, zone, and coordinates.",
      "Weather is documented in the bible but not integrated into model v1 yet.",
    ],
    etl: [
      "Flexible ingestion of official CSV files with pandas.",
      "Wide-to-long normalization into station, pollutant, and hourly observations.",
      "Local merge of all `.normalized.csv` snapshots with timestamp-level deduplication.",
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
    splitNote: "The current local validation uses train 2025 / test 2026; an intermediate persisted validation window does not exist yet.",
    limitations: [
      "The public API still does not expose station-level error even though the artifact computes it.",
      "The operational path remains local-first; Cloudflare D1 and remote cron do not govern the live flow yet.",
      "Weather features are not part of the current v1 model.",
      "Longitudinal reports still lack persisted weekly history.",
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
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "model", href: `/model?lang=${language}`, label: copy.mobileNavModel },
    { key: "methodology", href: `/methodology?lang=${language}`, label: copy.mobileNavMethodology },
    { key: "reports", href: `/reports?lang=${language}`, label: copy.mobileNavReports },
    { key: "system", href: `/system?lang=${language}`, label: copy.mobileNavSystem },
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/about?lang=${language}`}>
              {copy.openAbout}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/model?lang=${language}`}>
              {copy.openModel}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/system?lang=${language}`}>
              {copy.openSystem}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/reports?lang=${language}`}>
              {copy.openReports}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/methodology" />
          </div>
        </header>

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
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{metrics?.horizon_hours ? `${metrics.horizon_hours}h` : "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.trainingWindow}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatWindow(metrics?.training_period_start ?? null, metrics?.training_period_end ?? null)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.testWindow}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatWindow(metrics?.test_period_start ?? null, metrics?.test_period_end ?? null)}</p>
            </div>
          </div>
        </div>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <h2 className="text-2xl font-medium text-bone">{intro.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-soft/74">{intro.body}</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-2.5 text-sm font-medium text-soft transition hover:bg-white/10" href={`/about?lang=${language}`}>
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