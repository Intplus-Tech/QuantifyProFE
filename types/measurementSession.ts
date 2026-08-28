import { ApiResponse } from "./common";

// ─── Sub-shapes ────────────────────────────────────────────────────────────────

export type MeasurementTool =
  | "count"
  | "area"
  | "length"
  | "polyline"
  | "rectangle"
  | "circle"
  | "bending"
  | "freehand";

export type SessionStatus = "active" | "paused" | "finalized";

export interface MeasurementCalibration {
  knownDistance: number;
  pixelDistance: number;
  unit: string;
}

export interface MeasurementViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface MeasurementCanvas {
  width?: number;
  height?: number;
  scale?: number;
  unit?: string;
  rotation?: number;
  calibration?: MeasurementCalibration;
}

export interface MeasurementGeometry {
  type: "point" | "multipoint" | "polyline" | "polygon" | "rectangle" | "circle" | "freehand";
  points: [number, number][];
  page?: number;
  radius?: number;
  // Multi-variant bundling — one entry per variant in the same order as the
  // parallel `attributes` array, so several variants of the same element
  // (e.g. PC1 + PC2) can go in a single request instead of one call each.
  // Only `rectangles` is confirmed by the backend's docs (pile_cap_multi_attribute
  // example); `polylines`/`pointGroups` follow the same convention as a
  // best-effort extension — extra fields aren't rejected by the schema.
  rectangles?: [number, number][][];
  polylines?: [number, number][][];
  polygons?: [number, number][][];
  pointGroups?: [number, number][][];
}

export interface MeasurementComputed {
  count?: number;
  area?: number;
  areaPx?: number;
  length?: number;
  lengthPx?: number;
}

export interface MeasurementElement {
  clientId: string;
  tool: MeasurementTool;
  label?: string;
  mapsToElementType?: string;
  floorLabel?: string;
  geometry?: MeasurementGeometry;
  // Echoes back whatever shape was sent in UpsertElementBody — a single
  // object for one variant, or an array when several variants of the same
  // element were bundled into one request.
  attributes?: Record<string, unknown> | Record<string, unknown>[];
  computed?: MeasurementComputed;
  version?: number;
}

export interface MeasurementSession {
  _id: string;
  projectId?: string;
  uploadedFileId?: string;
  pageNumber?: number;
  status: SessionStatus;
  canvas: MeasurementCanvas;
  title?: string;
}

// ─── Request bodies ─────────────────────────────────────────────────────────────

export interface CreateSessionBody {
  uploadedFileId: string;
  pageNumber: number;
  title?: string;
  canvas?: {
    width?: number;
    height?: number;
    calibration?: MeasurementCalibration;
    viewport?: MeasurementViewport;
  };
}

export interface UpdateCanvasBody {
  calibration?: MeasurementCalibration;
  viewport?: MeasurementViewport;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface UpsertElementBody {
  clientId: string;
  tool: MeasurementTool;
  label?: string;
  mapsToElementType?: string;
  floorLabel?: string;
  geometry?: MeasurementGeometry;
  style?: { color?: string; strokeWidth?: number };
  // A single object for one variant, or an array — one entry per variant,
  // parallel to geometry's rectangles/polylines/pointGroups — when several
  // variants of the same element are bundled into one request.
  attributes?: Record<string, unknown> | Record<string, unknown>[];
}

export interface UpdateSessionStatusBody {
  status: "active" | "paused";
}

export interface FinalizeSessionBody {
  commit: boolean;
}

// ─── Response data shapes ───────────────────────────────────────────────────────

export interface SessionWithElements {
  session: MeasurementSession;
  elements: MeasurementElement[];
}

export interface UpdatedCanvas {
  _id: string;
  canvas: Pick<MeasurementCanvas, "scale" | "unit">;
}

export interface FinalizeResult {
  sessionId: string;
  materialized: number;
  skipped: number;
  groups: { elementType: string; count: number }[];
}

export interface UpdatedSessionStatus {
  _id: string;
  status: SessionStatus;
}

// ─── Typed ApiResponse aliases ──────────────────────────────────────────────────

export type GetSessionResponse = ApiResponse<SessionWithElements>;
export type DeleteSessionResponse = ApiResponse<null>;
export type UpdateCanvasResponse = ApiResponse<UpdatedCanvas>;
export type GetElementsResponse = ApiResponse<MeasurementElement[]>;
export type UpsertElementResponse = ApiResponse<MeasurementElement>;
export type DeleteElementResponse = ApiResponse<null>;
export type FinalizeSessionResponse = ApiResponse<FinalizeResult>;
export type UpdateStatusResponse = ApiResponse<UpdatedSessionStatus>;
export type CreateSessionResponse = ApiResponse<MeasurementSession>;
export type ListSessionsResponse = ApiResponse<Pick<MeasurementSession, "_id" | "status" | "pageNumber">[]>;
