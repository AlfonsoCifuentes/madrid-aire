import Link from "next/link";

import { SystemStatusEnvelope } from "@/lib/api";
import { Language } from "@/lib/i18n";

type OperationalStatusStripProps = {
  language: Language;
  system: SystemStatusEnvelope | null;
  freshnessLabels: Record<string, string>;
  currentPage?: "about" | "model" | "methodology" | "reports" | "system";
};

function formatMoment(value: string | null | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(timestamp);
}

function buildStatusNarrative(
  system: SystemStatusEnvelope | null,
  language: Language,
  freshnessLabels: Record<string, string>,
) {
  if (!system) {
    return {
      eyebrow: language === "es" ? "Estado técnico" : "Technical status",
      title: language === "es" ? "Estado operativo no disponible" : "Operational status unavailable",
      body:
        language === "es"
          ? "La capa Advanced no ha podido recuperar el estado del pipeline en esta carga."
          : "The Advanced layer could not retrieve pipeline status for this request.",
      tone: "border-white/10 bg-white/[0.04] text-soft",
    };
  }

  const latestObservation = formatMoment(system.pipeline.latest_timestamp, language);
  const freshness = freshnessLabels[system.data_quality.freshness] ?? system.data_quality.freshness;
  const usingD1 = system.pipeline.source === "cloudflare_d1";

  if (usingD1 && system.data_quality.freshness === "stale") {
    return {
      eyebrow: language === "es" ? "Cloudflare D1 + ingestión" : "Cloudflare D1 + ingestion",
      title:
        language === "es"
          ? "Cloudflare D1 responde, pero la señal llega con retraso"
          : "Cloudflare D1 is responding, but the signal is lagging",
      body:
        language === "es"
          ? `La API ya está leyendo desde Cloudflare D1, aunque la última observación válida sigue en ${latestObservation}. El punto a revisar ahora es el ciclo de ingestión protegido, no la conexión a la base.`
          : `The API is already reading from Cloudflare D1, although the last valid observation is still ${latestObservation}. The next point to review is the protected ingestion cycle, not database connectivity.`,
      tone: "border-[#f2d06b]/30 bg-[#f2d06b]/10 text-[#fff1bf]",
    };
  }

  if (usingD1 && system.data_quality.freshness === "delayed") {
    return {
      eyebrow: language === "es" ? "Cloudflare D1 + ingestión" : "Cloudflare D1 + ingestion",
      title:
        language === "es"
          ? "Cloudflare D1 está activo con un pequeño retraso"
          : "Cloudflare D1 is active with a modest delay",
      body:
        language === "es"
          ? `La lectura operativa sale de Cloudflare D1 y la frescura actual se marca como ${freshness}. Conviene vigilar el siguiente refresco antes de considerar estable la ingestión.`
          : `Operational readings come from Cloudflare D1 and the current freshness is marked as ${freshness}. It is worth watching the next refresh before treating ingestion as stable.`,
      tone: "border-[#f2d06b]/20 bg-[#f2d06b]/8 text-[#fff1bf]",
    };
  }

  if (usingD1) {
    return {
      eyebrow: language === "es" ? "Cloudflare D1 operativo" : "Cloudflare D1 operational",
      title:
        language === "es"
          ? "Cloudflare D1 gobierna la señal actual"
          : "Cloudflare D1 is driving the current signal",
      body:
        language === "es"
          ? `La fuente observacional activa es Cloudflare D1 y la frescura actual se resume como ${freshness}.`
          : `The active observation source is Cloudflare D1 and current freshness is summarized as ${freshness}.`,
      tone: "border-lime/30 bg-lime/10 text-[#eff8c7]",
    };
  }

  if (system.cron.cloudflare_d1_configured) {
    return {
      eyebrow: language === "es" ? "Modo mixto" : "Mixed mode",
      title:
        language === "es"
          ? "D1 está configurado, pero no es la fuente operativa"
          : "D1 is configured, but it is not the active source",
      body:
        language === "es"
          ? `La señal actual sigue entrando por ${system.pipeline.source}. Cloudflare D1 está listo, pero todavía no gobierna la lectura activa.`
          : `The current signal still comes through ${system.pipeline.source}. Cloudflare D1 is configured, but it does not yet govern the live reading path.`,
      tone: "border-white/10 bg-white/[0.04] text-soft",
    };
  }

  return {
    eyebrow: language === "es" ? "Modo local-first" : "Local-first mode",
    title:
      language === "es"
        ? "La instalación sigue apoyándose en artefactos locales"
        : "The installation is still relying on local artifacts",
    body:
      language === "es"
        ? "Cloudflare D1 todavía no está configurado como parte operativa del flujo, así que la lectura actual depende de artefactos locales y del último snapshot disponible."
        : "Cloudflare D1 is not yet configured as an operational part of the flow, so the current reading still depends on local artifacts and the latest available snapshot.",
    tone: "border-white/10 bg-white/[0.04] text-soft",
  };
}

export function OperationalStatusStrip({ language, system, freshnessLabels, currentPage }: OperationalStatusStripProps) {
  const yesLabel = language === "es" ? "sí" : "yes";
  const noLabel = language === "es" ? "no" : "no";
  const narrative = buildStatusNarrative(system, language, freshnessLabels);
  const facts = system
    ? [
        {
          label: language === "es" ? "Entorno" : "Environment",
          value: system.environment,
          note: language === "es" ? "lectura declarada por la API" : "reported by the API",
        },
        {
          label: language === "es" ? "Fuente observacional" : "Observation source",
          value: system.pipeline.source,
          note: language === "es" ? "ruta activa de lectura" : "active read path",
        },
        {
          label: language === "es" ? "Última observación válida" : "Latest valid observation",
          value: formatMoment(system.pipeline.latest_timestamp, language),
          note: freshnessLabels[system.data_quality.freshness] ?? system.data_quality.freshness,
        },
        {
          label: language === "es" ? "Ingestión remota" : "Remote ingest",
          value: system.cron.status,
          note: `D1 ${system.cron.cloudflare_d1_configured ? yesLabel : noLabel} · jobs ${system.cron.jobs_configured ? yesLabel : noLabel}`,
        },
      ]
    : [];

  return (
    <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-soft/55">{language === "es" ? "Lectura operativa actual" : "Current operational read"}</p>
          <h2 className="mt-3 text-2xl font-medium text-bone">
            {language === "es" ? "Qué está gobernando el sistema ahora" : "What is governing the system right now"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentPage !== "system" ? (
            <Link
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-soft/78 transition hover:bg-white/[0.08] hover:text-soft"
              href={`/system?lang=${language}`}
            >
              {language === "es" ? "Abrir estado operativo" : "Open system status"}
            </Link>
          ) : null}
          {currentPage !== "about" ? (
            <Link
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-soft/78 transition hover:bg-white/[0.08] hover:text-soft"
              href={`/about?lang=${language}#advanced`}
            >
              {language === "es" ? "Volver a Advanced" : "Back to Advanced"}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className={`rounded-[1.75rem] border p-5 ${narrative.tone}`}>
          <p className="eyebrow">{narrative.eyebrow}</p>
          <h3 className="mt-3 text-2xl font-medium">{narrative.title}</h3>
          <p className="mt-4 text-sm leading-6 text-current/88">{narrative.body}</p>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="eyebrow text-soft/55">{fact.label}</p>
              <p className="mt-3 font-data text-sm text-bone">{fact.value}</p>
              <p className="mt-2 text-xs leading-5 text-soft/55">{fact.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}