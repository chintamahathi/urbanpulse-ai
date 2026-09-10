import { useEffect, useRef, useState } from "react";
import type { GeoPoint, Severity } from "@/lib/types";
import { CITY } from "@/mock/geo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";

export interface MapMarkerSpec {
  id: string;
  kind: "bus" | "pothole" | "crack" | "traffic" | "incident" | "waterlogging" | "pedestrian_risk" | "infrastructure";
  severity: Severity;
  position: GeoPoint;
  label: string;
  heading?: number;
  pulse?: boolean;
}

export interface MapLineSpec {
  id: string;
  path: GeoPoint[];
  severity: Severity;
  width?: number;
}

export interface MapHeatSpec {
  position: GeoPoint;
  weight: number;
}

interface Props {
  markers?: MapMarkerSpec[];
  lines?: MapLineSpec[];
  heat?: MapHeatSpec[];
  center?: GeoPoint;
  zoom?: number;
  className?: string;
  onSelect?: (marker: MapMarkerSpec) => void;
  interactive?: boolean;
  fitTo?: GeoPoint[];
}

const SEVERITY_VAR: Record<Severity, string> = {
  critical: "var(--critical)",
  high: "var(--elevated)",
  medium: "var(--warn)",
  low: "var(--ok)",
};

const ICON: Record<MapMarkerSpec["kind"], string> = {
  bus: "M4 15h16M6 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 15V6h14v9",
  pothole: "M4 17c3-1 5 1 8 0s5-3 8-2M7 11l2-2 2 2-2 2z",
  crack: "M12 3l-3 7 4 2-3 9",
  traffic: "M6 6h12v5H6zm0 7h12v5H6z",
  incident: "M12 4l9 16H3z M12 10v4",
  waterlogging: "M12 4c3 4 5 6 5 9a5 5 0 01-10 0c0-3 2-5 5-9z",
  pedestrian_risk: "M12 4a1.6 1.6 0 100 3 1.6 1.6 0 000-3zm0 4l-3 4 1 8m2-12l3 4-1 8",
  infrastructure: "M4 20V9l8-5 8 5v11M9 20v-6h6v6",
};

function markerEl(m: MapMarkerSpec): HTMLElement {
  const el = document.createElement("div");
  el.className = "relative flex h-6 w-6 items-center justify-center";
  const color = SEVERITY_VAR[m.severity];
  const isBus = m.kind === "bus";
  el.innerHTML = `
    ${
      m.pulse
        ? `<span class="absolute inset-0 rounded-full animate-pulse-ring" style="background:${color};opacity:.35"></span>`
        : ""
    }
    <span class="relative flex items-center justify-center rounded-[4px] border"
      style="height:${isBus ? 20 : 18}px;width:${isBus ? 20 : 18}px;background:color-mix(in oklab, ${
        isBus ? "var(--intel)" : color
      } 22%, var(--background));border-color:${isBus ? "var(--intel)" : color};box-shadow:0 0 10px -2px ${
        isBus ? "var(--intel)" : color
      };${isBus ? `transform:rotate(${m.heading ?? 0}deg)` : ""}">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${
        isBus ? "var(--intel)" : color
      }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[m.kind]}"/></svg>
    </span>`;
  el.title = m.label;
  el.style.cursor = "pointer";
  return el;
}

function mapStyle(theme: "dark" | "light") {
  const prefix = theme === "dark" ? "dark" : "light";
  return {
    version: 8 as const,
    sources: {
      basemap: {
        type: "raster" as const,
        tiles: [
          `https://a.basemaps.cartocdn.com/${prefix}_nolabels/{z}/{x}/{y}@2x.png`,
          `https://b.basemaps.cartocdn.com/${prefix}_nolabels/{z}/{x}/{y}@2x.png`,
          `https://c.basemaps.cartocdn.com/${prefix}_nolabels/{z}/{x}/{y}@2x.png`,
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap · © CARTO — DEMO DATA",
      },
      labels: {
        type: "raster" as const,
        tiles: [`https://a.basemaps.cartocdn.com/${prefix}_only_labels/{z}/{x}/{y}@2x.png`],
        tileSize: 256,
      },
    },
    layers: [
      { id: "bg", type: "background" as const, paint: { "background-color": "var(--background)" } },
      { id: "basemap", type: "raster" as const, source: "basemap", paint: { "raster-opacity": theme === "dark" ? 0.85 : 0.92 } },
      { id: "labels", type: "raster" as const, source: "labels", paint: { "raster-opacity": theme === "dark" ? 0.6 : 0.72 } },
    ],
  };
}

export default function LiveMap({
  markers = [],
  lines = [],
  heat = [],
  center = CITY.center,
  zoom = CITY.zoom,
  className,
  onSelect,
  interactive = true,
  fitTo,
}: Props) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const libRef = useRef<any>(null);
  const markerRefs = useRef<Map<string, any>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod: any = await import("maplibre-gl");
      const maplibregl = mod.default ?? mod;
      if (cancelled || !containerRef.current) return;
      libRef.current = maplibregl;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: mapStyle(resolvedTheme),
        center: [center.lng, center.lat],
        zoom,
        attributionControl: { compact: true },
        interactive,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        map.addSource("us-lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "us-lines-glow",
          type: "line",
          source: "us-lines",
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["*", ["get", "width"], 3],
            "line-opacity": 0.18,
            "line-blur": 6,
          },
        });
        map.addLayer({
          id: "us-lines-core",
          type: "line",
          source: "us-lines",
          paint: { "line-color": ["get", "color"], "line-width": ["get", "width"], "line-opacity": 0.9 },
        });
        map.addSource("us-heat", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "us-heat-layer",
          type: "heatmap",
          source: "us-heat",
          paint: {
            "heatmap-weight": ["get", "weight"],
            "heatmap-intensity": 1.1,
            "heatmap-radius": 44,
            "heatmap-opacity": 0.65,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0,0,0,0)",
              0.25,
              "rgba(56,189,248,0.45)",
              0.5,
              "rgba(250,204,21,0.55)",
              0.75,
              "rgba(249,115,22,0.65)",
              1,
              "rgba(239,68,68,0.8)",
            ],
          },
        });
        if (!cancelled) setReady(true);
      });
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setStyle(mapStyle(resolvedTheme));
    setReady(false);
    map.once("style.load", () => {
      map.addSource("us-lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "us-lines-glow", type: "line", source: "us-lines", paint: { "line-color": ["get", "color"], "line-width": ["*", ["get", "width"], 3], "line-opacity": 0.18, "line-blur": 6 } });
      map.addLayer({ id: "us-lines-core", type: "line", source: "us-lines", paint: { "line-color": ["get", "color"], "line-width": ["get", "width"], "line-opacity": 0.9 } });
      map.addSource("us-heat", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "us-heat-layer",
        type: "heatmap",
        source: "us-heat",
        paint: {
          "heatmap-weight": ["get", "weight"], "heatmap-intensity": 1.1, "heatmap-radius": 44, "heatmap-opacity": 0.65,
          "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)", 0.25, "rgba(56,189,248,0.45)", 0.5, "rgba(250,204,21,0.55)", 0.75, "rgba(249,115,22,0.65)", 1, "rgba(239,68,68,0.8)"],
        },
      });
      setReady(true);
    });
  }, [resolvedTheme]);

  /* markers */
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !ready) return;
    const seen = new Set<string>();
    for (const m of markers) {
      seen.add(m.id);
      const existing = markerRefs.current.get(m.id);
      if (existing) {
        existing.setLngLat([m.position.lng, m.position.lat]);
        const svgHolder = existing.getElement().querySelector("span.relative") as HTMLElement | null;
        if (svgHolder && m.kind === "bus") svgHolder.style.transform = `rotate(${m.heading ?? 0}deg)`;
        continue;
      }
      const el = markerEl(m);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(m);
      });
      const marker = new lib.Marker({ element: el }).setLngLat([m.position.lng, m.position.lat]).addTo(map);
      markerRefs.current.set(m.id, marker);
    }
    markerRefs.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove();
        markerRefs.current.delete(id);
      }
    });
  }, [markers, ready, onSelect]);

  /* lines */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource("us-lines");
    src?.setData({
      type: "FeatureCollection",
      features: lines.map((l) => ({
        type: "Feature",
        properties: { color: SEVERITY_VAR[l.severity], width: l.width ?? 3 },
        geometry: { type: "LineString", coordinates: l.path.map((p) => [p.lng, p.lat]) },
      })),
    });
  }, [lines, ready]);

  /* heat */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getSource("us-heat")?.setData({
      type: "FeatureCollection",
      features: heat.map((h) => ({
        type: "Feature",
        properties: { weight: h.weight },
        geometry: { type: "Point", coordinates: [h.position.lng, h.position.lat] },
      })),
    });
    if (map.getLayer("us-heat-layer"))
      map.setLayoutProperty("us-heat-layer", "visibility", heat.length ? "visible" : "none");
  }, [heat, ready]);

  /* fit */
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !ready || !fitTo?.length) return;
    const b = new lib.LngLatBounds();
    fitTo.forEach((p) => b.extend([p.lng, p.lat]));
    map.fitBounds(b, { padding: 80, duration: 900, maxZoom: 15 });
  }, [fitTo, ready]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <span className="label-mono animate-blink">INITIALISING GIS LAYERS…</span>
        </div>
      )}
    </div>
  );
}
