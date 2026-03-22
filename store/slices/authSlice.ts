/* eslint-disable @typescript-eslint/no-explicit-any */

import { LoginResponse, User } from "@/types/auth";
import { CompanyProfile } from "@/types/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  currentUser: LoginResponse["data"]["user"] | null;
  user: User | null;
  company: CompanyProfile | null;
}

const initialState: AuthState = {
  accessToken: null,
  currentUser: null,
  user: null,
  company: null,
};

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    logout: (state) => {
      state.accessToken = initialState.accessToken;
      state.currentUser = initialState.currentUser;
    },
    setAuth(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.currentUser = action.payload.currentUser;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setCompany(state, action: PayloadAction<CompanyProfile | null>) {
      state.company = action.payload;
    },
  },
});

export default authSlice.reducer;
export const { logout, setAuth, setUser, setCompany } = authSlice.actions;
