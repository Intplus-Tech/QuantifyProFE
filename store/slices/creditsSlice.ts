import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CreditBalance, CreditUsage } from "@/types/api";

interface CreditsState {
  balance: CreditBalance | null;
  history: CreditUsage[];
}

const initialState: CreditsState = {
  balance: null,
  history: [],
};

const creditsSlice = createSlice({
  name: "credits",
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<CreditBalance>) => {
      state.balance = action.payload;
    },
    setHistory: (state, action: PayloadAction<CreditUsage[]>) => {
      state.history = action.payload;
    },
  },
});

export const { setBalance, setHistory } = creditsSlice.actions;
export default creditsSlice.reducer;
