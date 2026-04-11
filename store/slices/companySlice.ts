import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CompanyProfile, TeamMember } from "@/types/company";

interface CompanyState {
  currentCompany: CompanyProfile | null;
  teamMembers: TeamMember[];
  isLoading: boolean;
}

const initialState: CompanyState = {
  currentCompany: null,
  teamMembers: [],
  isLoading: false,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<CompanyProfile | null>) => {
      state.currentCompany = action.payload;
    },
    setTeamMembers: (state, action: PayloadAction<TeamMember[]>) => {
      state.teamMembers = action.payload;
    },
  },
});

export const { setCompany, setTeamMembers } = companySlice.actions;
export default companySlice.reducer;
