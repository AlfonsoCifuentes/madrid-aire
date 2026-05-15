import type { Language } from "@/lib/i18n";

type PublicRiskBand = "low" | "medium" | "high" | "very_high" | "unknown";

const PUBLIC_RISK_BANDS: Record<
  PublicRiskBand,
  {
    className: string;
    color: string;
    label: Record<Language, string>;
    range: string;
  }
> = {
  low: {
    className: "bg-[#80FFB2]/15 text-[#80FFB2] border border-[#80FFB2]/30",
    color: "#80FFB2",
    label: { es: "bajo", en: "low" },
    range: "0–80 µg/m³",
  },
  medium: {
    className: "bg-[#FFB000]/15 text-[#FFB000] border border-[#FFB000]/30",
    color: "#FFB000",
    label: { es: "medio", en: "medium" },
    range: "81–120 µg/m³",
  },
  high: {
    className: "bg-[#FF6B35]/15 text-[#FFB000] border border-[#FF6B35]/30",
    color: "#FF6B35",
    label: { es: "alto", en: "high" },
    range: "121–200 µg/m³",
  },
  very_high: {
    className: "bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30",
    color: "#F43F5E",
    label: { es: "muy alto", en: "very high" },
    range: "> 200 µg/m³",
  },
  unknown: {
    className: "bg-white/8 text-soft/55 border border-white/10",
    color: "rgba(255,255,255,0.35)",
    label: { es: "sin datos", en: "no data" },
    range: "-",
  },
};

const RISK_LEVEL_TO_PUBLIC_BAND: Record<string, PublicRiskBand> = {
  acceptable: "low",
  extreme: "very_high",
  good: "low",
  moderate: "medium",
  poor: "high",
  unhealthy: "very_high",
  unknown: "unknown",
  very_poor: "very_high",
  very_unhealthy: "very_high",
};

const ALERT_CATEGORY_LABELS: Record<string, Record<Language, string>> = {
  air_quality: { es: "calidad del aire", en: "air quality" },
  data: { es: "datos", en: "data" },
  forecast: { es: "previsión", en: "forecast" },
};

const ALERT_SEVERITY_LABELS: Record<string, Record<Language, string>> = {
  critical: { es: "crítica", en: "critical" },
  error: { es: "error", en: "error" },
  info: { es: "informativa", en: "info" },
  warning: { es: "aviso", en: "warning" },
};

const ALERT_TITLE_LABELS: Record<string, Record<Language, string>> = {
  "pico forecast 24h": { es: "Pico previsto 24 h", en: "24h forecast peak" },
};

const OPERATIONAL_LABELS: Record<string, Record<Language, string>> = {
  alerts_ready: { es: "alertas listas", en: "alerts ready" },
  cloudflare_d1: { es: "Cloudflare D1", en: "Cloudflare D1" },
  community_current_day: { es: "CSV oficial diario", en: "official daily CSV" },
  cron_pending_secret: { es: "falta secreto de cron", en: "cron secret missing" },
  cron_ready: { es: "cron configurado", en: "cron ready" },
  delayed: { es: "con retraso", en: "delayed" },
  foundation_ready: { es: "base lista", en: "foundation ready" },
  fresh: { es: "al día", en: "fresh" },
  local: { es: "local", en: "local" },
  local_model_v1_artifact: { es: "artefacto local modelo v1", en: "local model v1 artifact" },
  model_pending: { es: "modelo pendiente", en: "model pending" },
  model_v1_ready: { es: "modelo v1 listo", en: "model v1 ready" },
  observations_ready: { es: "observaciones listas", en: "observations ready" },
  predictions_pending: { es: "previsión pendiente", en: "predictions pending" },
  production: { es: "producción", en: "production" },
  quality_pending: { es: "calidad pendiente", en: "quality pending" },
  quality_ready: { es: "calidad validada", en: "quality ready" },
  quiet: { es: "sin alertas", en: "quiet" },
  stale: { es: "desactualizado", en: "stale" },
  system_pending: { es: "sistema pendiente", en: "system pending" },
  system_ready: { es: "sistema operativo", en: "system ready" },
  unknown: { es: "desconocido", en: "unknown" },
};

const PLACE_NAME_CORRECTIONS: Record<string, string> = {
  "san martin de valdeiglesias": "San Martín de Valdeiglesias",
  "san sebastian de los reyes": "San Sebastián de los Reyes",
};

function humanizeMachineValue(value: string) {
  return value.replaceAll("_", " ").trim();
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLookupKey(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolvePublicRiskBand(value: string | null | undefined): PublicRiskBand {
  if (!value) {
    return "unknown";
  }

  return RISK_LEVEL_TO_PUBLIC_BAND[value.toLowerCase()] ?? "unknown";
}

export function getPublicRiskClassName(value: string | null | undefined) {
  return PUBLIC_RISK_BANDS[resolvePublicRiskBand(value)].className;
}

export function getPublicRiskColor(value: string | null | undefined) {
  return PUBLIC_RISK_BANDS[resolvePublicRiskBand(value)].color;
}

export function getPublicRiskRange(band: PublicRiskBand) {
  return PUBLIC_RISK_BANDS[band].range;
}

export function getPublicRiskScale(language: Language) {
  return (["low", "medium", "high", "very_high"] as const).map((band) => ({
    band,
    color: PUBLIC_RISK_BANDS[band].color,
    label: PUBLIC_RISK_BANDS[band].label[language],
    range: PUBLIC_RISK_BANDS[band].range,
  }));
}

export function formatPublicModelName(value: string | null | undefined, language: Language) {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("hist_gradient_boosting")) {
    return language === "es" ? "Pronóstico a 24 h" : "24h forecast";
  }
  if (normalized === "persistence") {
    return language === "es" ? "Tendencia reciente" : "Recent trend";
  }
  if (normalized === "same_hour_yesterday") {
    return language === "es" ? "Misma hora de ayer" : "Same hour yesterday";
  }
  if (normalized === "rolling_mean_24h") {
    return language === "es" ? "Media diaria" : "Daily average";
  }

  return value ? humanizeMachineValue(value) : "-";
}

export function formatHoursAhead(hours: number | null | undefined, language: Language, compact = false) {
  if (hours == null) {
    return "-";
  }

  if (compact) {
    return language === "es" ? `${hours} h` : `${hours}h`;
  }

  return language === "es" ? `Dentro de ${hours} h` : `In ${hours}h`;
}

export function formatRiskLabel(value: string | null | undefined, language: Language) {
  return PUBLIC_RISK_BANDS[resolvePublicRiskBand(value)].label[language];
}

export function formatAlertCategory(value: string | null | undefined, language: Language) {
  if (!value) {
    return language === "es" ? "datos" : "data";
  }

  const normalized = value.toLowerCase();
  return ALERT_CATEGORY_LABELS[normalized]?.[language] ?? humanizeMachineValue(normalized);
}

export function formatAlertSeverity(value: string | null | undefined, language: Language) {
  if (!value) {
    return language === "es" ? "informativa" : "info";
  }

  const normalized = value.toLowerCase();
  return ALERT_SEVERITY_LABELS[normalized]?.[language] ?? humanizeMachineValue(normalized);
}

export function formatAlertTitle(value: string | null | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const normalized = normalizeWhitespace(value).toLowerCase();
  return ALERT_TITLE_LABELS[normalized]?.[language] ?? normalizeWhitespace(value);
}

export function formatAlertBody(value: string | null | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const normalized = normalizeWhitespace(value);
  if (language !== "es") {
    return normalized;
  }

  return normalized.replace(/'stale'/gi, "desactualizado").replace(/\bstale\b/gi, "desactualizado").replace(/\bforecast\b/gi, "previsión");
}

export function formatOperationalLabel(value: string | null | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const normalized = value.toLowerCase();
  return OPERATIONAL_LABELS[normalized]?.[language] ?? humanizeMachineValue(normalized);
}

export function formatSourceLabel(value: string | null | undefined, language: Language) {
  return formatOperationalLabel(value, language);
}

export function formatPlaceName(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const normalized = normalizeWhitespace(value);
  return PLACE_NAME_CORRECTIONS[normalizeLookupKey(normalized)] ?? normalized;
}