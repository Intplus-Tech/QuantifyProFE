import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plan } from "@/types/api";

interface PlansState {
  plans: Plan[];
  activePlan: Plan | null;
}

const initialState: PlansState = {
  plans: [],
  activePlan: null,
};

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    setActivePlan: (state, action: PayloadAction<Plan | null>) => {
      state.activePlan = action.payload;
    },
  },
});

export const { setPlans, setActivePlan } = plansSlice.actions;
export default plansSlice.reducer;
