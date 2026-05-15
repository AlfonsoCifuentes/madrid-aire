import { AdvancedPageHeader, buildAdvancedMobileNavItems, type AdvancedNavLabels } from "@/components/AdvancedPageHeader";
import { MetricBars } from "@/components/MetricBars";
import { ModelErrorChart } from "@/components/ModelErrorChart";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { OperationalStatusStrip } from "@/components/OperationalStatusStrip";
import { getModelMetricsPayload, getSystemStatusPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type ModelPageProps = {
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

function buildModelSections(language: "es" | "en") {
  if (language === "es") {
    return {
      featuresTitle: "Características del modelo",
      features: [
        {
          title: "Aprendizaje supervisado",
          body: "Se entrena con observaciones reales de la red oficial, no con datos sintéticos ni simulados.",
        },
        {
          title: "Horizonte de 24 horas",
          body: "Genera previsiones en pasos horarios para las próximas 24 horas desde el momento de generación.",
        },
        {
          title: "Variables temporales y contexto de estación",
          body: "Incluye hora del día, día de la semana, mes, indicador de fin de semana y codificación por estación como base explicativa del modelo.",
        },
        {
          title: "Comparación con referencias simples",
          body: "Cada ejecución se evalúa contra la tendencia reciente, la hora de ayer y la media de 24 h para validar la mejora real.",
        },
      ],
      limitationsTitle: "Límites del modelo v1",
      limitations: [
        {
          title: "Sin episodios extremos validados",
          body: "Los datos de entrenamiento no cubren episodios de contaminación severa o eventos meteorológicos excepcionales.",
        },
        {
          title: "Cobertura limitada a la red oficial",
          body: "El modelo genera previsiones por estación para la red oficial, pero no interpola fuera de esos puntos ni crea superficies continuas sobre todo Madrid.",
        },
        {
          title: "Sin actualización en tiempo real",
          body: "Las previsiones se regeneran en ciclos programados, no con cada nueva lectura oficial.",
        },
        {
          title: "Orientativo, no regulatorio",
          body: "Esta previsión es una referencia técnica interna. No sustituye avisos oficiales de calidad del aire.",
        },
      ],
    };
  }

  return {
    featuresTitle: "Model features",
    features: [
      {
        title: "Supervised learning",
        body: "Trained on real readings from the official network, not on synthetic or simulated data.",
      },
      {
        title: "24-hour horizon",
        body: "Produces hourly forecasts for the next 24 hours from the moment of generation.",
      },
      {
        title: "Temporal variables and station context",
        body: "Includes time of day, day of week, month, weekend flag, and station encoding as the model's explanatory base.",
      },
      {
        title: "Comparison against simple baselines",
        body: "Each run is evaluated against the recent trend, the same hour yesterday, and the 24-hour average to validate genuine improvement.",
      },
    ],
    limitationsTitle: "Model v1 limits",
    limitations: [
      {
        title: "No validated extreme episodes",
        body: "Training data does not cover severe pollution episodes or exceptional meteorological events.",
      },
      {
        title: "Coverage limited to the official network",
        body: "The model produces station-level forecasts for the official network, but it does not interpolate beyond those points or generate a continuous surface across Madrid.",
      },
      {
        title: "No real-time updates",
        body: "Forecasts are regenerated on scheduled cycles, not with each new official reading.",
      },
      {
        title: "Indicative, not regulatory",
        body: "This forecast is an internal technical reference. It does not replace official air quality warnings.",
      },
    ],
  };
}

function buildMetricNotes(language: "es" | "en") {
  if (language === "es") {
    return [
      { title: "MAE", body: "Error medio esperado entre la previsión y la medición real." },
      { title: "RMSE", body: "Cómo de grandes pueden ser los fallos cuando la situación cambia más de lo habitual." },
      { title: "R²", body: "Cuánta parte de la variación real consigue explicar el modelo." },
    ];
  }

  return [
    { title: "MAE", body: "Average expected gap between the forecast and the real measurement." },
    { title: "RMSE", body: "How large the misses can become when conditions shift more sharply." },
    { title: "R²", body: "How much of the real-world variation the model is able to explain." },
  ];
}

export default async function ModelPage({ searchParams }: ModelPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const [metrics, system] = await Promise.all([getModelMetricsPayload(), getSystemStatusPayload()]);
  const metricNotes = buildMetricNotes(language);
  const modelSections = buildModelSections(language);
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
        ? "Esta capa reúne modelo, método, informes y sistema como segunda lectura del producto. Si buscas una lectura pública, vuelve a Resumen o a la Guía."
        : "This layer gathers model, method, reports, and system as the product's second reading. If you want the public view, go back to Overview or Guide.",
  };
  const mobileNavItems = buildAdvancedMobileNavItems(language, advancedLabels);

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <AdvancedPageHeader language={language} pathname="/model" currentPage="model" labels={advancedLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutTechnicalLabel}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.modelTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.modelSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
              <p className="mt-4 font-data text-3xl text-bone">{formatModelName(metrics?.selected_baseline, language)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{metrics?.horizon_hours ?? "-"}h</p>
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

        <OperationalStatusStrip language={language} system={system} freshnessLabels={copy.freshness} currentPage="model" />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricNotes.map((item) => (
            <div key={item.title} className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{item.title}</p>
              <p className="mt-4 text-sm leading-6 text-soft/74">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow text-soft/60">NO2 · 24h</p>
            <p className="font-data text-sm text-soft/55">{language === "es" ? "métricas comparadas" : "compared metrics"}</p>
          </div>
          <div className="mt-5">
            <MetricBars items={metrics?.items ?? []} maeLabel={copy.metricMae} rmseLabel={copy.metricRmse} r2Label={copy.metricR2} />
          </div>
          <p className="mt-5 text-sm leading-6 text-soft/70">{copy.notOfficialForecast}</p>
        </section>

        <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="eyebrow text-soft/60">NO2 · {language === "es" ? "error visual por modelo" : "error chart by model"}</p>
            <p className="font-data text-sm text-soft/55">{language === "es" ? "MAE y RMSE comparados" : "MAE & RMSE compared"}</p>
          </div>
          <ModelErrorChart
            items={metrics?.items ?? []}
            maeLabel={copy.metricMae}
            rmseLabel={copy.metricRmse}
            selectedBaseline={metrics?.selected_baseline}
            language={language}
          />
        </section>

        <section>
          <p className="eyebrow mb-5 text-soft/55">{modelSections.featuresTitle}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {modelSections.features.map((item) => (
              <div key={item.title} className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{item.title}</p>
                <p className="mt-4 text-sm leading-6 text-soft/74">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-5 text-soft/55">{modelSections.limitationsTitle}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {modelSections.limitations.map((item) => (
              <div key={item.title} className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
                <p className="eyebrow text-soft/55">{item.title}</p>
                <p className="mt-4 text-sm leading-6 text-soft/74">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="model" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}
