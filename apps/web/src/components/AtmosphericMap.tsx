"use client";

import { useEffect, useRef } from "react";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletLayerGroup = import("leaflet").LayerGroup;

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
};

const MADRID_REFERENCE_BOUNDS: [[number, number], [number, number]] = [
  [40.22, -4.28],
  [41.08, -3.18],
];

const MADRID_CORE: [number, number] = [40.4168, -3.7038];

const DARK_BASEMAP_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

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
  return 8 + (clamped / 300) * 14;
}

function renderStations(
  leaflet: LeafletModule,
  map: LeafletMap,
  layerGroup: LeafletLayerGroup,
  nodes: MapNode[],
  onStationSelect?: (stationId: string) => void,
  fitBounds = false,
) {
  layerGroup.clearLayers();

  if (nodes.length === 0) {
    map.setView([40.4168, -3.7038], 10.5);
    return;
  }

  nodes.forEach((node) => {
    const color = RISK_COLORS[node.risk_level ?? "unknown"] ?? RISK_COLORS.unknown;
    const opacity = FRESHNESS_OPACITY[node.freshness] ?? 0.5;
    const radius = valueToRadius(node.value);

    if (node.highlight) {
      leaflet.circleMarker([node.latitude, node.longitude], {
        radius: radius + 11,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.2,
        pane: "shadowPane",
      }).addTo(layerGroup);
    }

    leaflet.circleMarker([node.latitude, node.longitude], {
      radius: radius + 4,
      color: "#F4F1EA",
      weight: node.highlight ? 2.6 : 2,
      opacity: 0.9,
      fillOpacity: 0,
    }).addTo(layerGroup);

    const marker = leaflet.circleMarker([node.latitude, node.longitude], {
      radius,
      color: "#111418",
      weight: 1.3,
      opacity: 0.78,
      fillColor: color,
      fillOpacity: Math.max(opacity, 0.72),
    }).addTo(layerGroup);

    leaflet.circleMarker([node.latitude, node.longitude], {
      radius: Math.max(2.2, radius * 0.22),
      stroke: false,
      fillColor: "#081014",
      fillOpacity: 0.92,
      interactive: false,
    }).addTo(layerGroup);

    marker.bindTooltip(node.label, {
      direction: "top",
      offset: [0, -radius],
      opacity: 0.92,
    });

    if (onStationSelect) {
      marker.on("click", () => onStationSelect(node.station_id));
    }
  });

  if (fitBounds) {
    const stationBounds = leaflet.latLngBounds(nodes.map((node) => [node.latitude, node.longitude] as [number, number]));
    const focusBounds = leaflet.latLngBounds(MADRID_REFERENCE_BOUNDS);

    if (stationBounds.isValid()) {
      focusBounds.extend(stationBounds);
      map.fitBounds(focusBounds, {
        animate: false,
        padding: [18, 18],
        maxZoom: 9.9,
      });
    }
  }
}

export function AtmosphericMap({
  nodes,
  onStationSelect,
  className,
}: AtmosphericMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<LeafletLayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const boundsAppliedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let disposed = false;

    void import("leaflet").then((leaflet) => {
      if (disposed || !containerRef.current) {
        return;
      }

      const map = leaflet.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        minZoom: 8.5,
      });
      map.setView([40.4168, -3.7038], 10.5);

      leaflet.tileLayer(DARK_BASEMAP_URL, {
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      leaflet.circle(MADRID_CORE, {
        radius: 19000,
        color: "#C60B1E",
        weight: 1,
        opacity: 0.22,
        fillColor: "#C60B1E",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(map);

      leaflet.control.zoom({ position: "topright" }).addTo(map);
      leaflet.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution("&copy; OpenStreetMap contributors")
        .addTo(map);

      const layerGroup = leaflet.layerGroup().addTo(map);
      leafletRef.current = leaflet;
      mapRef.current = map;
      layerGroupRef.current = layerGroup;

      renderStations(leaflet, map, layerGroup, nodes, onStationSelect, true);
      boundsAppliedRef.current = true;

      requestAnimationFrame(() => {
        map.invalidateSize(false);
      });
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      leafletRef.current = null;
      boundsAppliedRef.current = false;
    };
  }, [nodes, onStationSelect]);

  useEffect(() => {
    if (!leafletRef.current || !mapRef.current || !layerGroupRef.current) {
      return;
    }

    renderStations(
      leafletRef.current,
      mapRef.current,
      layerGroupRef.current,
      nodes,
      onStationSelect,
      !boundsAppliedRef.current,
    );
    boundsAppliedRef.current = true;
  }, [nodes, onStationSelect]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: "400px" }}
      aria-label="Mapa de estaciones de calidad del aire en Madrid"
    />
  );
}
