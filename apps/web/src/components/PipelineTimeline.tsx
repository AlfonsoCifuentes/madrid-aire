/**
 * PipelineTimeline — renders the 4 pipeline stages as a horizontal (desktop)
 * or vertical (mobile) status flow, using the SystemStatusEnvelope fields.
 *
 * Stages: ETL → Data Quality → Predictions → Model
 * Pure SVG/HTML, no external chart library.
 */

import { type SystemStatusEnvelope } from "@/lib/api";
import { formatOperationalLabel } from "@/lib/presentation";

type PipelineTimelineProps = {
  system: SystemStatusEnvelope | null;
  language?: "es" | "en";
  className?: string;
};

type StageStatus = "ok" | "warning" | "error" | "pending" | "unknown";

function resolveStatus(raw: string | null | undefined): StageStatus {
  if (!raw) return "unknown";
  const s = raw.toLowerCase();
  if (s.includes("ok") || s.includes("live") || s.includes("complete") || s.includes("ready")) return "ok";
  if (s.includes("warn") || s.includes("stale") || s.includes("partial")) return "warning";
  if (s.includes("error") || s.includes("fail") || s.includes("unavail")) return "error";
  if (s.includes("pend") || s.includes("foundation")) return "pending";
  return "unknown";
}

function statusColor(status: StageStatus): string {
  switch (status) {
    case "ok": return "#80FFB2";
    case "warning": return "#FFB000";
    case "error": return "#FF6B35";
    case "pending": return "#D8FF4F";
    default: return "#8B949E";
  }
}

function statusDot(status: StageStatus): string {
  // Ring + fill classes
  switch (status) {
    case "ok": return "bg-[#80FFB2] shadow-[0_0_8px_#80FFB240]";
    case "warning": return "bg-[#FFB000] shadow-[0_0_8px_#FFB00040]";
    case "error": return "bg-[#FF6B35] shadow-[0_0_8px_#FF6B3540]";
    case "pending": return "bg-[#D8FF4F] shadow-[0_0_8px_#D8FF4F30]";
    default: return "bg-[#8B949E]";
  }
}

type Stage = {
  key: string;
  label: string;
  labelEs: string;
  status: StageStatus;
  rawStatus: string;
  detail: string;
};

function buildStages(system: SystemStatusEnvelope | null, language: "es" | "en"): Stage[] {
  const etlStatus = resolveStatus(system?.pipeline.status);
  const dqStatus = resolveStatus(system?.data_quality.status);
  const predStatus = resolveStatus(system?.predictions.status);
  const modelStatus = resolveStatus(system?.model.status);

  return [
    {
      key: "etl",
      label: "ETL Pipeline",
      labelEs: "Pipeline ETL",
      status: etlStatus,
      rawStatus: system?.pipeline.status ?? "unknown",
      detail:
        system?.pipeline.latest_timestamp
          ? system.pipeline.latest_timestamp.replace("T", " ").slice(0, 16)
          : "-",
    },
    {
      key: "dq",
      label: "Data Quality",
      labelEs: "Calidad datos",
      status: dqStatus,
      rawStatus: system?.data_quality.freshness ?? system?.data_quality.status ?? "unknown",
      detail:
        system?.data_quality.station_count != null
          ? language === "es"
            ? `${system.data_quality.station_count} estaciones · ${system.data_quality.pollutant_count ?? 0} contaminantes`
            : `${system.data_quality.station_count} stations · ${system.data_quality.pollutant_count ?? 0} pollutants`
          : "-",
    },
    {
      key: "pred",
      label: "Predictions",
      labelEs: "Predicciones",
      status: predStatus,
      rawStatus: system?.predictions.status ?? "unknown",
      detail:
        system?.predictions.generated_at
          ? system.predictions.generated_at.replace("T", " ").slice(0, 16)
          : "-",
    },
    {
      key: "model",
      label: "ML Model",
      labelEs: "Modelo ML",
      status: modelStatus,
      rawStatus: system?.model.status ?? "unknown",
      detail:
        system?.model.selected_model
          ? (system.model.selected_model.includes("hist_gradient")
            ? (language === "es" ? "NO2 v1 activo" : "NO2 v1 active")
            : system.model.selected_model.replaceAll("_", " "))
          : "-",
    },
  ];
}

export function PipelineTimeline({ system, language = "en", className }: PipelineTimelineProps) {
  const stages = buildStages(system, language);

  return (
    <div className={className}>
      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-0 md:hidden">
        {stages.map((stage, i) => (
          <div key={stage.key} className="flex items-start gap-4">
            {/* Connector column */}
            <div className="flex flex-col items-center">
              <div className={`mt-4 h-3 w-3 rounded-full flex-shrink-0 ${statusDot(stage.status)}`} />
              {i < stages.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-white/10" style={{ minHeight: "2.5rem" }} />
              )}
            </div>
            {/* Content */}
            <div className="pb-6">
              <p className="eyebrow text-soft/50">{language === "es" ? stage.labelEs : stage.label}</p>
              <p className="mt-1 font-data text-sm text-bone">{formatOperationalLabel(stage.rawStatus, language)}</p>
              <p className="mt-1 font-data text-xs text-soft/40">{stage.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden md:block overflow-x-auto">
        <div
          className="flex items-start"
          style={{ minWidth: `${stages.length * 200}px` }}
        >
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex items-center flex-1">
              {/* Stage card */}
              <div className="flex-1 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                {/* Status dot + label */}
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusDot(stage.status)}`} />
                  <p className="eyebrow truncate text-soft/50">
                    {language === "es" ? stage.labelEs : stage.label}
                  </p>
                </div>
                {/* Status badge */}
                <p
                  className="mt-2 font-data text-xs uppercase tracking-[0.18em] truncate"
                  style={{ color: statusColor(stage.status) }}
                >
                  {formatOperationalLabel(stage.rawStatus, language)}
                </p>
                {/* Detail */}
                <p className="mt-1 font-data text-xs text-soft/38 truncate">{stage.detail}</p>
              </div>

              {/* Connector arrow between stages */}
              {i < stages.length - 1 && (
                <div className="relative flex w-8 flex-shrink-0 items-center justify-center">
                  <div className="h-px w-full bg-white/12" />
                  <svg
                    className="absolute right-0 h-3 w-3"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path d="M3 1 L9 6 L3 11" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
