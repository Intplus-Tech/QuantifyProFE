export type ToolId = "length" | "area" | "count" | "text" | "undo" | "redo";

export interface BBSRow {
  id: string;
  mark: string;
  size: string;
  length: string;
  quantity: string;
}

export interface RebarBar {
  id: string;
  size: string;
  count: string;
  depth: string;
}

export interface PileRow {
  id: string;
  name: string;
  count: string;
  volume: string;
}

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

export interface CreatedElement {
  id: string;
  name: string;
  category: string;
  variants: PileRow[];
  drawnCount: number;
  createdAt: number;
}

// ── Measurement system ────────────────────────────────────────────────────────

export type MPoint = { x: number; y: number };

export interface LengthMeasurement {
  id: string;
  type: "length";
  points: MPoint[];
  /** Total length in base (scale=1) pixels */
  pixelLength: number;
  realLength: number;
  unit: string;
  color: string;
}

export interface AreaMeasurement {
  id: string;
  type: "area";
  points: MPoint[];
  /** Area in base (scale=1) pixels² */
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
  /** base pixels per real unit — null until calibrated */
  scaleFactor: number | null;
  calibPts: [MPoint, MPoint] | null;
  measurements: Measurement[];
}
