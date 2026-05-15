const RISK_LABEL_ES: Record<string, string> = {
  good: "Bueno",
  acceptable: "Aceptable",
  moderate: "Moderado",
  poor: "Malo",
  unhealthy: "No saludable",
  very_unhealthy: "Muy malo",
  unknown: "Sin datos",
};

const RISK_LABEL_EN: Record<string, string> = {
  good: "Good",
  acceptable: "Acceptable",
  moderate: "Moderate",
  poor: "Poor",
  unhealthy: "Unhealthy",
  very_unhealthy: "Very unhealthy",
  unknown: "Unknown",
};

const RISK_CLASS: Record<string, string> = {
  good: "bg-[#80FFB2]/15 text-[#80FFB2] border border-[#80FFB2]/30",
  acceptable: "bg-[#D8FF4F]/15 text-[#D8FF4F] border border-[#D8FF4F]/30",
  moderate: "bg-[#FFB000]/15 text-[#FFB000] border border-[#FFB000]/30",
  poor: "bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30",
  unhealthy: "bg-[#C2410C]/15 text-[#ff8a6a] border border-[#C2410C]/30",
  very_unhealthy: "bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30",
  unknown: "bg-white/8 text-soft/55 border border-white/10",
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
