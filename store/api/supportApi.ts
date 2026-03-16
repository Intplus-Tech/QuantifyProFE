import { baseApi } from "./baseApi";
import { support as supportEndpoints } from "@/utils/endpoints";
import { ApiResponse, SupportTicket, CreateTicketInput } from "@/types/api";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<ApiResponse<SupportTicket[]>, void>({
      query: () => supportEndpoints.listTickets,
    }),
    getTicketDetails: builder.query<ApiResponse<SupportTicket>, string>({
      query: (id) => supportEndpoints.ticketDetails(id),
    }),
    createTicket: builder.mutation<
      ApiResponse<SupportTicket>,
      CreateTicketInput
    >({
      query: (data) => ({
        url: supportEndpoints.createTicket,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketDetailsQuery,
  useCreateTicketMutation,
} = supportApi;
