/**
 * ModelErrorChart — grouped SVG bar chart showing MAE & RMSE per baseline.
 * Designed to sit below MetricBars on the Model page and give a more
 * visual, at-a-glance comparison of baseline performance.
 *
 * Pure SVG, no external chart library.
 */

import { type MetricItem } from "@/lib/api";

type ModelErrorChartProps = {
  items: MetricItem[];
  maeLabel?: string;
  rmseLabel?: string;
  /** Optional: highlight this baseline in lime */
  selectedBaseline?: string | null;
  className?: string;
};

const BAR_MAE_COLOR = "#FFB000"; // amber/NO2 color
const BAR_RMSE_COLOR = "rgba(255,176,0,0.42)"; // lighter amber
const SELECTED_MAE_COLOR = "#D8FF4F"; // lime when best model
const SELECTED_RMSE_COLOR = "rgba(216,255,79,0.42)";

export function ModelErrorChart({
  items,
  maeLabel = "MAE",
  rmseLabel = "RMSE",
  selectedBaseline,
  className,
}: ModelErrorChartProps) {
  if (!items || items.length === 0) {
    return (
      <div
        className={`flex min-h-[140px] items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.03] ${className ?? ""}`}
      >
        <p className="eyebrow text-soft/35">NO DATA</p>
      </div>
    );
  }

  // Deduplicate by baseline_name, keeping the first entry per baseline
  const seen = new Set<string>();
  const baselines = items.filter((item) => {
    if (seen.has(item.baseline_name)) return false;
    seen.add(item.baseline_name);
    return true;
  });

  const maxError = Math.max(...baselines.flatMap((b) => [b.mae, b.rmse]));
  const svgMaxValue = maxError * 1.15 || 1;

  // Layout
  const PADDING = { top: 16, right: 16, bottom: 40, left: 28 };
  const BAR_GROUP_W = 46;
  const BAR_W = 18;
  const BAR_GAP = 4;
  const GROUP_GAP = 16;
  const CHART_H = 140;
  const totalGroupW = BAR_GROUP_W + GROUP_GAP;
  const CHART_W = baselines.length * totalGroupW - GROUP_GAP + PADDING.left + PADDING.right;
  const SVG_H = CHART_H + PADDING.top + PADDING.bottom;

  function barHeight(value: number) {
    return (value / svgMaxValue) * CHART_H;
  }

  function barY(value: number) {
    return PADDING.top + CHART_H - barHeight(value);
  }

  function groupX(index: number) {
    return PADDING.left + index * totalGroupW;
  }

  // Abbreviate baseline names
  function shortName(name: string) {
    const n = name.toLowerCase();
    if (n.includes("hist_gradient")) return "Model";
    if (n.includes("persistence")) return "Persist";
    if (n.includes("same_hour")) return "Yesterday";
    if (n.includes("rolling")) return "Mean24h";
    return name.slice(0, 7);
  }

  // Y-axis gridlines values
  const gridValues = [0, svgMaxValue * 0.25, svgMaxValue * 0.5, svgMaxValue * 0.75, svgMaxValue];

  return (
    <div className={`overflow-x-auto rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 ${className ?? ""}`}>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-soft/55">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: BAR_MAE_COLOR }} />
          {maeLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: BAR_MAE_COLOR, opacity: 0.5 }} />
          {rmseLabel}
        </span>
        <span className="ml-auto font-data text-xs text-soft/35">µg/m³</span>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${SVG_H}`}
        style={{ width: "100%", minWidth: `${Math.min(CHART_W, 360)}px`, height: "auto" }}
        role="img"
        aria-label="Model error chart"
      >
        {/* Y-axis grid lines */}
        {gridValues.map((val, i) => {
          const y = PADDING.top + CHART_H - (val / svgMaxValue) * CHART_H;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={PADDING.left - 4}
                y1={y}
                x2={CHART_W - PADDING.right}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
              {i > 0 && (
                <text
                  x={PADDING.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={7.5}
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.28)"
                >
                  {Math.round(val)}
                </text>
              )}
            </g>
          );
        })}

        {/* Bars per baseline */}
        {baselines.map((item, index) => {
          const isSelected =
            selectedBaseline != null &&
            item.baseline_name.toLowerCase() === selectedBaseline.toLowerCase();
          const maeColor = isSelected ? SELECTED_MAE_COLOR : BAR_MAE_COLOR;
          const rmseColor = isSelected ? SELECTED_RMSE_COLOR : BAR_RMSE_COLOR;
          const x = groupX(index);
          const maeH = barHeight(item.mae);
          const rmseH = barHeight(item.rmse);
          const labelX = x + BAR_W + BAR_GAP / 2;

          return (
            <g key={item.baseline_name}>
              {/* MAE bar */}
              <rect
                x={x}
                y={barY(item.mae)}
                width={BAR_W}
                height={maeH}
                rx={3}
                fill={maeColor}
                fillOpacity={0.9}
              />
              {/* MAE value */}
              {item.mae > svgMaxValue * 0.12 && (
                <text
                  x={x + BAR_W / 2}
                  y={barY(item.mae) - 3}
                  textAnchor="middle"
                  fontSize={7}
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.65)"
                >
                  {item.mae.toFixed(1)}
                </text>
              )}

              {/* RMSE bar */}
              <rect
                x={x + BAR_W + BAR_GAP}
                y={barY(item.rmse)}
                width={BAR_W}
                height={rmseH}
                rx={3}
                fill={rmseColor}
              />
              {/* RMSE value */}
              {item.rmse > svgMaxValue * 0.12 && (
                <text
                  x={x + BAR_W + BAR_GAP + BAR_W / 2}
                  y={barY(item.rmse) - 3}
                  textAnchor="middle"
                  fontSize={7}
                  fontFamily="monospace"
                  fill="rgba(255,255,255,0.40)"
                >
                  {item.rmse.toFixed(1)}
                </text>
              )}

              {/* Baseline label */}
              <text
                x={labelX}
                y={PADDING.top + CHART_H + 14}
                textAnchor="middle"
                fontSize={7.5}
                fontFamily="monospace"
                fill={isSelected ? "#D8FF4F" : "rgba(255,255,255,0.38)"}
                letterSpacing="0.06em"
              >
                {shortName(item.baseline_name)}
              </text>

              {/* Selected indicator dot */}
              {isSelected && (
                <circle
                  cx={labelX}
                  cy={PADDING.top + CHART_H + 24}
                  r={2.5}
                  fill="#D8FF4F"
                />
              )}
            </g>
          );
        })}

        {/* Baseline axis line */}
        <line
          x1={PADDING.left - 4}
          y1={PADDING.top + CHART_H}
          x2={CHART_W - PADDING.right}
          y2={PADDING.top + CHART_H}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
