const RISK_LABEL_ES: Record<string, string> = {
  good: "Bueno",
  moderate: "Moderado",
  poor: "Malo",
  unhealthy: "No saludable",
  very_unhealthy: "Muy malo",
  unknown: "Sin datos",
};

const RISK_LABEL_EN: Record<string, string> = {
  good: "Good",
  moderate: "Moderate",
  poor: "Poor",
  unhealthy: "Unhealthy",
  very_unhealthy: "Very unhealthy",
  unknown: "Unknown",
};

const RISK_CLASS: Record<string, string> = {
  good: "bg-lime-400/20 text-lime-300 border border-lime-400/30",
  moderate: "bg-amber-400/20 text-amber-300 border border-amber-400/30",
  poor: "bg-orange-500/20 text-orange-300 border border-orange-400/30",
  unhealthy: "bg-red-700/20 text-red-400 border border-red-600/30",
  very_unhealthy: "bg-red-700/20 text-red-400 border border-red-600/30",
  unknown: "bg-white/10 text-soft/60 border border-white/12",
};

type RiskBadgeProps = {
  riskLevel: string | null;
  language?: "es" | "en";
};

export function RiskBadge({ riskLevel, language = "es" }: RiskBadgeProps) {
  const key = riskLevel ?? "unknown";
  const label = (language === "en" ? RISK_LABEL_EN : RISK_LABEL_ES)[key] ?? key;
  const className = RISK_CLASS[key] ?? RISK_CLASS.unknown;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
