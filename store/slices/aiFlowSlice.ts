import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CONTINGENCY_PCT,
  DEFAULT_GLOBAL_PARAMETERS,
  EXTRACTION_STEPS,
  MOCK_BBS_GROUPS,
  MOCK_BLINDING_VOLUME,
  MOCK_BOQ_SECTIONS,
  MOCK_CONCRETE_SCHEDULE,
  MOCK_EXTRACTED_GROUPS,
  MOCK_FORMWORK_BREAKDOWN,
  MOCK_FORMWORK_MATERIAL,
  MOCK_PAGES,
  MOCK_PROJECT_META,
  MOCK_REBAR_SCHEDULE,
  VAT_PCT,
} from "@/components/projects/ai/mock-data";
import { barWeight } from "@/components/projects/ai/calc";
import type { AiReviewStatus, MeasurementUnit } from "@/types/aiTakeoff";
import type {
  AiProjectMeta,
  BbsGroup,
  BoqSection,
  ConcreteScheduleRow,
  DrawingPageMeta,
  ElementDimensions,
  ExtractedGroup,
  ExtractionStep,
  FormworkBreakdownRow,
  FormworkMaterialRow,
  GlobalParameters,
  RebarScheduleRow,
} from "@/components/projects/ai/types";

export type AiDrawingStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export interface AiDrawing {
  id: string;
  name: string;
  size: number;
  extension: string;
  status: AiDrawingStatus;
  progress: number;
  previewUrl?: string;
  uploadedUrl?: string;
  /** id returned by POST /uploads, used as the session's uploadedFileId */
  uploadedFileId?: string;
  pageCount?: number;
  error?: string;
}

export interface AiProjectDetails {
  projectTitle: string;
  projectCode: string;
  clientId: string;
  clientName: string;
  projectType: string;
  location: string;
  currency: string;
  description: string;
}

export type ExtractionPhase = "idle" | "running" | "complete" | "cancelled";

/** Server-side handles for the live AI takeoff session. */
export interface AiSessionState {
  /** created project the session hangs off */
  projectId: string | null;
  sessionId: string | null;
  /** upload id of the drawing itself */
  uploadedFileId: string | null;
  /** upload id of the rendered raster per 1-based page number */
  pageUploadIds: Record<number, string>;
  /** page pixel dimensions per page number, required by the analyse call */
  pageSizes: Record<number, { width: number; height: number }>;
  /** in-flight analysis job */
  activeJobId: string | null;
  jobPageNumber: number | null;
  /** real-world units per pixel, and the unit those are expressed in */
  unit: MeasurementUnit;
  scale: number | null;
  finalized: boolean;
  lastError: string | null;
}

export interface AiFlowState {
  details: AiProjectDetails;
  session: AiSessionState;
  drawings: AiDrawing[];
  activeDrawingId: string | null;
  activePage: number;
  pages: DrawingPageMeta[];
  /** measure-type ids selected per page number */
  selectionsByPage: Record<number, string[]>;
  extractionPhase: ExtractionPhase;
  /** stays true once a run has completed, even after the rail returns to select */
  hasExtracted: boolean;
  extractionSteps: ExtractionStep[];
  globalParameters: GlobalParameters;
  groups: ExtractedGroup[];
  /** true once `groups` holds real API detections rather than sample rows */
  groupsAreLive: boolean;
  /** true once `boqSections` holds the committed server BOQ */
  boqIsLive: boolean;
  projectMeta: AiProjectMeta;
  boqSections: BoqSection[];
  concreteSchedule: ConcreteScheduleRow[];
  rebarSchedule: RebarScheduleRow[];
  formworkMaterial: FormworkMaterialRow[];
  blindingVolume: number;
  bbsGroups: BbsGroup[];
  formworkBreakdown: FormworkBreakdownRow[];
  contingencyPct: number;
  vatPct: number;
}

const emptyDetails: AiProjectDetails = {
  projectTitle: "",
  projectCode: "",
  clientId: "",
  clientName: "",
  projectType: "",
  location: "",
  currency: "NGN",
  description: "",
};

// The report slices are seeded from mocks so the Project Audit routes still
// render after a hard refresh. Extraction only flips `extractionPhase`.
// TODO: drop the mock seeds once the extraction endpoints land.
const emptySession: AiSessionState = {
  projectId: null,
  sessionId: null,
  uploadedFileId: null,
  pageUploadIds: {},
  pageSizes: {},
  activeJobId: null,
  jobPageNumber: null,
  unit: "mm",
  // 1 mm per pixel is a neutral starting point so extraction is never blocked.
  // It is almost certainly not the drawing's true scale — every length, area
  // and perimeter is derived from it server-side, so it wants calibrating
  // before the quantities are trusted.
  scale: 1,
  finalized: false,
  lastError: null,
};

const initialState: AiFlowState = {
  details: emptyDetails,
  session: emptySession,
  drawings: [],
  activeDrawingId: null,
  activePage: 1,
  pages: MOCK_PAGES,
  selectionsByPage: {},
  extractionPhase: "idle",
  hasExtracted: false,
  extractionSteps: EXTRACTION_STEPS,
  globalParameters: DEFAULT_GLOBAL_PARAMETERS,
  groups: MOCK_EXTRACTED_GROUPS,
  groupsAreLive: false,
  boqIsLive: false,
  projectMeta: MOCK_PROJECT_META,
  boqSections: MOCK_BOQ_SECTIONS,
  concreteSchedule: MOCK_CONCRETE_SCHEDULE,
  rebarSchedule: MOCK_REBAR_SCHEDULE,
  formworkMaterial: MOCK_FORMWORK_MATERIAL,
  blindingVolume: MOCK_BLINDING_VOLUME,
  bbsGroups: MOCK_BBS_GROUPS,
  formworkBreakdown: MOCK_FORMWORK_BREAKDOWN,
  contingencyPct: CONTINGENCY_PCT,
  vatPct: VAT_PCT,
};

const revoke = (drawing?: AiDrawing) => {
  if (drawing?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(drawing.previewUrl);
};

const aiFlowSlice = createSlice({
  name: "aiFlow",
  initialState,
  reducers: {
    setAiDetails(state, action: PayloadAction<Partial<AiProjectDetails>>) {
      state.details = { ...state.details, ...action.payload };
      if (action.payload.projectTitle) {
        state.projectMeta.projectTitle = action.payload.projectTitle.toUpperCase();
      }
      if (action.payload.clientName) {
        state.projectMeta.clientName = action.payload.clientName.toUpperCase();
      }
      if (action.payload.clientName || action.payload.location) {
        const surname =
          state.details.clientName.trim().split(/\s+/).pop() ?? "";
        state.projectMeta.subject = [surname, state.details.location]
          .filter(Boolean)
          .join(" - ")
          .toUpperCase();
      }
      if (action.payload.projectCode) {
        state.projectMeta.siteRef = action.payload.projectCode;
      }
    },

    addAiDrawing(state, action: PayloadAction<AiDrawing>) {
      state.drawings.push(action.payload);
      if (!state.activeDrawingId) state.activeDrawingId = action.payload.id;
    },

    updateAiDrawing(
      state,
      action: PayloadAction<{ id: string; changes: Partial<AiDrawing> }>,
    ) {
      const drawing = state.drawings.find((d) => d.id === action.payload.id);
      if (drawing) Object.assign(drawing, action.payload.changes);
    },

    removeAiDrawing(state, action: PayloadAction<string>) {
      revoke(state.drawings.find((d) => d.id === action.payload));
      state.drawings = state.drawings.filter((d) => d.id !== action.payload);
      if (state.activeDrawingId === action.payload) {
        state.activeDrawingId = state.drawings[0]?.id ?? null;
      }
    },

    clearAiDrawings(state) {
      state.drawings.forEach(revoke);
      state.drawings = [];
      state.activeDrawingId = null;
    },

    setActiveAiDrawing(state, action: PayloadAction<string>) {
      state.activeDrawingId = action.payload;
      state.activePage = 1;
    },

    setAiDrawingPageCount(
      state,
      action: PayloadAction<{ id: string; pageCount: number }>,
    ) {
      const drawing = state.drawings.find((d) => d.id === action.payload.id);
      if (!drawing) return;
      drawing.pageCount = action.payload.pageCount;
      if (state.activeDrawingId === drawing.id) {
        state.pages = Array.from({ length: action.payload.pageCount }, (_, i) => {
          const seeded = MOCK_PAGES[i];
          return { number: i + 1, status: seeded?.status ?? "pending" };
        });
      }
    },

    setActivePage(state, action: PayloadAction<number>) {
      state.activePage = action.payload;
    },

    toggleMeasureType(
      state,
      action: PayloadAction<{ page: number; measureTypeId: string }>,
    ) {
      const { page, measureTypeId } = action.payload;
      const current = state.selectionsByPage[page] ?? [];
      state.selectionsByPage[page] = current.includes(measureTypeId)
        ? current.filter((id) => id !== measureTypeId)
        : [...current, measureTypeId];
    },

    clearPageSelection(state, action: PayloadAction<number>) {
      delete state.selectionsByPage[action.payload];
    },

    startExtraction(state) {
      state.extractionPhase = "running";
      state.extractionSteps = state.extractionSteps.map((step, i) => ({
        ...step,
        status: i === 0 ? "running" : "pending",
      }));
    },

    advanceExtraction(state) {
      const runningIndex = state.extractionSteps.findIndex(
        (s) => s.status === "running",
      );
      if (runningIndex === -1) return;
      state.extractionSteps[runningIndex].status = "done";
      const next = state.extractionSteps[runningIndex + 1];
      if (next) {
        next.status = "running";
      } else {
        state.extractionPhase = "complete";
        state.hasExtracted = true;
      }
    },

    /**
     * A job came back `failed`. Return the rail to the selection panel so the
     * run can be retried — marking it complete would show five green ticks
     * over an extraction that produced nothing.
     */
    failExtraction(state) {
      state.extractionPhase = "idle";
      state.extractionSteps = EXTRACTION_STEPS;
      state.hasExtracted = false;
    },

    /** Jump straight to done — used when a real job reports completion. */
    completeExtraction(state) {
      state.extractionSteps = state.extractionSteps.map((s) => ({
        ...s,
        status: "done",
      }));
      state.extractionPhase = "complete";
      state.hasExtracted = true;
    },

    cancelExtraction(state) {
      state.extractionPhase = "cancelled";
      state.extractionSteps = state.extractionSteps.map((s) => ({
        ...s,
        status: "pending",
      }));
    },

    resetExtraction(state) {
      state.extractionPhase = "idle";
      state.extractionSteps = state.extractionSteps.map((s) => ({
        ...s,
        status: "pending",
      }));
    },

    setGlobalParameter(
      state,
      action: PayloadAction<Partial<GlobalParameters>>,
    ) {
      state.globalParameters = { ...state.globalParameters, ...action.payload };
    },

    updateElementDimensions(
      state,
      action: PayloadAction<{ elementId: string; dimensions: Partial<ElementDimensions> }>,
    ) {
      for (const group of state.groups) {
        const element = group.elements.find((e) => e.id === action.payload.elementId);
        if (!element) continue;
        element.dimensions = { ...element.dimensions, ...action.payload.dimensions };
        const complete = Object.entries(element.dimensions).every(
          ([key, value]) =>
            key === "shape" || key === "diameter" || value !== null,
        );
        if (complete) {
          element.status = "valid";
          element.note = undefined;
        }
        return;
      }
    },

    setElementStatus(
      state,
      action: PayloadAction<{ elementId: string; status: "valid" | "review" | "rejected" }>,
    ) {
      for (const group of state.groups) {
        const element = group.elements.find((e) => e.id === action.payload.elementId);
        if (element) {
          element.status = action.payload.status;
          return;
        }
      }
    },

    updateBoqItem(
      state,
      action: PayloadAction<{
        sectionId: string;
        itemId: string;
        changes: Partial<{ label: string; descriptor: string; qty: number; rate: number | null; concrete: number; rebar: number; formwork: number; excavation: number | null }>;
      }>,
    ) {
      const section = state.boqSections.find((s) => s.id === action.payload.sectionId);
      const item = section?.items.find((i) => i.id === action.payload.itemId);
      if (item) Object.assign(item, action.payload.changes);
    },

    removeBoqItem(
      state,
      action: PayloadAction<{ sectionId: string; itemId: string }>,
    ) {
      const section = state.boqSections.find((s) => s.id === action.payload.sectionId);
      if (section) {
        section.items = section.items.filter((i) => i.id !== action.payload.itemId);
      }
    },

    updateConcreteRow(
      state,
      action: PayloadAction<{ id: string; changes: Partial<ConcreteScheduleRow> }>,
    ) {
      const row = state.concreteSchedule.find((r) => r.id === action.payload.id);
      if (row) Object.assign(row, action.payload.changes);
    },

    updateRebarRow(
      state,
      action: PayloadAction<{ id: string; changes: Partial<RebarScheduleRow> }>,
    ) {
      const row = state.rebarSchedule.find((r) => r.id === action.payload.id);
      if (row) Object.assign(row, action.payload.changes);
    },

    updateFormworkMaterialRow(
      state,
      action: PayloadAction<{ id: string; changes: Partial<FormworkMaterialRow> }>,
    ) {
      const row = state.formworkMaterial.find((r) => r.id === action.payload.id);
      if (row) Object.assign(row, action.payload.changes);
    },

    updateBbsRow(
      state,
      action: PayloadAction<{
        groupId: string;
        rowId: string;
        changes: Partial<{ size: number; noBars: number; cutLength: number; shapeCode: string }>;
      }>,
    ) {
      const group = state.bbsGroups.find((g) => g.id === action.payload.groupId);
      const row = group?.rows.find((r) => r.id === action.payload.rowId);
      if (!row) return;
      Object.assign(row, action.payload.changes);
      row.weight = barWeight(row.size, row.noBars * row.cutLength);
    },

    updateFormworkBreakdownRow(
      state,
      action: PayloadAction<{ id: string; changes: Partial<FormworkBreakdownRow> }>,
    ) {
      const row = state.formworkBreakdown.find((r) => r.id === action.payload.id);
      if (row) Object.assign(row, action.payload.changes);
    },

    // ── Live AI takeoff session ───────────────────────────────────────────

    /**
     * Switching projects invalidates everything scoped to the previous one.
     * Without this, a persisted sessionId outlives its project and every
     * session call answers 404 "Project not found".
     */
    setAiProjectId(state, action: PayloadAction<string>) {
      if (state.session.projectId && state.session.projectId !== action.payload) {
        state.session = { ...emptySession, projectId: action.payload };
        state.drawings = [];
        state.activeDrawingId = null;
        state.groups = [];
        state.groupsAreLive = false;
        state.selectionsByPage = {};
        state.extractionPhase = "idle";
        state.hasExtracted = false;
        state.extractionSteps = EXTRACTION_STEPS;
        return;
      }
      state.session.projectId = action.payload;
    },

    setAiUploadedFileId(state, action: PayloadAction<string>) {
      state.session.uploadedFileId = action.payload;
    },

    setAiSession(
      state,
      action: PayloadAction<{ sessionId: string; uploadedFileId?: string }>,
    ) {
      state.session.sessionId = action.payload.sessionId;
      if (action.payload.uploadedFileId) {
        state.session.uploadedFileId = action.payload.uploadedFileId;
      }
      state.session.finalized = false;
      state.session.lastError = null;

      // A live session owns the tables from here on. Drop the seeded sample
      // rows so nothing fake can be reviewed against the real API.
      if (!state.groupsAreLive) {
        state.groups = [];
      }
    },

    /**
     * Drop a session that the server no longer recognises, keeping the project
     * so the flow can open a fresh one instead of retrying a dead id.
     */
    clearAiSession(state) {
      state.session = { ...emptySession, projectId: state.session.projectId };
      state.extractionPhase = "idle";
      state.extractionSteps = EXTRACTION_STEPS;
      state.hasExtracted = false;
    },

    setAiPageUpload(
      state,
      action: PayloadAction<{
        page: number;
        uploadedFileId: string;
        width: number;
        height: number;
      }>,
    ) {
      const { page, uploadedFileId, width, height } = action.payload;
      state.session.pageUploadIds[page] = uploadedFileId;
      state.session.pageSizes[page] = { width, height };
    },

    setAiScale(
      state,
      action: PayloadAction<{ scale: number | null; unit?: MeasurementUnit }>,
    ) {
      state.session.scale = action.payload.scale;
      if (action.payload.unit) state.session.unit = action.payload.unit;
    },

    setAiActiveJob(
      state,
      action: PayloadAction<{ jobId: string | null; pageNumber?: number | null }>,
    ) {
      state.session.activeJobId = action.payload.jobId;
      state.session.jobPageNumber = action.payload.pageNumber ?? null;
    },

    setAiSessionError(state, action: PayloadAction<string | null>) {
      state.session.lastError = action.payload;
    },

    markAiSessionFinalized(state) {
      state.session.finalized = true;
    },

    /**
     * Replace the BOQ tables with the committed server BOQ returned by
     * POST /ai-takeoff/sessions/:id/finish (commit: true).
     */
    setBoqSections(state, action: PayloadAction<BoqSection[]>) {
      state.boqSections = action.payload;
      state.boqIsLive = true;
    },

    /** Replace the audit tables with detections coming back from the API. */
    setExtractedGroups(state, action: PayloadAction<ExtractedGroup[]>) {
      state.groups = action.payload;
      state.groupsAreLive = true;
    },

    /** Drive the progress checklist from real job state. */
    setExtractionSteps(state, action: PayloadAction<ExtractionStep[]>) {
      state.extractionSteps = action.payload;
    },

    /** Mark a page's audit status as detections arrive. */
    setPageStatus(
      state,
      action: PayloadAction<{ page: number; status: DrawingPageMeta["status"] }>,
    ) {
      const page = state.pages.find((p) => p.number === action.payload.page);
      if (page) page.status = action.payload.status;
      else state.pages.push({ number: action.payload.page, status: action.payload.status });
    },

    /** Reflect a bulk accept/reject locally without refetching. */
    applyElementReview(
      state,
      action: PayloadAction<{ clientIds: string[]; status: AiReviewStatus }>,
    ) {
      const mapped =
        action.payload.status === "accepted"
          ? "valid"
          : action.payload.status === "rejected"
            ? "rejected"
            : "review";
      const ids = new Set(action.payload.clientIds);
      for (const group of state.groups) {
        for (const element of group.elements) {
          if (ids.has(element.id)) element.status = mapped;
        }
      }
    },

    removeConcreteRow(state, action: PayloadAction<string>) {
      state.concreteSchedule = state.concreteSchedule.filter(
        (r) => r.id !== action.payload,
      );
    },

    removeRebarRow(state, action: PayloadAction<string>) {
      state.rebarSchedule = state.rebarSchedule.filter((r) => r.id !== action.payload);
    },

    removeFormworkMaterialRow(state, action: PayloadAction<string>) {
      state.formworkMaterial = state.formworkMaterial.filter(
        (r) => r.id !== action.payload,
      );
    },

    removeBbsRow(
      state,
      action: PayloadAction<{ groupId: string; rowId: string }>,
    ) {
      const group = state.bbsGroups.find((g) => g.id === action.payload.groupId);
      if (group) group.rows = group.rows.filter((r) => r.id !== action.payload.rowId);
    },

    removeFormworkBreakdownRow(state, action: PayloadAction<string>) {
      state.formworkBreakdown = state.formworkBreakdown.filter(
        (r) => r.id !== action.payload,
      );
    },

    /** Restore a persisted session after a page reload. */
    hydrateAiFlow(state, action: PayloadAction<AiFlowState>) {
      return { ...state, ...action.payload };
    },

    resetAiFlow(state) {
      state.drawings.forEach(revoke);
      return { ...initialState, drawings: [] };
    },
  },
});

export const {
  setAiDetails,
  addAiDrawing,
  updateAiDrawing,
  removeAiDrawing,
  clearAiDrawings,
  setActiveAiDrawing,
  setAiDrawingPageCount,
  setActivePage,
  toggleMeasureType,
  clearPageSelection,
  startExtraction,
  advanceExtraction,
  completeExtraction,
  failExtraction,
  cancelExtraction,
  resetExtraction,
  setGlobalParameter,
  setAiProjectId,
  setAiUploadedFileId,
  setAiSession,
  clearAiSession,
  setAiPageUpload,
  setAiScale,
  setAiActiveJob,
  setAiSessionError,
  markAiSessionFinalized,
  setExtractedGroups,
  setBoqSections,
  setExtractionSteps,
  setPageStatus,
  applyElementReview,
  hydrateAiFlow,
  updateElementDimensions,
  setElementStatus,
  updateBoqItem,
  removeBoqItem,
  updateConcreteRow,
  removeConcreteRow,
  updateRebarRow,
  removeRebarRow,
  updateFormworkMaterialRow,
  removeFormworkMaterialRow,
  updateBbsRow,
  removeBbsRow,
  updateFormworkBreakdownRow,
  removeFormworkBreakdownRow,
  resetAiFlow,
} = aiFlowSlice.actions;

// ── Persistence ─────────────────────────────────────────────────────────────
// The session ids and the uploaded drawings survive a reload; blob preview URLs
// do not, so drawings fall back to their server `uploadedUrl` when rehydrated.

const AI_FLOW_STORAGE_KEY = "quantifypro.aiFlow.session";

interface PersistedAiFlow {
  session: AiSessionState;
  drawings: AiDrawing[];
  activeDrawingId: string | null;
  details: AiProjectDetails;
}

export function loadPersistedAiFlow(): AiFlowState | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.sessionStorage.getItem(AI_FLOW_STORAGE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as PersistedAiFlow;
    if (!parsed?.session) return undefined;

    return {
      ...initialState,
      details: parsed.details ?? initialState.details,
      session: { ...emptySession, ...parsed.session },
      drawings: parsed.drawings ?? [],
      activeDrawingId: parsed.activeDrawingId ?? null,
    };
  } catch {
    return undefined;
  }
}

export function saveAiFlowState(state: AiFlowState): void {
  if (typeof window === "undefined") return;

  try {
    const payload: PersistedAiFlow = {
      session: state.session,
      details: state.details,
      activeDrawingId: state.activeDrawingId,
      // Drop blob: preview URLs — they are dead after a reload.
      drawings: state.drawings.map(({ previewUrl: _previewUrl, ...rest }) => rest),
    };
    window.sessionStorage.setItem(AI_FLOW_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage full or unavailable — the flow still works in-memory
  }
}

export function clearPersistedAiFlow(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(AI_FLOW_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default aiFlowSlice.reducer;
