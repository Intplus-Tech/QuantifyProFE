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

export interface AiFlowState {
  details: AiProjectDetails;
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
const initialState: AiFlowState = {
  details: emptyDetails,
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
        changes: Partial<{ qty: number; rate: number | null; concrete: number; rebar: number; formwork: number; excavation: number | null }>;
      }>,
    ) {
      const section = state.boqSections.find((s) => s.id === action.payload.sectionId);
      const item = section?.items.find((i) => i.id === action.payload.itemId);
      if (item) Object.assign(item, action.payload.changes);
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
  cancelExtraction,
  resetExtraction,
  setGlobalParameter,
  updateElementDimensions,
  setElementStatus,
  updateBoqItem,
  updateConcreteRow,
  updateRebarRow,
  updateFormworkMaterialRow,
  updateBbsRow,
  updateFormworkBreakdownRow,
  resetAiFlow,
} = aiFlowSlice.actions;

export default aiFlowSlice.reducer;
