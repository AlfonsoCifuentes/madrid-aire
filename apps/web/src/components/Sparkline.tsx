type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#D8FF4F",
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  const valid = data.filter((v) => Number.isFinite(v));
  if (valid.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden="true">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth={strokeWidth} strokeOpacity="0.25" />
      </svg>
    );
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;

  const padding = strokeWidth;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = valid
    .map((v, i) => {
      const x = padding + (i / (valid.length - 1)) * innerW;
      const y = padding + (1 - (v - min) / range) * innerH;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
