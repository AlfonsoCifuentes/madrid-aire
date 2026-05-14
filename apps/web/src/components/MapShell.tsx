"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { MapLegend } from "./MapLegend";
import { PollutantSelector } from "./PollutantSelector";
import { StationDrawer } from "./StationDrawer";
import type { MapNode } from "./AtmosphericMap";

// Dynamic import: MapLibre GL requires browser APIs — disable SSR
const AtmosphericMap = dynamic(
  () => import("./AtmosphericMap").then((mod) => ({ default: mod.AtmosphericMap })),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

function MapPlaceholder() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center text-soft/30">
      <p className="eyebrow">CALIBRATING ATMOSPHERIC DATA</p>
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

      <div className="relative overflow-hidden rounded-[2rem] shadow-atmosphere">
        <AtmosphericMap
          nodes={nodes}
          onStationSelect={handleStationSelect}
          className="h-[520px] w-full rounded-[2rem] lg:h-[620px] xl:h-[680px]"
        />

        {/* Inline legend overlay (bottom-left corner of map) */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-graphite/80 px-4 py-3 backdrop-blur-sm">
          <MapLegend language={language} />
        </div>

        {/* No-station hint */}
        {selectedNode === null && (
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl bg-graphite/80 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-soft/40">
              {language === "es" ? "Pulsa una estación" : "Click a station"}
            </p>
          </div>
        )}
      </div>

      {/* Station drawer — right panel on desktop, bottom sheet on mobile */}
      <StationDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        language={language}
      />
    </div>
  );
}
