import type { WsConcreteMeasurement, VariantCanvasMeasurement } from "../workspaceSession";

// ─── Tool IDs ─────────────────────────────────────────────────────────────────

export type ToolId = "length" | "area" | "count" | "text" | "undo" | "redo";

// ─── BBS ──────────────────────────────────────────────────────────────────────

export interface BBSRow {
  id: string;
  mark: string;
  size: string;
  length: string;
  quantity: string;
}

// ─── Rebar ───────────────────────────────────────────────────────────────────

export interface RebarBar {
  id: string;
  size: string;
  count: string;
  depth: string;
}

// ─── Pile row — display-only, used inside CreateNewElementModal table ─────────

export interface PileRow {
  id: string;
  name: string;
  count: string;
  volume: string;
}

// ─── Element concrete config (field definitions per measure type) ─────────────

export interface ConcreteFieldDef {
  key: string;
  label: string;
  defaultValue: string;
  type?: "text" | "select";
  options?: string[];
}

export interface ConcreteRowDef {
  sectionLabel?: string;
  fields: ConcreteFieldDef[];
}

export interface ElementConcreteConfig {
  sectionHeader: string;
  tagLabel: string;
  tagPlaceholder: string;
  measureLabel: string;
  measureUnit: string;
  mockMeasureValue: string;
  rows: ConcreteRowDef[];
}

// ─── Created element ──────────────────────────────────────────────────────────

export interface CreatedElement {
  id: string;
  name: string;
  category: string;
  categoryFolder: string;
  measurementUnit: string;
  /** Full variant data (concrete + rebar + canvas) for every "Apply & Continue" saved */
  variants: WsConcreteMeasurement[];
  sessionId: string | null;
  drawingId: string | null;
  pageNumber: number;
  createdAt: number;
}

// ─── Volume computation ───────────────────────────────────────────────────────

/**
 * Derives a display volume string from concrete fields + canvas measurement.
 * All arithmetic is best-effort — returns "0" when fields are absent or NaN.
 */
export function computeVolume(
  measureType: string,
  fields: Record<string, string>,
  canvas: VariantCanvasMeasurement,
): string {
  const n = (key: string) => parseFloat(fields[key] ?? "0") || 0;
  const pi = Math.PI;

  switch (measureType) {
    case "Pile": {
      const depth = n("depth");
      const diameter = n("diameter");
      const radius = diameter / 2;
      const vol = pi * radius * radius * depth;
      return vol > 0 ? vol.toFixed(3) : "0";
    }
    case "Column in Foundation":
    case "Shear Wall": {
      const shape = fields["shape"] ?? "Square";
      const depth = n("depth");
      const height = n("height");
      const actualDepth = depth || height;
      if (shape === "Circular") {
        const diameter = n("diameter");
        const vol = pi * Math.pow(diameter / 2, 2) * actualDepth;
        return vol > 0 ? vol.toFixed(3) : "0";
      }
      const width = n("width");
      const breadth = n("breadth") || width;
      const vol = width * breadth * actualDepth;
      return vol > 0 ? vol.toFixed(3) : "0";
    }
    case "Ground Beam":
    case "Roof Beams":
    case "Roof Upstands / Parapet":
    case "Roof Gutter": {
      const width = n("width");
      const depth = n("depth") || n("height");
      const length = canvas.length;
      const vol = width * depth * length;
      return vol > 0 ? vol.toFixed(3) : "0";
    }
    case "Strip": {
      const excavDepth = n("excavationDepth");
      const length = canvas.length;
      const vol = excavDepth * length;
      return vol > 0 ? vol.toFixed(3) : "0";
    }
    case "Slabs":
    case "Roof Slab": {
      const thickness = n("thickness");
      const area = canvas.area;
      const vol = thickness * area;
      return vol > 0 ? vol.toFixed(3) : "0";
    }
    default:
      return "0";
  }
}

/**
 * Returns a human-readable summary of the canvas measurement value for a variant,
 * based on the active tool that was used.
 */
export function variantMeasureDisplay(canvas: VariantCanvasMeasurement): string {
  switch (canvas.tool) {
    case "count":
      return `${canvas.count} item${canvas.count !== 1 ? "s" : ""}`;
    case "length":
      return `${canvas.length.toFixed(2)} ${canvas.unit}`;
    case "area":
      return `${canvas.area.toFixed(2)} ${canvas.unit === "Meters" ? "m²" : `${canvas.unit}²`}`;
  }
}

/**
 * Returns a total measure label across all variants in an element.
 * Used in the sidebar element row and assign modals.
 */
export function elementTotalDisplay(variants: WsConcreteMeasurement[]): string {
  if (variants.length === 0) return "0 items";
  const tool = variants[0].canvas.tool;
  switch (tool) {
    case "count": {
      const total = variants.reduce((s, v) => s + v.canvas.count, 0);
      return `${total} item${total !== 1 ? "s" : ""}`;
    }
    case "length": {
      const total = variants.reduce((s, v) => s + v.canvas.length, 0);
      const unit = variants[0].canvas.unit;
      return `${total.toFixed(2)} ${unit}`;
    }
    case "area": {
      const total = variants.reduce((s, v) => s + v.canvas.area, 0);
      const unit = variants[0].canvas.unit;
      return `${total.toFixed(2)} ${unit === "Meters" ? "m²" : `${unit}²`}`;
    }
  }
}

// ─── Measurement canvas types ─────────────────────────────────────────────────

export type MPoint = { x: number; y: number };

export interface LengthMeasurement {
  id: string;
  type: "length";
  points: MPoint[];
  pixelLength: number;
  realLength: number;
  unit: string;
  color: string;
}

export interface AreaMeasurement {
  id: string;
  type: "area";
  points: MPoint[];
  pixelArea: number;
  realArea: number;
  unit: string;
  color: string;
}

export interface CountMark {
  id: string;
  type: "count";
  point: MPoint;
  index: number;
  color: string;
}

export type Measurement = LengthMeasurement | AreaMeasurement | CountMark;

export interface PageMeasurements {
  scaleFactor: number | null;
  calibPts: [MPoint, MPoint] | null;
  measurements: Measurement[];
}
