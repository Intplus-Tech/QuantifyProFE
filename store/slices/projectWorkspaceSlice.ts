import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WorkspaceProjectSnapshot } from "@/components/projects/workspace/types";

interface ProjectWorkspaceState {
  projectsById: Record<string, WorkspaceProjectSnapshot>;
  activeProjectId: string | null;
}

const initialState: ProjectWorkspaceState = {
  projectsById: {},
  activeProjectId: null,
};

const projectWorkspaceSlice = createSlice({
  name: "projectWorkspace",
  initialState,
  reducers: {
    registerWorkspaceProject(state, action: PayloadAction<WorkspaceProjectSnapshot>) {
      state.projectsById[action.payload.projectId] = action.payload;
      state.activeProjectId = action.payload.projectId;
    },
    setActiveWorkspaceProject(state, action: PayloadAction<string | null>) {
      state.activeProjectId = action.payload;
    },
    clearWorkspaceProject(state, action: PayloadAction<string>) {
      delete state.projectsById[action.payload];
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = null;
      }
    },
  },
});

export const {
  registerWorkspaceProject,
  setActiveWorkspaceProject,
  clearWorkspaceProject,
} = projectWorkspaceSlice.actions;

export default projectWorkspaceSlice.reducer;
