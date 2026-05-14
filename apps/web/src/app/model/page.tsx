import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MetricBars } from "@/components/MetricBars";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { getModelMetricsPayload } from "@/lib/api";
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
          title: "Variables meteorológicas y temporales",
          body: "Incluye hora del día, día de la semana y temperatura como variables explicativas principales.",
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
          title: "Sin cobertura espacial completa",
          body: "El modelo produce una previsión única para la red, no valores individuales para cada estación.",
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
        title: "Meteorological and temporal variables",
        body: "Includes time of day, day of week, and temperature as the main explanatory variables.",
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
        title: "No full spatial coverage",
        body: "The model produces a single network-wide forecast, not individual values per station.",
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
  const metrics = await getModelMetricsPayload();
  const metricNotes = buildMetricNotes(language);
  const modelSections = buildModelSections(language);
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
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/dashboard?lang=${language}`}>
              {copy.dashboardTitle}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/stations?lang=${language}`}>
              {copy.openStations}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/predictions?lang=${language}`}>
              {copy.openPredictions}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/system?lang=${language}`}>
              {copy.openSystem}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/methodology?lang=${language}`}>
              {copy.openMethodology}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/reports?lang=${language}`}>
              {copy.openReports}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/model" />
          </div>
        </header>

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

        <section className="grid gap-4 md:grid-cols-3">
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
