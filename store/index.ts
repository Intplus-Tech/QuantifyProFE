import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import companyReducer from "./slices/companySlice";
import libraryReducer from "./slices/librarySlice";
import creditsReducer from "./slices/creditsSlice";
import documentReducer from "./slices/documentSlice";
import plansReducer from "./slices/plansSlice";
import clientsReducer from "./slices/clientsSlice";
import projectsReducer from "./slices/projectsSlice";
import manualWizardReducer from "./slices/manualWizardSlice";
import projectWorkspaceReducer, {
  clearWorkspaceProject,
  hydrateWorkspaceProjects,
  loadPersistedProjectWorkspaceState,
  registerWorkspaceProject,
  saveProjectWorkspaceState,
} from "./slices/projectWorkspaceSlice";
import takeoffReducer from "./slices/takeoffSlice";

// Import API slices to ensure they are registered
import "./api/authApi";
import "./api/userApi";
import "./api/companyApi";
import "./api/libraryApi";
import "./api/documentApi";
import "./api/creditsApi";
import "./api/supportApi";
import "./api/plansApi";
import "./api/clientsApi";
import "./api/projectsApi";
import "./api/manualProjectApi";
import "./api/measurementSessionApi";
import "./api/boqDocumentApi";

const persistedProjectWorkspace = loadPersistedProjectWorkspaceState();

const projectWorkspacePersistenceMiddleware = (storeApi: any) => (next: any) => (action: any) => {
  const result = next(action);

  if (
    registerWorkspaceProject.match(action) ||
    clearWorkspaceProject.match(action) ||
    hydrateWorkspaceProjects.match(action)
  ) {
    saveProjectWorkspaceState(storeApi.getState().projectWorkspace);
  }

  return result;
};

export const store = configureStore({
  preloadedState: persistedProjectWorkspace
    ? {
      projectWorkspace: persistedProjectWorkspace,
    }
    : undefined,
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    company: companyReducer,
    library: libraryReducer,
    credits: creditsReducer,
    document: documentReducer,
    plans: plansReducer,
    clients: clientsReducer,
    projects: projectsReducer,
    manualWizard: manualWizardReducer,
    projectWorkspace: projectWorkspaceReducer,
    takeoff: takeoffReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware().concat(baseApi.middleware, projectWorkspacePersistenceMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
