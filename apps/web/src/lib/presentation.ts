import type { Language } from "@/lib/i18n";

const RISK_LABELS: Record<string, Record<Language, string>> = {
  acceptable: { es: "aceptable", en: "acceptable" },
  extreme: { es: "extremo", en: "extreme" },
  good: { es: "bueno", en: "good" },
  moderate: { es: "moderado", en: "moderate" },
  poor: { es: "deficiente", en: "poor" },
  unhealthy: { es: "insalubre", en: "unhealthy" },
  unknown: { es: "desconocido", en: "unknown" },
  very_poor: { es: "muy deficiente", en: "very poor" },
  very_unhealthy: { es: "muy insalubre", en: "very unhealthy" },
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

export function formatRiskLabel(value: string | null | undefined, language: Language) {
  if (!value) {
    return RISK_LABELS.unknown[language];
  }

  const normalized = value.toLowerCase();
  return RISK_LABELS[normalized]?.[language] ?? humanizeMachineValue(normalized);
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