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
        radius: radius + 9,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.16,
        pane: "shadowPane",
      }).addTo(layerGroup);
    }

    leaflet.circleMarker([node.latitude, node.longitude], {
      radius: radius + 3,
      color,
      weight: node.highlight ? 2.5 : 1.5,
      opacity,
      fillOpacity: 0,
    }).addTo(layerGroup);

    const marker = leaflet.circleMarker([node.latitude, node.longitude], {
      radius,
      color: "#080A0C",
      weight: 1,
      opacity: 0.5,
      fillColor: color,
      fillOpacity: Math.max(opacity, 0.3),
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
    const bounds = leaflet.latLngBounds(nodes.map((node) => [node.latitude, node.longitude] as [number, number]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.14), {
        animate: false,
        padding: [28, 28],
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
        preferCanvas: true,
        scrollWheelZoom: true,
      });
      map.setView([40.4168, -3.7038], 10.5);

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
        crossOrigin: true,
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
