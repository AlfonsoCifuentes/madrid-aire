"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
  const [printPreview, setPrintPreview] = useState<string | null>(null);

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
          onStaticPreviewChange={setPrintPreview}
          className="h-[520px] w-full rounded-[2rem] print:hidden lg:h-[620px] xl:h-[680px]"
        />

        <div className="hidden rounded-[2rem] border border-white/10 bg-[#d9e5ec] p-3 text-graphite print:block">
          {printPreview ? (
            <Image
              src={printPreview}
              alt={language === "es" ? "Mapa de Madrid con estaciones de calidad del aire" : "Madrid air-quality station map"}
              width={1600}
              height={1000}
              unoptimized
              className="h-auto w-full rounded-[1.5rem] border border-graphite/10"
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-dashed border-graphite/20 bg-white/70 px-6 text-center text-sm leading-6 text-graphite/72">
              {language === "es"
                ? "La versión para imprimir prepara una vista estática del mapa. Si no aparece todavía, abre la página en pantalla unos segundos antes de exportar a PDF."
                : "The printable version prepares a static map preview. If it is not visible yet, keep the page open for a few seconds before exporting to PDF."}
            </div>
          )}
          <div className="mt-4 rounded-[1.25rem] bg-white/70 px-4 py-3">
            <MapLegend language={language} />
          </div>
        </div>

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

      {/* Station drawer — right panel on desktop, bottom sheet on mobile */}
      <div className="print:hidden">
        <StationDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          language={language}
        />
      </div>
    </div>
  );
}
