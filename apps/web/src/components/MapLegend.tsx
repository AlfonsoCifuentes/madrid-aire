type MapLegendProps = {
  className?: string;
  language?: "es" | "en";
};

const RISK_LEVELS = [
  { key: "good", color: "#80FFB2", es: "Bueno", en: "Good" },
  { key: "acceptable", color: "#D8FF4F", es: "Aceptable", en: "Acceptable" },
  { key: "moderate", color: "#FFB000", es: "Moderado", en: "Moderate" },
  { key: "poor", color: "#FF6B35", es: "Deficiente", en: "Poor" },
  { key: "very_poor", color: "#C2410C", es: "Muy deficiente", en: "Very poor" },
] as const;

export function MapLegend({ className, language = "es" }: MapLegendProps) {
  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-soft/55">
        {language === "es" ? "Nivel de riesgo" : "Risk level"}
      </p>
      <ul className="flex flex-col gap-2">
        {RISK_LEVELS.map(({ key, color, es, en }) => (
          <li key={key} className="flex items-center gap-2.5">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-soft/70">
              {language === "es" ? es : en}
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
          ? "Tamaño = valor NO2 · Opacidad = frescura"
          : "Size = NO2 value · Opacity = freshness"}
      </p>
    </div>
  );
}
