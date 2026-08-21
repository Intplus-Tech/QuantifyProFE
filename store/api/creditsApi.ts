import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { Credits as creditsEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import {
  CreditBalance,
  CreditUsage,
  CreditUsageSummary,
  CreditPricing,
  AddCreditsInput,
} from "@/types/credits";
import { setBalance, setHistory } from "../slices/creditsSlice";

export const creditsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /credits/balance — total, used, reserved, available. */
    getCreditsBalance: builder.query<ApiResponse<CreditBalance>, void>({
      query: () => creditsEndpoints.creditBalance,
      providesTags: ["Credits"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setBalance(data.data));
        } catch {}
      },
    }),

    /** GET /credits/history — transaction history. */
    getCreditsHistory: builder.query<ApiResponse<CreditUsage[]>, void>({
      query: () => creditsEndpoints.creditHistory,
      providesTags: ["Credits"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setHistory(data.data));
        } catch {}
      },
    }),

    /** GET /credits/pricing — public; credit cost per AI operation type. */
    getCreditsPricing: builder.query<ApiResponse<CreditPricing[]>, void>({
      query: () => creditsEndpoints.creditPricing,
    }),

    /** GET /credits/usage — summary by operation type. */
    getCreditsUsage: builder.query<ApiResponse<CreditUsageSummary[]>, void>({
      query: () => creditsEndpoints.creditUsage,
      providesTags: ["Credits"],
    }),

    /** GET /credits/usage/providers — summary by AI provider. */
    getCreditsUsageByProvider: builder.query<
      ApiResponse<CreditUsageSummary[]>,
      void
    >({
      query: () => creditsEndpoints.creditUsageProviders,
      providesTags: ["Credits"],
    }),

    /**
     * POST /credits/add — admin only (403 without the role).
     * Allocates, refunds or bonuses credits, and is what creates a missing
     * credit account for a user.
     */
    addCredits: builder.mutation<ApiResponse<unknown>, AddCreditsInput>({
      query: (body) => ({
        url: creditsEndpoints.addCredits,
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Credits"],
    }),
  }),
});

export const {
  useGetCreditsBalanceQuery,
  useLazyGetCreditsBalanceQuery,
  useGetCreditsHistoryQuery,
  useGetCreditsPricingQuery,
  useGetCreditsUsageQuery,
  useGetCreditsUsageByProviderQuery,
  useAddCreditsMutation,
} = creditsApi;
