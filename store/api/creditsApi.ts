import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { Credits as creditsEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import { CreditBalance, CreditUsage, AddCreditsInput } from "@/types/credits";
import { setBalance, setHistory } from "../slices/creditsSlice";

export const creditsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCreditsBalance: builder.query<ApiResponse<CreditBalance>, void>({
      query: () => creditsEndpoints.creditBalance,
      providesTags: ["Auth"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setBalance(data.data));
        } catch {}
      },
    }),
    getCreditsHistory: builder.query<ApiResponse<CreditUsage[]>, void>({
      query: () => creditsEndpoints.creditHistory,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setHistory(data.data));
        } catch {}
      },
    }),
    addCredits: builder.mutation<ApiResponse<any>, AddCreditsInput>({
      query: (data) => ({
        url: creditsEndpoints.addCredits,
        method: ApiMethods.POST,
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCreditsBalanceQuery,
  useGetCreditsHistoryQuery,
  useAddCreditsMutation,
} = creditsApi;
