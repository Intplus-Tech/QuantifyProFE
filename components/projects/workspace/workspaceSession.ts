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

// ─── A single saved variant (one "Apply & Continue" click) ───────────────────

export interface WsConcreteMeasurement {
  id: string;
  measureType: string;
  tag: string;
  concreteFields: Record<string, string>;
  rebar: VariantRebar | null;
  canvas: VariantCanvasMeasurement;
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
