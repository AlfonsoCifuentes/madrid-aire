import type { Language } from "@/lib/i18n";

export type ChartPoint = {
  timestamp: string;
  value: number;
};

type HistoryForecastChartProps = {
  observed: ChartPoint[];
  predicted: ChartPoint[];
  observedLabel: string;
  predictedLabel: string;
  language?: Language;
};

// NO2 risk thresholds (µg/m³) matching §15.5 of spec
const RISK_BANDS = [
  { max: 40, color: "rgba(128,255,178,0.07)", label: "good" },
  { max: 90, color: "rgba(216,255,79,0.07)", label: "acceptable" },
  { max: 120, color: "rgba(255,176,0,0.10)", label: "moderate" },
  { max: 230, color: "rgba(255,107,53,0.12)", label: "poor" },
  { max: Infinity, color: "rgba(194,65,12,0.14)", label: "very_poor" },
];

function toY(value: number, min: number, range: number, height: number) {
  return height - ((value - min) / range) * height;
}

function buildPolylinePoints(
  points: ChartPoint[],
  panelWidth: number,
  height: number,
  min: number,
  range: number,
): string {
  if (points.length === 0) return "";
  return points
    .map((pt, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * panelWidth;
      const y = toY(pt.value, min, range, height);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(
  points: ChartPoint[],
  panelWidth: number,
  height: number,
  min: number,
  range: number,
): string {
  if (points.length < 2) return "";
  const line = points
    .map((pt, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * panelWidth;
      const y = toY(pt.value, min, range, height);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const lastX = panelWidth.toFixed(1);
  return `${line} L${lastX},${height} L0,${height} Z`;
}

function buildRiskBandRects(
  min: number,
  range: number,
  height: number,
): Array<{ x: number; y: number; h: number; color: string }> {
  const rects: Array<{ x: number; y: number; h: number; color: string }> = [];
  let prevMax = min;
  for (const band of RISK_BANDS) {
    const bandMin = prevMax;
    const bandMax = Math.min(band.max, min + range);
    if (bandMax <= bandMin) break;
    const y = toY(bandMax, min, range, height);
    const yBottom = toY(bandMin, min, range, height);
    rects.push({ x: 0, y: Math.max(0, y), h: Math.min(height, yBottom) - Math.max(0, y), color: band.color });
    prevMax = band.max;
    if (band.max >= min + range) break;
  }
  return rects.filter((r) => r.h > 0);
}

export function HistoryForecastChart({ observed, predicted, observedLabel, predictedLabel, language = "en" }: HistoryForecastChartProps) {
  const W = 820;
  const H = 280;
  const PAD_X = 24;
  const PAD_Y = 20;
  const SEP_X = W / 2; // dividing line between observed / predicted panels
  const PANEL_W = SEP_X - PAD_X - 12; // usable width per panel
  const CHART_H = H - PAD_Y * 2;

  const allValues = [...observed, ...predicted].map((pt) => pt.value);
  if (allValues.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="eyebrow text-soft/40">{language === "es" ? "SIN DATOS" : "NO DATA"}</p>
      </div>
    );
  }

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const chartMin = Math.max(0, rawMin - 5);
  const chartMax = rawMax + 10;
  const range = chartMax - chartMin || 1;

  const obsPoly = buildPolylinePoints(observed, PANEL_W, CHART_H, chartMin, range);
  const obsArea = buildAreaPath(observed, PANEL_W, CHART_H, chartMin, range);
  const predPoly = buildPolylinePoints(predicted, PANEL_W, CHART_H, chartMin, range);
  const predArea = buildAreaPath(predicted, PANEL_W, CHART_H, chartMin, range);
  const riskBands = buildRiskBandRects(chartMin, range, CHART_H);

  // "now" marker: last observed X position in the left panel
  const nowX = PAD_X + PANEL_W;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-soft/55">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-no2" />
          {observedLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime" />
          {predictedLabel}
        </span>
        <span className="ml-auto inline-flex items-center gap-2 text-soft/35">
          <span className="inline-block h-2 w-5 rounded-sm border border-white/20 bg-white/5" />
          {language === "es" ? "bandas de riesgo" : "risk bands"}
        </span>
      </div>

      <svg className="h-auto w-full" viewBox={`0 0 ${W} ${H + PAD_Y}`} role="img" aria-label={language === "es" ? "Gráfico de histórico y previsión" : "History and forecast chart"}>
        <defs>
          <clipPath id="hfc-obs-clip">
            <rect x={PAD_X} y={PAD_Y} width={PANEL_W} height={CHART_H} />
          </clipPath>
          <clipPath id="hfc-pred-clip">
            <rect x={SEP_X + 12} y={PAD_Y} width={PANEL_W} height={CHART_H} />
          </clipPath>
          <linearGradient id="hfc-obs-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFB000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hfc-pred-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8FF4F" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D8FF4F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Chart background */}
        <rect x={0} y={0} width={W} height={H + PAD_Y} rx={24} fill="rgba(255,255,255,0.015)" />

        {/* Risk bands — observed panel */}
        {riskBands.map((band, i) => (
          <rect
            key={`obs-band-${i}`}
            x={PAD_X}
            y={PAD_Y + band.y}
            width={PANEL_W}
            height={band.h}
            fill={band.color}
            clipPath="url(#hfc-obs-clip)"
          />
        ))}

        {/* Risk bands — predicted panel */}
        {riskBands.map((band, i) => (
          <rect
            key={`pred-band-${i}`}
            x={SEP_X + 12}
            y={PAD_Y + band.y}
            width={PANEL_W}
            height={band.h}
            fill={band.color}
            clipPath="url(#hfc-pred-clip)"
          />
        ))}

        {/* Subtle horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((fraction) => {
          const lineY = PAD_Y + fraction * CHART_H;
          return (
            <line
              key={fraction}
              x1={PAD_X}
              y1={lineY}
              x2={W - PAD_X}
              y2={lineY}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Now divider */}
        <line
          x1={nowX}
          y1={PAD_Y - 4}
          x2={nowX}
          y2={H + PAD_Y - PAD_Y + 4}
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="6 6"
          strokeWidth={1.5}
        />
        <text
          x={nowX - 6}
          y={H + PAD_Y - 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.30)"
          fontSize={9}
          fontFamily="monospace"
          letterSpacing="0.14em"
        >
          {language === "es" ? "AHORA" : "NOW"}
        </text>

        {/* Observed area fill */}
        <g clipPath="url(#hfc-obs-clip)">
          <g transform={`translate(${PAD_X},${PAD_Y})`}>
            {obsArea && <path d={obsArea} fill="url(#hfc-obs-fill)" />}
            {obsPoly && (
              <polyline
                fill="none"
                points={obsPoly}
                stroke="#FFB000"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        </g>

        {/* Predicted area fill */}
        <g clipPath="url(#hfc-pred-clip)">
          <g transform={`translate(${SEP_X + 12},${PAD_Y})`}>
            {predArea && <path d={predArea} fill="url(#hfc-pred-fill)" />}
            {predPoly && (
              <polyline
                fill="none"
                points={predPoly}
                stroke="#D8FF4F"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 4"
              />
            )}
          </g>
        </g>

        {/* Y-axis value labels */}
        {[chartMin, (chartMin + chartMax) / 2, chartMax].map((val, i) => {
          const y = PAD_Y + toY(val, chartMin, range, CHART_H);
          return (
            <text
              key={`y-${i}`}
              x={PAD_X - 4}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.28)"
              fontSize={9}
              fontFamily="monospace"
            >
              {Math.round(val)}
            </text>
          );
        })}

        {/* Unit label */}
        <text
          x={W - PAD_X}
          y={PAD_Y - 6}
          textAnchor="end"
          fill="rgba(255,255,255,0.25)"
          fontSize={9}
          fontFamily="monospace"
          letterSpacing="0.1em"
        >
          µg/m³
        </text>
      </svg>
    </div>
  );
}
