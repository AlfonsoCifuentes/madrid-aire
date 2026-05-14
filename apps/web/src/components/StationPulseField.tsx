type StationPulseNode = {
  station_id: string;
  label: string;
  latitude: number;
  longitude: number;
  value: number;
  risk_level: string | null;
  freshness: "fresh" | "delayed" | "stale" | "unknown";
  highlight?: boolean;
};

type StationPulseFieldProps = {
  nodes: StationPulseNode[];
};

const RISK_COLOR: Record<string, string> = {
  good: "#D8FF4F",
  moderate: "#FFB000",
  poor: "#FF7A00",
  unhealthy: "#C60B1E",
  very_unhealthy: "#C60B1E",
  unknown: "#E8E2D5",
};

const FRESHNESS_OPACITY: Record<StationPulseNode["freshness"], number> = {
  fresh: 1,
  delayed: 0.72,
  stale: 0.42,
  unknown: 0.6,
};

function projectNodes(nodes: StationPulseNode[]) {
  const longitudes = nodes.map((node) => node.longitude);
  const latitudes = nodes.map((node) => node.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const longitudeSpan = maxLongitude - minLongitude || 1;
  const latitudeSpan = maxLatitude - minLatitude || 1;

  return nodes.map((node) => ({
    ...node,
    x: 72 + ((node.longitude - minLongitude) / longitudeSpan) * 776,
    y: 532 - ((node.latitude - minLatitude) / latitudeSpan) * 444,
  }));
}

export function StationPulseField({ nodes }: StationPulseFieldProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-soft/70">
        No official station coordinates available.
      </div>
    );
  }

  const maxValue = Math.max(...nodes.map((node) => node.value), 1);
  const projected = projectNodes(nodes);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(198,11,30,0.14),transparent_0_26%),radial-gradient(circle_at_80%_18%,rgba(216,255,79,0.09),transparent_0_20%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3">
      <svg className="h-auto w-full" viewBox="0 0 920 620" role="img" aria-label="Official Madrid station pulse field">
        <defs>
          <radialGradient id="fieldGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="920" height="620" rx="28" fill="rgba(255,255,255,0.02)" />
        <rect x="32" y="32" width="856" height="556" rx="24" fill="url(#fieldGlow)" stroke="rgba(255,255,255,0.08)" />
        {Array.from({ length: 6 }).map((_, index) => (
          <line
            key={`grid-x-${index}`}
            x1={72 + index * 155.2}
            y1="52"
            x2={72 + index * 155.2}
            y2="564"
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="6 10"
          />
        ))}
        {Array.from({ length: 4 }).map((_, index) => (
          <line
            key={`grid-y-${index}`}
            x1="56"
            y1={100 + index * 116}
            x2="864"
            y2={100 + index * 116}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="6 10"
          />
        ))}
        {projected.map((node) => {
          const opacity = FRESHNESS_OPACITY[node.freshness];
          const color = RISK_COLOR[node.risk_level ?? "unknown"] ?? RISK_COLOR.unknown;
          const radius = 6 + (node.value / maxValue) * 18;

          return (
            <g key={node.station_id} opacity={opacity}>
              <circle cx={node.x} cy={node.y} r={radius + 9} fill={color} opacity="0.08" />
              <circle cx={node.x} cy={node.y} r={radius + 4} fill="none" stroke={color} strokeWidth={node.highlight ? 2.6 : 1.6} opacity="0.6" />
              <circle cx={node.x} cy={node.y} r={radius} fill={color} opacity="0.88" />
              <circle cx={node.x} cy={node.y} r={2.5} fill="#080A0C" />
              {node.highlight ? (
                <g>
                  <line x1={node.x} y1={node.y - radius - 10} x2={node.x} y2={node.y - radius - 34} stroke="rgba(255,255,255,0.55)" />
                  <text x={node.x} y={node.y - radius - 42} fill="#F4F1EA" fontSize="13" fontFamily="var(--font-data), monospace" textAnchor="middle">
                    {node.label}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
