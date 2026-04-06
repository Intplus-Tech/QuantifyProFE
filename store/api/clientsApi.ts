import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import { ApiResponse, PaginatedResponse } from "@/types/common";
import { Client, ClientsStats } from "@/types/clients";
import {
  setClients,
  setStats,
  setSelectedClient,
  addClient,
  updateClientInState,
  removeClient,
} from "../slices/clientsSlice";

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientsStats: builder.query<ApiResponse<ClientsStats>, void>({
      query: () => ApiEndpoints.clients.stats,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(setStats(data.data));
          }
        } catch (error) {
          console.error("Failed to fetch clients stats:", error);
        }
      },
    }),
    getClients: builder.query<
      PaginatedResponse<Client>,
      {
        page?: number;
        limit?: number;
        search?: string;
        industry?: string;
        status?: string;
      }
    >({
      query: (params) => ({
        url: ApiEndpoints.clients.list,
        params,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data && data?.pagination) {
            dispatch(
              setClients({ data: data.data, pagination: data.pagination }),
            );
          }
        } catch (error) {
          console.error("Failed to fetch clients:", error);
        }
      },
    }),
    getClientById: builder.query<ApiResponse<Client>, string>({
      query: (clientId) => ApiEndpoints.clients.details(clientId),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(setSelectedClient(data.data));
          }
        } catch (error) {
          console.error("Failed to fetch client details:", error);
        }
      },
    }),
    createClient: builder.mutation<ApiResponse<Client>, Partial<Client>>({
      query: (body) => ({
        url: ApiEndpoints.clients.create,
        method: ApiMethods.POST,
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(addClient(data.data));
          }
        } catch (error) {
          console.error("Failed to create client:", error);
        }
      },
    }),
    updateClient: builder.mutation<
      ApiResponse<Client>,
      { clientId: string; body: Partial<Client> }
    >({
      query: ({ clientId, body }) => ({
        url: ApiEndpoints.clients.update(clientId),
        method: ApiMethods.PUT,
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(updateClientInState(data.data));
          }
        } catch (error) {
          console.error("Failed to update client:", error);
        }
      },
    }),
    deleteClient: builder.mutation<ApiResponse<null>, string>({
      query: (clientId) => ({
        url: ApiEndpoints.clients.delete(clientId),
        method: ApiMethods.DELETE,
      }),
      async onQueryStarted(clientId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success) {
            dispatch(removeClient(clientId));
          }
        } catch (error) {
          console.error("Failed to delete client:", error);
        }
      },
    }),
    getClientProjects: builder.query<
      PaginatedResponse<any>,
      { clientId: string; page?: number; limit?: number }
    >({
      query: ({ clientId, ...params }) => ({
        url: ApiEndpoints.clients.projects(clientId),
        params,
      }),
    }),
  }),
});

export const {
  useGetClientsStatsQuery,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientProjectsQuery,
} = clientsApi;
