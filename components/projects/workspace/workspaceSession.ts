import type { CreatedElement } from "./components/types";

// ─── Rebar sub-types ──────────────────────────────────────────────────────────

export interface VariantRebarBar {
  id: string;
  size: string;
  count: string;
  depth: string;
}

export interface VariantRebar {
  method: "read" | "manual";
  mainBars: VariantRebarBar[];
  additionBars: VariantRebarBar[];
  includeStirups: boolean;
  stirrupSize: string;
  stirrupSpacing: string;
}

// ─── Canvas measurement snapshot ─────────────────────────────────────────────

export interface VariantCanvasMeasurement {
  tool: "count" | "length" | "area";
  count: number;
  length: number;
  area: number;
  unit: string;
  /** IDs of canvas Measurement objects belonging to this variant */
  measurementIds: string[];
}

// ─── Scale calibration snapshot — same shape the backend's canvas.calibration
// expects, carried on each variant so it can be sent along at assign-time
// instead of relying on a separate backend session-level record. ─────────────

export interface VariantCalibration {
  knownDistance: number;
  pixelDistance: number;
  unit: string;
}

// ─── A single saved variant (one "Apply & Continue" click) ───────────────────

export interface WsConcreteMeasurement {
  id: string;
  measureType: string;
  tag: string;
  concreteFields: Record<string, string>;
  rebar: VariantRebar | null;
  canvas: VariantCanvasMeasurement;
  calibration: VariantCalibration | null;
  sessionId: string | null;
  drawingId: string | null;
  pageNumber: number;
  savedAt: number;
}

// ─── Legacy — kept for backwards-compat reads during migration ────────────────

export interface WsBBSRow {
  id: string;
  mark: string;
  size: string;
  length: string;
  quantity: string;
}

export interface WsElementAssignment {
  id: string;
  elementId: string;
  elementName: string;
  assignedAt: number;
}

export interface SessionDrawing {
  id: string;
  name: string;
  url: string;
  extension: string;
  size: number;
}

// ─── Full workspace session ───────────────────────────────────────────────────

export interface WorkspaceSession {
  showRebarTab: boolean;
  bbsAnswer: "yes" | "no";
  bbsRows: WsBBSRow[];
  scaleWhat: string;
  knownDistance: string;
  distanceUnit: string;
  scaleInfo: string | null;
  scaleLocked: boolean;
  scaleFlowActive: boolean;
  scaleFactor: number | null;
  /** Pending variants — cleared when all are assigned to an element */
  concreteMeasurements: WsConcreteMeasurement[];
  /** All created elements for this project (single source of truth) */
  createdElements: CreatedElement[];
  elementAssignments: WsElementAssignment[];
  drawings: SessionDrawing[];
  /** Floating Element Detail Panel — position relative to the canvas viewport, and collapsed state */
  elementPanelPos: { x: number; y: number } | null;
  elementPanelCollapsed: boolean;
  /** Left workspace sidebar — collapses to a small floating header, canvas fills the freed space */
  sidebarCollapsed: boolean;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const sessionKey = (projectId: string) => `qs-ws-${projectId}`;
const legacyElementsKey = (projectId: string) => `ws-elements-${projectId}`;

export function loadSession(projectId: string): Partial<WorkspaceSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(sessionKey(projectId));
    const session: Partial<WorkspaceSession> = raw ? (JSON.parse(raw) as Partial<WorkspaceSession>) : {};

    // One-time migration: pull elements from the legacy separate key into the session
    const legacyRaw = localStorage.getItem(legacyElementsKey(projectId));
    if (legacyRaw) {
      const legacyElements = JSON.parse(legacyRaw) as CreatedElement[];
      if (legacyElements.length > 0 && !session.createdElements?.length) {
        session.createdElements = legacyElements;
        localStorage.setItem(sessionKey(projectId), JSON.stringify(session));
      }
      localStorage.removeItem(legacyElementsKey(projectId));
    }

    return session;
  } catch {
    return {};
  }
}

export function saveSession(projectId: string, patch: Partial<WorkspaceSession>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSession(projectId);
    localStorage.setItem(sessionKey(projectId), JSON.stringify({ ...existing, ...patch }));
  } catch {}
}

export function clearSession(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(sessionKey(projectId));
    localStorage.removeItem(legacyElementsKey(projectId));
  } catch {}
}

// ─── Page-scoped calibration ────────────────────────────────────────────────
// Calibration is applied entirely on the frontend now (no backend call at Apply
// Scale time), so it needs its own per-page storage the same way raw canvas
// marks already have (useCanvasMeasurements) — otherwise every page would
// share one flat scale value and a reload would restore the wrong page's scale
// (or none at all).

export interface PageCalibrationData {
  knownDistance: string;
  distanceUnit: string;
  scaleInfo: string;
  scaleLocked: boolean;
}

const calibrationKey = (drawingId: string, page: number) =>
  `ws-calibration-v1-${drawingId}-p${page}`;

export function loadPageCalibration(
  drawingId: string,
  page: number,
): PageCalibrationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(calibrationKey(drawingId, page));
    return raw ? (JSON.parse(raw) as PageCalibrationData) : null;
  } catch {
    return null;
  }
}

export function savePageCalibration(
  drawingId: string,
  page: number,
  data: PageCalibrationData,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(calibrationKey(drawingId, page), JSON.stringify(data));
  } catch {}
}

export function clearPageCalibration(drawingId: string, page: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(calibrationKey(drawingId, page));
  } catch {}
}

// ─── Page-scoped in-progress variant id ─────────────────────────────────────
// The workspace upserts every auto-save / "Apply & Continue" under one stable
// clientId (currentVariantId) so repeated saves of the same measurement round
// stay idempotent. That id used to be a single component-level ref, so leaving
// a page and coming back — or the mark-count auto-save firing right after a
// page swap — reused an id that no longer matched the page's round and spawned
// a duplicate "In Progress" row. Persisting the id per drawing+page lets a
// return to the same page continue the same variant instead of starting a new
// one from scratch.

const draftVariantKey = (projectId: string, drawingId: string, page: number) =>
  `ws-draft-variant-v1-${projectId}-${drawingId}-p${page}`;

export function loadPageDraftVariantId(
  projectId: string,
  drawingId: string,
  page: number,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(draftVariantKey(projectId, drawingId, page));
  } catch {
    return null;
  }
}

export function savePageDraftVariantId(
  projectId: string,
  drawingId: string,
  page: number,
  variantId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(draftVariantKey(projectId, drawingId, page), variantId);
  } catch {}
}

export function clearPageDraftVariantId(
  projectId: string,
  drawingId: string,
  page: number,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(draftVariantKey(projectId, drawingId, page));
  } catch {}
}
