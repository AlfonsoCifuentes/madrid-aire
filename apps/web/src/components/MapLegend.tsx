import { getPublicRiskScale } from "@/lib/presentation";

type MapLegendProps = {
  className?: string;
  language?: "es" | "en";
};

export function MapLegend({ className, language = "es" }: MapLegendProps) {
  const scale = getPublicRiskScale(language);

  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-soft/55">
        {language === "es" ? "Nivel de riesgo" : "Risk level"}
      </p>
      <ul className="flex flex-col gap-2">
        {scale.map(({ band, color, label }) => (
          <li key={band} className="flex items-center gap-2.5">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-soft/70">
              {label}
            </span>
          </li>
        ))}
        <li className="mt-1 flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full border border-soft/30 bg-transparent" />
          <span className="text-xs text-soft/50">
            {language === "es" ? "Sin datos recientes" : "No recent data"}
          </span>
        </li>
      </ul>
      <p className="mt-4 text-[10px] leading-4 text-soft/40">
        {language === "es"
          ? "Tamaño = valor relativo · Intensidad = frescura"
          : "Size = relative value · Intensity = freshness"}
      </p>
    </div>
  );
}
