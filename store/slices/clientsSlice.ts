import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Client {
  _id: string;
  userId: string;
  companyId: string | null;
  name: string;
  clientCompanyName: string;
  industry: string;
  status: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ClientsStats {
  totalClients: number;
  totalBoqValue: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ClientsState {
  clients: Client[];
  stats: ClientsStats | null;
  pagination: Pagination | null;
  selectedClient: Client | null;
}

const initialState: ClientsState = {
  clients: [],
  stats: null,
  pagination: null,
  selectedClient: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<{ data: Client[]; pagination: Pagination }>) {
      state.clients = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    setStats(state, action: PayloadAction<ClientsStats>) {
      state.stats = action.payload;
    },
    setSelectedClient(state, action: PayloadAction<Client | null>) {
      state.selectedClient = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.unshift(action.payload);
      if (state.pagination) {
        state.pagination.total += 1;
      }
    },
    updateClientInState(state, action: PayloadAction<Client>) {
      const index = state.clients.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.selectedClient?._id === action.payload._id) {
        state.selectedClient = action.payload;
      }
    },
    removeClient(state, action: PayloadAction<string>) {
      state.clients = state.clients.filter((c) => c._id !== action.payload);
      if (state.pagination) {
        state.pagination.total -= 1;
      }
      if (state.selectedClient?._id === action.payload) {
        state.selectedClient = null;
      }
    },
  },
});

export const { setClients, setStats, setSelectedClient, addClient, updateClientInState, removeClient } = clientsSlice.actions;
export default clientsSlice.reducer;
