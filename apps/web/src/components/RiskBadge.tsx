import { formatRiskLabel, getPublicRiskClassName } from "@/lib/presentation";

type RiskBadgeProps = {
  riskLevel: string | null;
  language?: "es" | "en";
};

export function RiskBadge({ riskLevel, language = "es" }: RiskBadgeProps) {
  const label = formatRiskLabel(riskLevel, language);
  const className = getPublicRiskClassName(riskLevel);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
