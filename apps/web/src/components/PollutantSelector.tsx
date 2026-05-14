"use client";

type PollutantSelectorProps = {
  selected: string;
  available: string[];
  onSelect?: (pollutant: string) => void;
  language?: "es" | "en";
  className?: string;
};

const POLLUTANT_LABELS: Record<string, string> = {
  NO2: "NO₂",
  O3: "O₃",
  PM10: "PM10",
  PM25: "PM2.5",
  SO2: "SO₂",
  CO: "CO",
  NO: "NO",
  NOX: "NOₓ",
};

export function PollutantSelector({
  selected,
  available,
  onSelect,
  language = "es",
  className,
}: PollutantSelectorProps) {
  const ALL_POLLUTANTS = ["NO2", "O3", "PM10", "PM25", "SO2", "CO"];

  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-soft/55">
        {language === "es" ? "Contaminante" : "Pollutant"}
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_POLLUTANTS.map((pollutant) => {
          const isAvailable = available.includes(pollutant);
          const isActive = selected === pollutant;

          return (
            <button
              key={pollutant}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelect?.(pollutant)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-lime text-graphite"
                  : isAvailable
                  ? "glass-panel text-soft/80 hover:bg-white/10"
                  : "glass-panel cursor-not-allowed opacity-30 text-soft/40",
              ].join(" ")}
              aria-pressed={isActive}
              title={
                !isAvailable
                  ? language === "es"
                    ? "Datos no disponibles aún"
                    : "Data not yet available"
                  : undefined
              }
            >
              {POLLUTANT_LABELS[pollutant] ?? pollutant}
            </button>
          );
        })}
      </div>
    </div>
  );
}
