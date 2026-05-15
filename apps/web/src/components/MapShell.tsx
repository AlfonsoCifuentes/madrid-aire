"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { MapLegend } from "./MapLegend";
import { PollutantSelector } from "./PollutantSelector";
import { StationDrawer } from "./StationDrawer";
import type { MapNode } from "./AtmosphericMap";

// Dynamic import: the map requires browser APIs — disable SSR
const AtmosphericMap = dynamic(
  () => import("./AtmosphericMap").then((mod) => ({ default: mod.AtmosphericMap })),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

function MapPlaceholder() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center text-soft/30">
      <p className="eyebrow">CARGANDO MAPA DE MADRID</p>
    </div>
  );
}

type MapShellProps = {
  nodes: MapNode[];
  language?: "es" | "en";
};

export function MapShell({ nodes, language = "es" }: MapShellProps) {
  const [selectedPollutant, setSelectedPollutant] = useState("NO2");
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  function handleStationSelect(stationId: string) {
    const node = nodes.find((n) => n.station_id === stationId) ?? null;
    setSelectedNode(node);
  }

  return (
    <div className="relative flex flex-col gap-4">
      <PollutantSelector
        selected={selectedPollutant}
        available={["NO2"]}
        onSelect={setSelectedPollutant}
        language={language}
      />

      <div className="relative isolate overflow-hidden rounded-[2rem] shadow-atmosphere">
        <AtmosphericMap
          nodes={nodes}
          onStationSelect={handleStationSelect}
          className="h-[520px] w-full rounded-[2rem] lg:h-[620px] xl:h-[680px]"
        />

        {/* Inline legend overlay (bottom-left corner of map) */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-graphite/80 px-4 py-3 backdrop-blur-sm print:hidden">
          <MapLegend language={language} />
        </div>

        {/* No-station hint */}
        {selectedNode === null && (
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl bg-graphite/80 px-4 py-3 backdrop-blur-sm print:hidden">
            <p className="text-xs text-soft/40">
              {language === "es" ? "Pulsa una estación" : "Click a station"}
            </p>
          </div>
        )}
      </div>

      <div className="hidden rounded-[1.5rem] border border-graphite/10 bg-white/75 px-4 py-3 text-graphite print:block">
        <MapLegend language={language} />
      </div>

      {/* Station drawer — right panel on desktop, bottom sheet on mobile */}
      <div className="print:hidden">
        <StationDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          language={language}
        />
      </div>

      <p className="text-xs text-soft/45 print:text-graphite/65">
        {language === "es"
          ? "El mapa te ayuda a situar cada estación. Lo importante son los puntos, su tamaño relativo y el nivel que muestra cada uno."
          : "The map helps you place each station. The key information is in the markers, their relative size, and the level shown for each one."}
      </p>
    </div>
  );
}
