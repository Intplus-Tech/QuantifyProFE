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

export const store = configureStore({
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
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
