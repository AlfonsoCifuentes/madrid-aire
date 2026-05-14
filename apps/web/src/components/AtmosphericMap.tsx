"use client";

import { useEffect, useRef } from "react";

export type MapNode = {
  station_id: string;
  label: string;
  latitude: number;
  longitude: number;
  value: number;
  risk_level: string | null;
  freshness: "fresh" | "delayed" | "stale" | "unknown";
  highlight?: boolean;
};

type AtmosphericMapProps = {
  nodes: MapNode[];
  onStationSelect?: (stationId: string) => void;
  className?: string;
  onStaticPreviewChange?: (dataUrl: string | null) => void;
};

const MAP_STYLE_CANDIDATES = [
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  "https://demotiles.maplibre.org/style.json",
] as const;

const RISK_COLORS: Record<string, string> = {
  good: "#80FFB2",
  acceptable: "#D8FF4F",
  moderate: "#FFB000",
  poor: "#FF6B35",
  very_poor: "#C2410C",
  extreme: "#F43F5E",
  unknown: "#8B949E",
};

const FRESHNESS_OPACITY: Record<string, number> = {
  fresh: 1.0,
  delayed: 0.6,
  stale: 0.3,
  unknown: 0.4,
};

function valueToRadius(value: number): number {
  // Clamp between 6 and 18 based on NO2 value (0–300 µg/m³ range)
  const clamped = Math.max(0, Math.min(300, value));
  return 6 + (clamped / 300) * 12;
}

function buildGeoJson(nodes: MapNode[]) {
  return {
    type: "FeatureCollection" as const,
    features: nodes.map((node) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [node.longitude, node.latitude],
      },
      properties: {
        station_id: node.station_id,
        label: node.label,
        value: node.value,
        risk_level: node.risk_level,
        freshness: node.freshness,
        highlight: node.highlight ?? false,
        color: RISK_COLORS[node.risk_level ?? "unknown"] ?? RISK_COLORS.unknown,
        opacity: FRESHNESS_OPACITY[node.freshness] ?? 0.5,
        radius: valueToRadius(node.value),
      },
    })),
  };
}

async function resolveMapStyle() {
  for (const styleUrl of MAP_STYLE_CANDIDATES) {
    try {
      const response = await fetch(styleUrl, { method: "GET", cache: "force-cache" });
      if (response.ok) {
        return styleUrl;
      }
    } catch {
      continue;
    }
  }

  return MAP_STYLE_CANDIDATES[MAP_STYLE_CANDIDATES.length - 1];
}

export function AtmosphericMap({
  nodes,
  onStationSelect,
  className,
  onStaticPreviewChange,
}: AtmosphericMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    let disposed = false;

    void import("maplibre-gl").then(async ({ default: maplibregl }) => {
      const style = await resolveMapStyle();
      if (disposed || !containerRef.current) {
        return;
      }

      map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: [-3.7038, 40.4168],
        zoom: 10.5,
        attributionControl: false,
      });

      map.on("load", () => {
        map.addSource("stations", {
          type: "geojson",
          data: buildGeoJson(nodes),
        });

        map.addLayer({
          id: "stations-highlight",
          type: "circle",
          source: "stations",
          filter: ["==", ["get", "highlight"], true],
          paint: {
            "circle-radius": ["*", ["get", "radius"], 2.5],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.15,
            "circle-stroke-width": 0,
          },
        });

        map.addLayer({
          id: "stations-ring",
          type: "circle",
          source: "stations",
          paint: {
            "circle-radius": ["*", ["get", "radius"], 1.6],
            "circle-color": "transparent",
            "circle-opacity": 0,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-opacity": ["get", "opacity"],
          },
        });

        map.addLayer({
          id: "stations-dot",
          type: "circle",
          source: "stations",
          paint: {
            "circle-radius": ["get", "radius"],
            "circle-color": ["get", "color"],
            "circle-opacity": ["get", "opacity"],
            "circle-stroke-width": 1,
            "circle-stroke-color": "#080A0C",
            "circle-stroke-opacity": 0.4,
          },
        });

        map.on("mouseenter", "stations-dot", () => {
          (map.getCanvas() as HTMLCanvasElement).style.cursor = "pointer";
        });
        map.on("mouseleave", "stations-dot", () => {
          (map.getCanvas() as HTMLCanvasElement).style.cursor = "";
        });

        if (onStationSelect) {
          map.on("click", "stations-dot", (e: unknown) => {
            const event = e as { point: unknown };
            const features = map.queryRenderedFeatures(event.point, { layers: ["stations-dot"] });
            if (features.length > 0) {
              const stationId = features[0].properties?.station_id as string | undefined;
              if (stationId) {
                onStationSelect(stationId);
              }
            }
          });
        }
      });

      map.on("idle", () => {
        if (!onStaticPreviewChange) {
          return;
        }

        try {
          const preview = (map.getCanvas() as HTMLCanvasElement).toDataURL("image/png");
          onStaticPreviewChange(preview);
        } catch {
          onStaticPreviewChange(null);
        }
      });

      mapRef.current = map;
    });

    return () => {
      disposed = true;
      if (map) map.remove();
    };
  }, [nodes, onStationSelect, onStaticPreviewChange]);

  // Update source data when nodes change without re-initialising map
  useEffect(() => {
    const map = mapRef.current as {
      getSource?: (id: string) => { setData: (data: unknown) => void } | undefined;
      isStyleLoaded?: () => boolean;
    } | null;
    if (!map?.getSource || !map.isStyleLoaded?.()) return;

    const source = map.getSource("stations");
    if (!source) return;

    source.setData(buildGeoJson(nodes));
  }, [nodes]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: "400px" }}
      aria-label="Mapa de estaciones de calidad del aire en Madrid"
    />
  );
}
