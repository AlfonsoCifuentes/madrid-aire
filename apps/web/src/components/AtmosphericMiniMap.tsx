"use client";

import dynamic from "next/dynamic";

import type { MapNode } from "./AtmosphericMap";

// SSR-safe wrapper — Leaflet requires browser APIs
const AtmosphericMap = dynamic(
  () => import("./AtmosphericMap").then((mod) => ({ default: mod.AtmosphericMap })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-[1.5rem] bg-white/5" />,
  },
);

type AtmosphericMiniMapProps = {
  nodes: MapNode[];
  /** Tailwind classes for the wrapper. Must include height and width. */
  className?: string;
};

/** Read-only Leaflet map for embedding in pages without interactive drawer or pollutant selector. */
export function AtmosphericMiniMap({ nodes, className }: AtmosphericMiniMapProps) {
  return (
    <div className={className ?? "h-[240px] w-full overflow-hidden rounded-[1.5rem] isolate"}>
      <AtmosphericMap nodes={nodes} className="h-full w-full" />
    </div>
  );
}
