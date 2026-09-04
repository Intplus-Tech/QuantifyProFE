/**
 * Wire types for the AI Takeoff API.
 * Mirrors the QuantifyPro OpenAPI document (openapi 3.0.0, "AI Takeoff" tag).
 */

/** Element types the detector accepts. Must also be allowed by the project's QS project type. */
export const AI_ELEMENT_TYPES = [
  "column_in_foundation",
  "pile_cap",
  "ground_beam",
  "raft_foundation",
  "strip_foundation",
  "pile",
  "column",
  "beam",
  "slab",
  "staircase",
  "staircase_landing",
  "staircase_strings_steps",
  "staircase_upper_floors",
  "wall",
  "swimming_pool",
  "oversite_slab",
  "column_footing",
  "pile_cap_frames",
  "shear_wall",
  "lift_wall",
  "lintels",
  "roof_column",
  "roof_beam",
  "kitchen_countertop",
  "excavation_clearing",
  "excavation_strip",
  "ddt_pad_pit_in_strip",
  "strip_length_calculator",
  "pad_footing",
  "ground_floor_bed",
  "excavation_ground_beam",
  "ground_floor_bed_void",
  "water_slab",
  "roof_slab",
  "upper_floor_ddt_void",
  "parapet_wall",
  "parapet_wall_copping",
] as const;

export type AiElementType = (typeof AI_ELEMENT_TYPES)[number];

export type AiJobStatus = "queued" | "processing" | "completed" | "failed";
export type AiReviewStatus = "pending" | "accepted" | "rejected";
export type MeasurementSessionStatus = "active" | "paused" | "finalized";
export type MeasurementUnit = "mm" | "cm" | "m" | "ft" | "in" | "px";

export type MeasurementTool =
  | "count"
  | "length"
  | "area"
  | "polyline"
  | "rectangle"
  | "circle"
  | "bending"
  | "freehand";

export type MeasurementGeometryType =
  | "point"
  | "multipoint"
  | "polyline"
  | "polygon"
  | "rectangle"
  | "circle"
  | "freehand";

export interface MeasurementGeometry {
  type: MeasurementGeometryType;
  /** ordered [x, y] pixel pairs */
  points: number[][];
  radius?: number;
  page?: number;
}

export interface MeasurementComputed {
  count?: number;
  lengthPx?: number;
  length?: number;
  areaPx?: number;
  area?: number;
  perimeterPx?: number;
  perimeter?: number;
}

export interface MeasurementElement {
  _id: string;
  sessionId: string;
  projectId: string;
  clientId: string;
  tool: MeasurementTool;
  label?: string;
  mapsToElementType?: string;
  floorLabel?: string;
  geometry: MeasurementGeometry;
  style?: { color?: string; strokeWidth?: number };
  computed?: MeasurementComputed;
  /** single object, or an array for multi-tag elements (PC1, PC2, …) */
  attributes?: Record<string, unknown> | Record<string, unknown>[];
  version?: number;
}

export interface AiDetectedMeasurementElement extends MeasurementElement {
  source?: "manual" | "ai";
  /** 0–1 model confidence */
  confidence?: number;
  reviewStatus?: AiReviewStatus;
  aiJobId?: string;
}

export interface MeasurementCanvas {
  [key: string]: unknown;
}

export interface MeasurementSession {
  _id: string;
  projectId: string;
  uploadedFileId: string;
  pageNumber?: number;
  title?: string;
  status: MeasurementSessionStatus;
  canvas?: MeasurementCanvas;
  lastActivityAt?: string;
}

export interface AiTakeoffJobUsage {
  inputTokens?: number;
  outputTokens?: number;
  costUSD?: number;
  durationMs?: number;
}

export interface AiTakeoffJob {
  _id: string;
  projectId: string;
  sessionId: string;
  uploadedFileId: string;
  pageNumber: number;
  status: AiJobStatus;
  requestedElementTypes?: string[];
  provider?: string;
  aiModel?: string;
  detectedCount?: number;
  /** detections dropped for unusable geometry */
  discardedCount?: number;
  /** model observations about the page as a whole */
  notes?: string;
  usage?: AiTakeoffJobUsage;
  creditsReserved?: number;
  creditsCharged?: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

// ── Request bodies ──────────────────────────────────────────────────────────

export interface CreateAiSessionBody {
  uploadedFileId: string;
  title?: string;
  resume?: boolean;
}

export interface AnalysePageBody {
  /** 1-based page index within the drawing */
  pageNumber: number;
  /** uploaded raster of this page */
  uploadedFileId: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  /** real-world units per pixel; send this, or scaleX/scaleY, or both */
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  elementTypes: string[];
  drawingHint?: string;
  /** clear previous AI detections for this page first (default true) */
  replaceExisting?: boolean;
}

export interface ReviewElementsBody {
  clientIds: string[];
  status: AiReviewStatus;
}

export interface FinishSessionBody {
  /** also run the takeoff commit to build the BOQ */
  commit?: boolean;
}

// ── Response payloads ───────────────────────────────────────────────────────

export interface CreateAiSessionData {
  session: MeasurementSession;
  [key: string]: unknown;
}

export interface HydrateSessionData {
  session: MeasurementSession;
  elements: AiDetectedMeasurementElement[];
  jobs: AiTakeoffJob[];
}

export interface AnalysePageData {
  job: AiTakeoffJob;
  session: MeasurementSession;
}

/** The persisted BOQ the takeoff commit produces. */
export interface BoqWorkItem {
  item?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  notes?: string;
}

export interface BoqResultSection {
  sectionName?: string;
  workItems?: BoqWorkItem[];
}

export interface BoqResult {
  projectTitle?: string;
  sections?: BoqResultSection[];
  generalNotes?: string;
}

export interface FinishSessionData {
  sessionId: string;
  materialized: number;
  skipped: number;
  pendingAtFinalize: number;
  groups: { elementType: string; count: number }[];
  /** present when commit is true */
  boqResult?: BoqResult;
}

// ── Socket.IO realtime (room `measurement:<sessionId>`) ─────────────────────

export const AI_SOCKET_EVENTS = {
  started: "measurement:ai:started",
  completed: "measurement:ai:completed",
  failed: "measurement:ai:failed",
  reviewed: "measurement:ai:reviewed",
} as const;

export interface AiStartedEvent {
  sessionId: string;
  jobId: string;
  pageNumber: number;
}

export interface AiCompletedEvent {
  sessionId: string;
  jobId: string;
  pageNumber: number;
  detectedCount: number;
  discardedCount: number;
  pageNotes?: string;
  elements: AiDetectedMeasurementElement[];
}

export interface AiFailedEvent {
  sessionId: string;
  jobId: string;
  pageNumber: number;
  message: string;
}

export interface AiReviewedEvent {
  sessionId: string;
  status: AiReviewStatus;
  clientIds: string[];
}
