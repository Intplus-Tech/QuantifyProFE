// boq_v2 — the elemental Bill of Quantities document.
//
// Additive to the flat `boqResult` (excel_boq_v1) that still ships on
// GET /projects/:id. This document is served separately from
// GET /projects/:projectId/boq-document and is written by the takeoff commit.

export type BoqDocumentRowType = "item" | "note" | "header" | "spacer";

/** Where the description text came from — "template" wording or a QS rewrite. */
export type BoqDescriptionSource = "template" | "user";

/** The six row fields a QS can override. Each override is added to `row.locked`. */
export type BoqLockableField =
  | "description"
  | "descriptionLeadIn"
  | "unit"
  | "quantity"
  | "rate"
  | "itemCode";

/** Ties a priced row back to the takeoff element that generated it. */
export interface BoqRowOrigin {
  elementId: string;
  elementType: string;
  workType: string;
}

export interface BoqDocumentRow {
  /** Stable across regeneration — use for keys and PATCH targeting. */
  rowId: string;
  rowType: BoqDocumentRowType;
  /** Continuous A–Z, then AA, AB… across every section in the group. */
  itemCode?: string | null;
  /** Bold, inline, immediately before `description`. Plain text — never HTML. */
  descriptionLeadIn?: string | null;
  description: string;
  descriptionSource?: BoqDescriptionSource;
  /** QS shorthand already — "cum", "sqm", "lm", "tons", "nr", "Item". */
  unit?: string | null;
  quantity?: number | null;
  /** null while unpriced — render an em dash, never ₦0. */
  rate?: number | null;
  /** Server-derived as quantity × rate. Read-only. */
  amount?: number | null;
  /** Field names the QS has overridden; the generator leaves them alone. */
  locked?: BoqLockableField[] | null;
  origin?: BoqRowOrigin | null;
}

export interface BoqDocumentSection {
  sectionId: string;
  /** SMM work-section code — "D20", "E10"… */
  sectionCode: string;
  title: string;
  /** Summed server-side. */
  total: number;
  rows: BoqDocumentRow[];
}

export interface BoqElementGroup {
  /** Stable — use for links and keys. */
  groupId: string;
  groupKey: string;
  /** Renumbers on every commit — display only, never a key. */
  elementNo: number;
  title: string;
  total: number;
  sections: BoqDocumentSection[];
}

export interface BoqDocumentMeta {
  projectTitle: string;
  clientName: string;
  location: string;
  preparedBy: string;
  preparedAt: string;
  currency: string;
}

export interface BoqSummaryEntry {
  groupId: string;
  elementNo: number;
  title: string;
  amount: number;
}

export interface BoqSummaryAdjustment {
  label: string;
  percentage: number;
  amount: number;
}

export interface BoqDocumentSummary {
  entries: BoqSummaryEntry[];
  subTotal: number;
  adjustments: BoqSummaryAdjustment[];
  grandTotal: number;
}

export interface BoqDocument {
  templateVersion: "boq_v2";
  meta: BoqDocumentMeta;
  elementGroups: BoqElementGroup[];
  summary: BoqDocumentSummary;
  generatedAt: string;
}

/** PATCH /projects/:projectId/boq-document/rows/:rowId — send only what changed. */
export interface PatchBoqRowRequest {
  description?: string;
  descriptionLeadIn?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  itemCode?: string;
  /** Hand fields back to the generator on the next commit. */
  unlock?: BoqLockableField[];
}

// ─── Material takeoff (GET /projects/:projectId/material-takeoff) ──────────────

export interface MaterialTakeoffItem {
  /** Machine key — "cement", "sharp_sand", "reinforcement_steel"… */
  material: string;
  label: string;
  /** Measured figure, no waste. */
  netQuantity: number;
  /** What to order — waste included. Show this by default. */
  quantity: number;
  unit: string;
  wastePercentage: number;
}

export interface MaterialTakeoffResult {
  materials: MaterialTakeoffItem[];
  derivedAt: string;
  wasteFactorsApplied: Record<string, number>;
}
