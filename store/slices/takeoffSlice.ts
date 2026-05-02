import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TakeoffState {
  data: Record<string, {
    tabRows: Record<string, any[]>;
    bendingSummaries: Record<string, Record<string, string>>;
  }>;
}

const loadPersistedState = (): TakeoffState => {
  if (typeof window === "undefined") return { data: {} };
  try {
    const saved = localStorage.getItem("quantify_takeoff_state");
    return saved ? JSON.parse(saved) : { data: {} };
  } catch (e) {
    console.error("Failed to load takeoff state", e);
    return { data: {} };
  }
};

const initialState: TakeoffState = loadPersistedState();

const takeoffSlice = createSlice({
  name: "takeoff",
  initialState,
  reducers: {
    updateTabRows: (state, action: PayloadAction<{
      projectId: string;
      section: string;
      item: string;
      tabRows: Record<string, any[]>;
    }>) => {
      const { projectId, section, item, tabRows } = action.payload;
      const key = `${projectId}-${section}-${item}`;
      if (!state.data[key]) state.data[key] = { tabRows: {}, bendingSummaries: {} };
      state.data[key].tabRows = { ...state.data[key].tabRows, ...tabRows };
      localStorage.setItem("quantify_takeoff_state", JSON.stringify(state));
    },
    updateBendingSummaries: (state, action: PayloadAction<{
      projectId: string;
      section: string;
      item: string;
      bendingSummaries: Record<string, Record<string, string>>;
    }>) => {
      const { projectId, section, item, bendingSummaries } = action.payload;
      const key = `${projectId}-${section}-${item}`;
      if (!state.data[key]) state.data[key] = { tabRows: {}, bendingSummaries: {} };
      state.data[key].bendingSummaries = { ...state.data[key].bendingSummaries, ...bendingSummaries };
      localStorage.setItem("quantify_takeoff_state", JSON.stringify(state));
    }
  }
});

export const { updateTabRows, updateBendingSummaries } = takeoffSlice.actions;
export default takeoffSlice.reducer;
