import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client, ClientsStats } from "@/types/clients";
import { Pagination } from "@/types/projects";

interface ClientsState {
  clients: Client[];
  stats: ClientsStats | null;
  selectedClient: Client | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  stats: null,
  selectedClient: null,
  pagination: null,
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients: (
      state,
      action: PayloadAction<{ data: Client[]; pagination: Pagination }>,
    ) => {
      state.clients = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    setStats: (state, action: PayloadAction<ClientsStats>) => {
      state.stats = action.payload;
    },
    setSelectedClient: (state, action: PayloadAction<Client | null>) => {
      state.selectedClient = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.unshift(action.payload);
    },
    updateClientInState: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.selectedClient?._id === action.payload._id) {
        state.selectedClient = action.payload;
      }
    },
    removeClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter((c) => c._id !== action.payload);
      if (state.selectedClient?._id === action.payload) {
        state.selectedClient = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setClients,
  setStats,
  setSelectedClient,
  addClient,
  updateClientInState,
  removeClient,
  setLoading,
  setError,
} = clientsSlice.actions;

export default clientsSlice.reducer;
