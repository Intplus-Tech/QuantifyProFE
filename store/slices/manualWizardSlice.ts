import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultStep2 } from "@/components/projects/manual/constants";
import type { Step2Data } from "@/components/projects/manual/types";

export type DrawingCategory = "pdf" | "image" | "bim-3d" | "cad-2d";
export type DrawingStatus = "queued" | "uploading" | "processing" | "complete" | "error";

export interface DrawingPage {
  number: number;
  label: string;
}

export interface DrawingFolder {
  id: string;
  name: string;
  fileIds: string[];
}

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
  pages: DrawingPage[];
  folderId: string | null;
  error?: string;
}

interface ManualWizardState {
  currentStep: number;
  details: Step2Data;
  drawings: DrawingFile[];
  folders: DrawingFolder[];
  draftSavedAt: number | null;
  createdProjectId: string | null;
}

const DEFAULT_FOLDER_ID = "default";

const initialState: ManualWizardState = {
  currentStep: 1,
  details: defaultStep2(),
  drawings: [],
  folders: [{ id: DEFAULT_FOLDER_ID, name: "DRAWINGS", fileIds: [] }],
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

    // ── Drawings ──────────────────────────────────────────────────────────────

    addDrawing(state, action: PayloadAction<Omit<DrawingFile, "pages" | "folderId"> & { folderId?: string | null }>) {
      if (state.drawings.length >= 10) return;

      const targetFolderId = action.payload.folderId ?? state.folders[0]?.id ?? DEFAULT_FOLDER_ID;

      // Ensure the target folder exists
      if (!state.folders.find((f) => f.id === targetFolderId)) {
        state.folders.push({ id: targetFolderId, name: "DRAWINGS", fileIds: [] });
      }

      // PDFs start with no pages — DrawingPreloader eagerly counts them via pdf.js.
      // All other formats (image, bim-3d, cad-2d) default to 1 view immediately;
      // viewers may call setDrawingPages later to update (e.g. IFC storeys).
      const defaultPages =
        action.payload.category === "pdf"
          ? []
          : [{ number: 1, label: "Page 1" }];

      const file: DrawingFile = {
        ...action.payload,
        pages: defaultPages,
        folderId: targetFolderId,
      };

      state.drawings.push(file);
      const folder = state.folders.find((f) => f.id === targetFolderId);
      if (folder && !folder.fileIds.includes(file.id)) {
        folder.fileIds.push(file.id);
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
      state.folders.forEach((folder) => {
        folder.fileIds = folder.fileIds.filter((id) => id !== action.payload);
      });
    },

    // Fired when react-pdf resolves numPages for a drawing in the canvas
    setDrawingPages(state, action: PayloadAction<{ id: string; pages: DrawingPage[] }>) {
      const idx = state.drawings.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.drawings[idx].pages = action.payload.pages;
        state.drawings[idx].pageCount = action.payload.pages.length;
      }
    },

    // ── Folders ───────────────────────────────────────────────────────────────

    addFolder(state, action: PayloadAction<{ id: string; name: string }>) {
      if (!state.folders.find((f) => f.id === action.payload.id)) {
        state.folders.push({ id: action.payload.id, name: action.payload.name, fileIds: [] });
      }
    },

    renameFolder(state, action: PayloadAction<{ id: string; name: string }>) {
      const folder = state.folders.find((f) => f.id === action.payload.id);
      if (folder) folder.name = action.payload.name;
    },

    removeFolder(state, action: PayloadAction<string>) {
      // Move files from deleted folder to the first remaining folder
      const deletedFolder = state.folders.find((f) => f.id === action.payload);
      const remaining = state.folders.filter((f) => f.id !== action.payload);
      if (deletedFolder && remaining.length > 0) {
        deletedFolder.fileIds.forEach((fileId) => {
          const file = state.drawings.find((d) => d.id === fileId);
          if (file) {
            file.folderId = remaining[0].id;
            remaining[0].fileIds.push(fileId);
          }
        });
      } else if (deletedFolder) {
        // No folders left — files become root-level (null folder)
        deletedFolder.fileIds.forEach((fileId) => {
          const file = state.drawings.find((d) => d.id === fileId);
          if (file) file.folderId = null;
        });
      }
      state.folders = remaining;
    },

    moveDrawingToFolder(state, action: PayloadAction<{ drawingId: string; folderId: string }>) {
      const file = state.drawings.find((d) => d.id === action.payload.drawingId);
      if (!file) return;
      // Remove from old folder
      state.folders.forEach((f) => {
        f.fileIds = f.fileIds.filter((id) => id !== action.payload.drawingId);
      });
      // Add to new folder
      const newFolder = state.folders.find((f) => f.id === action.payload.folderId);
      if (newFolder) {
        file.folderId = action.payload.folderId;
        newFolder.fileIds.push(action.payload.drawingId);
      }
    },

    // ── Misc ──────────────────────────────────────────────────────────────────

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
      state.folders = [{ id: DEFAULT_FOLDER_ID, name: "DRAWINGS", fileIds: [] }];
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
  setDrawingPages,
  addFolder,
  renameFolder,
  removeFolder,
  moveDrawingToFolder,
  markDraftSaved,
  setCreatedProjectId,
  resetWizard,
} = manualWizardSlice.actions;

export default manualWizardSlice.reducer;
