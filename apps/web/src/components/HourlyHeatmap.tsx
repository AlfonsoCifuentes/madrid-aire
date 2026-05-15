/**
 * HourlyHeatmap — renders a 24-column grid of NO2 values by hour of day.
 * Each cell is colored by the NO2 risk level (§5.4 spec palette).
 * Pure SVG, no external chart library.
 */

import type { Language } from "@/lib/i18n";
import { formatRiskLabel } from "@/lib/presentation";

export type HeatmapPoint = {
  hour: number; // 0–23
  value: number; // µg/m³
};

type HourlyHeatmapProps = {
  data: HeatmapPoint[];
  /** Label for the hour axis */
  hourLabel?: string;
  /** Unit shown in the top-right corner */
  unit?: string;
  language?: Language;
  className?: string;
};

/** Map NO2 µg/m³ → risk color (same palette as AtmosphericMap / §5.4) */
function no2ToColor(value: number): string {
  if (value <= 40) return "#80FFB2";
  if (value <= 90) return "#D8FF4F";
  if (value <= 120) return "#FFB000";
  if (value <= 230) return "#FF6B35";
  return "#C2410C";
}

/** Opacity based on relative magnitude within the dataset */
function relativeOpacity(value: number, min: number, max: number): number {
  const range = max - min || 1;
  return 0.35 + ((value - min) / range) * 0.65;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HourlyHeatmap({ data, hourLabel = "h", unit = "µg/m³", language = "en", className }: HourlyHeatmapProps) {
  if (data.length === 0) {
    return (
      <div
        className={`flex min-h-[80px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.03] ${className ?? ""}`}
      >
        <p className="eyebrow text-soft/35">{language === "es" ? "SIN DATOS" : "NO DATA"}</p>
      </div>
    );
  }

  // Build lookup: hour → value (latest if duplicates)
  const byHour = new Map<number, number>();
  for (const pt of data) {
    byHour.set(pt.hour, pt.value);
  }

  const values = [...byHour.values()];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // SVG sizing
  const CELL_W = 28;
  const CELL_H = 52;
  const LABEL_H = 18;
  const GAP = 3;
  const TOTAL_W = HOURS.length * (CELL_W + GAP) - GAP;
  const TOTAL_H = CELL_H + LABEL_H + 16;

  return (
    <div className={`overflow-x-auto rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="eyebrow text-soft/50">{language === "es" ? "patrón 24 h" : "24h pattern"}</p>
        <p className="font-data text-xs text-soft/35">{unit}</p>
      </div>
      <svg
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        style={{ width: "100%", minWidth: `${Math.min(TOTAL_W, 400)}px`, height: "auto" }}
        role="img"
        aria-label={language === "es" ? "Mapa de calor horario de NO2" : "Hourly NO2 heatmap"}
      >
        {HOURS.map((hour) => {
          const val = byHour.get(hour);
          const x = hour * (CELL_W + GAP);
          const color = val != null ? no2ToColor(val) : "#2A3037";
          const opacity = val != null ? relativeOpacity(val, minVal, maxVal) : 0.25;

          return (
            <g key={hour}>
              {/* Heat cell */}
              <rect
                x={x}
                y={0}
                width={CELL_W}
                height={CELL_H}
                rx={5}
                fill={color}
                fillOpacity={opacity}
              />
              {/* Value text */}
              {val != null && (
                <text
                  x={x + CELL_W / 2}
                  y={CELL_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={val >= 100 ? 7.5 : 8.5}
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.82)"
                >
                  {Math.round(val)}
                </text>
              )}
              {/* Hour label below cell */}
              <text
                x={x + CELL_W / 2}
                y={CELL_H + 12}
                textAnchor="middle"
                fontSize={7.5}
                fontFamily="monospace"
                fill="rgba(255,255,255,0.30)"
                letterSpacing="0.05em"
              >
                {String(hour).padStart(2, "0")}
                {hourLabel}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Risk legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.62rem] uppercase tracking-[0.14em] text-soft/38">
        {[
          { color: "#80FFB2", key: "good" },
          { color: "#D8FF4F", key: "acceptable" },
          { color: "#FFB000", key: "moderate" },
          { color: "#FF6B35", key: "poor" },
          { color: "#C2410C", key: "very_poor" },
        ].map(({ color, key }) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
            {formatRiskLabel(key, language)}
          </span>
        ))}
      </div>
    </div>
  );
}
