import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultStep2 } from "@/components/projects/manual/constants";
import type { Step2Data } from "@/components/projects/manual/types";

export type DrawingCategory = "pdf" | "image" | "bim-3d" | "cad-2d";
export type DrawingStatus = "queued" | "uploading" | "processing" | "complete" | "error";

export interface DrawingFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  category: DrawingCategory;
  status: DrawingStatus;
  progress: number;
  previewUrl?: string;
  uploadedUrl?: string;
  pageCount?: number;
  error?: string;
}

interface ManualWizardState {
  currentStep: number;
  details: Step2Data;
  drawings: DrawingFile[];
  draftSavedAt: number | null;
  createdProjectId: string | null;
}

const initialState: ManualWizardState = {
  currentStep: 1,
  details: defaultStep2(),
  drawings: [],
  draftSavedAt: null,
  createdProjectId: null,
};

const manualWizardSlice = createSlice({
  name: "manualWizard",
  initialState,
  reducers: {
    goNextStep(state) {
      state.currentStep = Math.min(state.currentStep + 1, 2);
    },
    goBackStep(state) {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },
    setDetails(state, action: PayloadAction<Step2Data>) {
      state.details = action.payload;
    },
    addDrawing(state, action: PayloadAction<DrawingFile>) {
      if (state.drawings.length < 10) {
        state.drawings.push(action.payload);
      }
    },
    updateDrawing(state, action: PayloadAction<Partial<DrawingFile> & { id: string }>) {
      const idx = state.drawings.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.drawings[idx] = { ...state.drawings[idx], ...action.payload };
      }
    },
    removeDrawing(state, action: PayloadAction<string>) {
      const file = state.drawings.find((d) => d.id === action.payload);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      state.drawings = state.drawings.filter((d) => d.id !== action.payload);
    },
    markDraftSaved(state) {
      state.draftSavedAt = Date.now();
    },
    setCreatedProjectId(state, action: PayloadAction<string>) {
      state.createdProjectId = action.payload;
    },
    resetWizard(state) {
      state.drawings.forEach((d) => {
        if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
      });
      state.currentStep = 1;
      state.details = defaultStep2();
      state.drawings = [];
      state.draftSavedAt = null;
      state.createdProjectId = null;
    },
  },
});

export const {
  goNextStep,
  goBackStep,
  setDetails,
  addDrawing,
  updateDrawing,
  removeDrawing,
  markDraftSaved,
  setCreatedProjectId,
  resetWizard,
} = manualWizardSlice.actions;

export default manualWizardSlice.reducer;
