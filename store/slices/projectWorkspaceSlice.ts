import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WorkspaceProjectSnapshot } from "@/components/projects/workspace/types";

export interface ProjectWorkspaceState {
  projectsById: Record<string, WorkspaceProjectSnapshot>;
  activeProjectId: string | null;
}

export const PROJECT_WORKSPACE_STORAGE_KEY = "quantify-pro.projectWorkspace";

const initialState: ProjectWorkspaceState = {
  projectsById: {},
  activeProjectId: null,
};

function isProjectWorkspaceState(value: unknown): value is ProjectWorkspaceState {
  return Boolean(
    value &&
    typeof value === "object" &&
    "projectsById" in value &&
    typeof (value as { projectsById?: unknown }).projectsById === "object" &&
    (value as { projectsById?: unknown }).projectsById !== null &&
    "activeProjectId" in value,
  );
}

export function loadPersistedProjectWorkspaceState(): ProjectWorkspaceState | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const rawState = window.localStorage.getItem(PROJECT_WORKSPACE_STORAGE_KEY);
    if (!rawState) {
      return undefined;
    }

    const parsedState: unknown = JSON.parse(rawState);
    return isProjectWorkspaceState(parsedState) ? parsedState : undefined;
  } catch {
    return undefined;
  }
}

export function saveProjectWorkspaceState(state: ProjectWorkspaceState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROJECT_WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

export function persistWorkspaceProjectSnapshot(snapshot: WorkspaceProjectSnapshot): void {
  const currentState = loadPersistedProjectWorkspaceState() ?? initialState;
  saveProjectWorkspaceState({
    projectsById: {
      ...currentState.projectsById,
      [snapshot.projectId]: snapshot,
    },
    activeProjectId: snapshot.projectId,
  });
}

const projectWorkspaceSlice = createSlice({
  name: "projectWorkspace",
  initialState,
  reducers: {
    registerWorkspaceProject(state, action: PayloadAction<WorkspaceProjectSnapshot>) {
      state.projectsById[action.payload.projectId] = action.payload;
      state.activeProjectId = action.payload.projectId;
    },
    hydrateWorkspaceProjects(state, action: PayloadAction<ProjectWorkspaceState>) {
      state.projectsById = action.payload.projectsById;
      state.activeProjectId = action.payload.activeProjectId;
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
  hydrateWorkspaceProjects,
  setActiveWorkspaceProject,
  clearWorkspaceProject,
} = projectWorkspaceSlice.actions;

export default projectWorkspaceSlice.reducer;
