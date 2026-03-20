import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkItem {
  item: string;
  specification: string;
  unit: string;
  quantity: number;
  notes: string;
}

export interface Section {
  sectionName: string;
  workItems: WorkItem[];
}

export interface BoqResult {
  projectTitle: string;
  sections: Section[];
  generalNotes: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  userId: string;
  companyId: string;
  status: string;
  source: string;
  sourceJobId: string;
  boqResult: BoqResult;
  libraryItems: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ProjectsState {
  projects: Project[];
  pagination: Pagination | null;
  selectedProject: Project | null;
}

const initialState: ProjectsState = {
  projects: [],
  pagination: null,
  selectedProject: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<{ data: Project[]; pagination: Pagination }>) {
      state.projects = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    setSelectedProject(state, action: PayloadAction<Project | null>) {
      state.selectedProject = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.projects.unshift(action.payload);
      if (state.pagination) {
        state.pagination.total += 1;
      }
    },
    updateProjectInState(state, action: PayloadAction<Project>) {
      const index = state.projects.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?._id === action.payload._id) {
        state.selectedProject = action.payload;
      }
    },
    removeProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      if (state.pagination) {
        state.pagination.total -= 1;
      }
      if (state.selectedProject?._id === action.payload) {
        state.selectedProject = null;
      }
    },
  },
});

export const {
  setProjects,
  setSelectedProject,
  addProject,
  updateProjectInState,
  removeProject,
} = projectsSlice.actions;
export default projectsSlice.reducer;
