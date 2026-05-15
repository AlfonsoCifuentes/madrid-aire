"use client";

import Link from "next/link";

import { formatRiskLabel, getPublicRiskColor } from "@/lib/presentation";
import type { MapNode } from "./AtmosphericMap";

type StationDrawerProps = {
  node: MapNode | null;
  onClose: () => void;
  language?: "es" | "en";
};

const FRESHNESS_LABELS: Record<string, { es: string; en: string }> = {
  fresh: { es: "Reciente", en: "Fresh" },
  delayed: { es: "Retrasado", en: "Delayed" },
  stale: { es: "Desactualizado", en: "Stale" },
  unknown: { es: "Desconocido", en: "Unknown" },
};

export function StationDrawer({ node, onClose, language = "es" }: StationDrawerProps) {
  const isOpen = node !== null;

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-graphite/60 backdrop-blur-sm xl:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <div
        className={[
          "fixed z-[1001] transition-transform duration-300 ease-out",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 rounded-t-3xl xl:rounded-none",
          // Desktop: right panel
          "xl:bottom-0 xl:left-auto xl:right-0 xl:top-0 xl:w-80",
          // Visibility
          isOpen ? "translate-y-0 xl:translate-x-0" : "translate-y-full xl:translate-x-full",
          "glass-panel shadow-atmosphere border-l border-white/5",
          "px-7 py-8 xl:pt-16",
        ].join(" ")}
        role="complementary"
        aria-label={language === "es" ? "Detalle de estación" : "Station detail"}
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow text-soft/55">
            {language === "es" ? "Estación seleccionada" : "Selected station"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-soft/60 hover:bg-white/10 hover:text-soft"
            aria-label={language === "es" ? "Cerrar" : "Close"}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {node && (
          <div className="mt-5 flex flex-col gap-5">
            {(() => {
              const riskColor = getPublicRiskColor(node.risk_level);
              const riskLabel = formatRiskLabel(node.risk_level, language);

              return (
                <>
            <div>
              <p className="font-data text-2xl text-bone">{node.label}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-4">
                <p className="eyebrow text-soft/50">NO2</p>
                <p className="mt-2 font-data text-2xl" style={{ color: riskColor }}>
                  {node.value.toFixed(1)}
                  <span className="ml-1 font-data text-xs text-soft/50">µg/m³</span>
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <p className="eyebrow text-soft/50">
                  {language === "es" ? "Nivel" : "Level"}
                </p>
                <p className="mt-2 text-sm font-medium" style={{ color: riskColor }}>
                  {riskLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    node.freshness === "fresh"
                      ? "#80FFB2"
                      : node.freshness === "delayed"
                      ? "#FFB000"
                      : "#FF6B35",
                }}
              />
              <span className="text-xs text-soft/60">
                {(FRESHNESS_LABELS[node.freshness] ?? FRESHNESS_LABELS.unknown)[language]}
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="eyebrow text-soft/50">
                {language === "es" ? "Coordenadas" : "Coordinates"}
              </p>
              <p className="mt-2 font-data text-xs text-bone/70">
                {node.latitude.toFixed(4)}°N · {node.longitude.toFixed(4)}°E
              </p>
            </div>

            {node.highlight && (
              <div className="rounded-2xl border border-lime/30 bg-lime/5 px-4 py-3">
                <p className="text-xs text-lime/80">
                  {language === "es"
                    ? "Punto con el valor más alto ahora"
                    : "Point with the highest reading right now"}
                </p>
              </div>
            )}
            <Link
              href={`/stations/${node.station_id}?lang=${language}`}
              className="mt-1 text-sm text-lime/70 transition hover:text-lime"
            >
              {language === "es" ? "Ver estación completa →" : "View full station →"}
            </Link>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
}
