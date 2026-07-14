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
