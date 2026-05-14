type ChartPoint = {
  timestamp: string;
  value: number;
};

type HistoryForecastChartProps = {
  observed: ChartPoint[];
  predicted: ChartPoint[];
  observedLabel: string;
  predictedLabel: string;
};

function buildPolyline(points: ChartPoint[], width: number, height: number, min: number, max: number) {
  if (points.length === 0) {
    return "";
  }

  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function HistoryForecastChart({ observed, predicted, observedLabel, predictedLabel }: HistoryForecastChartProps) {
  const width = 820;
  const height = 280;
  const values = [...observed, ...predicted].map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const observedPolyline = buildPolyline(observed, width / 2 - 24, height, min, max);
  const predictedPolyline = buildPolyline(predicted, width / 2 - 24, height, min, max);

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-soft/55">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-no2" />
          {observedLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          {predictedLabel}
        </span>
      </div>
      <svg className="h-auto w-full" viewBox="0 0 820 320" role="img">
        <rect x="0" y="0" width="820" height="320" rx="24" fill="rgba(255,255,255,0.02)" />
        <line x1="410" y1="24" x2="410" y2="296" stroke="rgba(255,255,255,0.12)" strokeDasharray="8 8" />
        <g transform="translate(24 20)">
          <polyline fill="none" points={observedPolyline} stroke="#FFB000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform="translate(434 20)">
          <polyline fill="none" points={predictedPolyline} stroke="#D8FF4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
