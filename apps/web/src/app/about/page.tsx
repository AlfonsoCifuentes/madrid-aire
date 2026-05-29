import Link from "next/link";

import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PublicPageHeader, buildPublicMobileNavItems, type PublicNavLabels } from "@/components/PublicPageHeader";
import { getDashboardPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";
import { formatPlaceName } from "@/lib/presentation";

type AboutPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

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

type RouteCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
  cta: string;
};

function RouteCard({ href, eyebrow, title, description, accent, cta }: RouteCardProps) {
  return (
    <Link className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere transition hover:bg-white/10" href={href}>
      <p className="eyebrow text-soft/55">{eyebrow}</p>
      <h2 className="mt-4 text-2xl font-medium text-bone">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-soft/72">{description}</p>
      {accent && <p className="mt-5 font-data text-xs uppercase tracking-[0.18em] text-lime/80">{accent}</p>}
      <p className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-soft/80">{cta}</p>
    </Link>
  );
}

type GuideCardProps = {
  title: string;
  body: string;
};

function GuideCard({ title, body }: GuideCardProps) {
  return (
    <article className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
      <h2 className="text-xl font-medium text-bone">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-soft/74">{body}</p>
    </article>
  );
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const locale = language === "es" ? "es-ES" : "en-GB";
  const copy = copyByLanguage[language];
  const dashboard = await getDashboardPayload();
  const summary = dashboard.summary;
  const worstStationMeta = dashboard.stations?.items.find((item) => item.station_id === summary?.worst_station_id) ?? null;
  const worstStationLabel = worstStationMeta?.name
    ? formatPlaceName(worstStationMeta.name)
    : worstStationMeta?.municipality
    ? formatPlaceName(worstStationMeta.municipality)
    : summary?.worst_station_id ?? "-";
  const publicRoutes = [
    {
      href: `/dashboard?lang=${language}`,
      eyebrow: language === "es" ? "Empieza aquí" : "Start here",
      title: copy.dashboardTitle,
      description:
        language === "es"
          ? "La forma más rápida de saber qué punto registra el valor más alto y cuándo se actualizó por última vez la red."
          : "The fastest way to see which location has the highest reading and when the network last updated.",
      accent: language === "es" ? "Útil si solo quieres una respuesta rápida." : "Best when you want a quick answer.",
    },
    {
      href: `/map?lang=${language}`,
      eyebrow: language === "es" ? "Sitúate" : "Get your bearings",
      title: copy.mapPageTitle,
      description:
        language === "es"
          ? "Mira qué estaciones te quedan cerca y compara de forma visual cómo cambia el aire entre zonas."
          : "See which stations are near you and visually compare how the air changes across areas.",
      accent: language === "es" ? "Útil si quieres entender el reparto por zonas." : "Best when you want the geographic picture.",
    },
    {
      href: `/stations?lang=${language}`,
      eyebrow: language === "es" ? "Compara" : "Compare",
      title: copy.stationsPageTitle,
      description:
        language === "es"
          ? "Abre una estación concreta para ver ubicación, última lectura e histórico reciente sin perderte en jerga técnica."
          : "Open a specific station to see location, latest reading, and recent history without technical jargon.",
      accent:
        language === "es"
          ? `Ahora destaca ${worstStationLabel}.`
          : `${worstStationLabel} is currently the highest point.`,
    },
    {
      href: `/predictions?lang=${language}`,
      eyebrow: language === "es" ? "Anticípate" : "Plan ahead",
      title: copy.predictionsTitle,
      description:
        language === "es"
          ? "Consulta una orientación para las próximas horas y compárala con la última lectura disponible."
          : "Check an indicative outlook for the next few hours and compare it with the latest reading.",
      accent: language === "es" ? "Útil para planificar salidas o desplazamientos." : "Best when planning trips or outdoor time.",
    },
  ];
  const plainLanguageCards = [
    {
      title: language === "es" ? "Qué significa NO₂" : "What NO₂ means",
      body:
        language === "es"
          ? "NO₂ es un contaminante muy ligado al tráfico. Aquí se usa como indicador principal porque cambia rápido entre horas y entre zonas de Madrid."
          : "NO₂ is a pollutant strongly linked to traffic. It is used here as the main indicator because it can change quickly by hour and by area across Madrid.",
    },
    {
      title: language === "es" ? "Qué significa la última actualización" : "What the latest update means",
      body:
        language === "es"
          ? "Te dice cuándo llegó la última lectura oficial. Si han pasado muchas horas, la foto sigue siendo útil como referencia, pero ya no describe el momento exacto."
          : "It tells you when the last official reading arrived. If many hours have passed, the view is still useful as context, but it no longer describes the exact current moment.",
    },
    {
      title: language === "es" ? "Qué significa una previsión a 24 h" : "What a 24h forecast means",
      body:
        language === "es"
          ? "Es una orientación para anticipar cambios durante el día. Sirve para planificar, pero no sustituye a los avisos oficiales ni a una recomendación sanitaria."
          : "It is a guide to anticipate changes through the day. It helps with planning, but it does not replace official alerts or health advice.",
    },
  ];
  const quickStartCards = [
    {
      title: language === "es" ? "Si solo quieres saber cómo está el aire ahora" : "If you only want to know how the air looks right now",
      body:
        language === "es"
          ? "Empieza por el Resumen del aire. En unos segundos verás el punto con la lectura más alta, la hora de actualización y el estado general de la red."
          : "Start with the Overview. In a few seconds you will see the highest reading, the update time, and the overall network status.",
    },
    {
      title: language === "es" ? "Si quieres mirar tu zona o un municipio" : "If you want to inspect your area or municipality",
      body:
        language === "es"
          ? "Ve al mapa si prefieres una vista espacial y a Estaciones si quieres comparar nombres, tipos de entorno y una ficha concreta."
          : "Go to the map if you prefer a spatial view, and to Stations if you want to compare places, surroundings, and a specific station card.",
    },
    {
      title: language === "es" ? "Si quieres planificar las próximas horas" : "If you want to plan the next few hours",
      body:
        language === "es"
          ? "Abre Previsión. Ahí verás cómo podría cambiar el NO₂ y si la tendencia sube, baja o se mantiene."
          : "Open Forecast. There you can see how NO₂ might change and whether the trend is rising, falling, or holding steady.",
    },
  ];
  const technicalRoutes = [
    {
      href: `/model?lang=${language}`,
      title: copy.modelTitle,
      description: copy.aboutModelDesc,
      eyebrow: copy.aboutTechnicalLabel,
      accent: language === "es" ? "Precisión y límites de la previsión." : "Accuracy and forecast limits.",
    },
    {
      href: `/methodology?lang=${language}`,
      title: copy.methodologyTitle,
      description: copy.aboutMethodologyDesc,
      eyebrow: copy.aboutTechnicalLabel,
      accent:
        summary?.latest_timestamp
          ? `${language === "es" ? "Última señal usada" : "Latest signal used"}: ${formatMoment(summary.latest_timestamp, locale)}`
          : undefined,
    },
    {
      href: `/reports?lang=${language}`,
      title: copy.reportsTitle,
      description: copy.aboutReportsDesc,
      eyebrow: copy.aboutTechnicalLabel,
      accent: language === "es" ? "Lectura interpretada y contexto adicional." : "Interpretation and additional context.",
    },
    {
      href: `/system?lang=${language}`,
      title: copy.systemTitle,
      description: copy.aboutSystemDesc,
      eyebrow: copy.aboutTechnicalLabel,
      accent: language === "es" ? "Actualizaciones, alertas y mantenimiento." : "Updates, alerts, and maintenance.",
    },
  ];
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
        <PublicPageHeader language={language} pathname="/about" currentPage="about" labels={navigationLabels} />

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutEyebrow}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.aboutTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.aboutSubtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{language === "es" ? "Estaciones que puedes consultar" : "Stations you can inspect"}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.station_count ?? 0}</p>
              <p className="mt-2 text-sm text-soft/60">{language === "es" ? "Puntos con lectura reciente" : "Locations with recent readings"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{language === "es" ? "Contaminantes visibles" : "Visible pollutants"}</p>
              <p className="mt-4 font-data text-3xl text-bone">{summary?.pollutant_count ?? 0}</p>
              <p className="mt-2 text-sm text-soft/60">NO₂ · O₃ · PM10 · PM2.5</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(summary?.latest_timestamp, locale)}</p>
              <p className="mt-2 text-sm text-soft/60">{copy.freshness[summary?.freshness ?? "pending"] ?? copy.freshness.pending}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.worstStation}</p>
              <p className="mt-4 font-data text-2xl text-bone">{worstStationLabel}</p>
              <p className="mt-2 text-sm text-soft/60">
                {summary?.worst_value != null
                  ? `NO₂ · ${summary.worst_value.toLocaleString(locale, { maximumFractionDigits: 1 })} µg/m³`
                  : language === "es"
                  ? "Sin valor destacado"
                  : "No highlighted value"}
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.aboutPublicRoutesTitle}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft/74">{copy.aboutPublicRoutesBody}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {publicRoutes.map((route) => (
              <RouteCard
                key={route.href}
                href={route.href}
                eyebrow={route.eyebrow}
                title={route.title}
                description={route.description}
                accent={route.accent}
                cta={language === "es" ? "Abrir esta vista" : "Open this view"}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{language === "es" ? "Cómo interpretar lo que ves" : "How to read what you see"}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft/74">
              {language === "es"
                ? "Estas tres ideas bastan para leer la página sin conocimientos previos: qué indicador manda, qué significa la hora de actualización y cómo usar la previsión sin sobreinterpretarla."
                : "These three ideas are enough to read the site without prior knowledge: what the main indicator means, what the update time tells you, and how to use the forecast without overreading it."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {plainLanguageCards.map((item) => (
              <GuideCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{language === "es" ? "Si quieres decidir rápido" : "If you want to decide quickly"}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft/74">
              {language === "es"
                ? "No hace falta recorrer toda la web. Elige la ruta según tu necesidad inmediata y vuelve al detalle técnico solo si de verdad lo necesitas."
                : "You do not need to browse the whole site. Pick a route based on your immediate need and only go to the technical detail if you truly need it."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickStartCards.map((item) => (
              <GuideCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </section>

        <details id="advanced" className="glass-panel rounded-[2rem] p-6 shadow-atmosphere group">
          <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-soft/55">{copy.aboutTechnicalRoutesTitle}</p>
              <p className="mt-3 max-w-3xl text-base leading-7 text-soft/74">{copy.aboutTechnicalRoutesBody}</p>
            </div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-soft/80 transition group-open:bg-white/[0.08]">
              {language === "es" ? "Abrir detalle técnico" : "Open technical detail"}
            </span>
          </summary>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {technicalRoutes.map((route) => (
              <RouteCard
                key={route.href}
                href={route.href}
                eyebrow={route.eyebrow}
                title={route.title}
                description={route.description}
                accent={route.accent}
                cta={language === "es" ? "Abrir detalle" : "Open details"}
              />
            ))}
          </div>
        </details>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="about" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}