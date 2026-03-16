import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DocumentState {
  jobs: any[];
}

const initialState: DocumentState = {
  jobs: [],
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<any[]>) => {
      state.jobs = action.payload;
    },
  },
});

export const { setJobs } = documentSlice.actions;
export default documentSlice.reducer;
