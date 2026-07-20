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
  attributes?: Record<string, unknown>;
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
  attributes?: Record<string, unknown>;
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
