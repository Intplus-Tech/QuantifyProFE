import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { company as companyEndpoints } from "@/utils/endpoints";
import { ApiResponse, PaginatedResponse } from "@/types/common";
import {
  BillingInfo,
  BillingInvoice,
  BillingPaymentMethod,
  AddPaymentMethodInput,
  SubscribeInput,
  SubscribeResponse,
  VerifySubscriptionInput,
  UsageStats,
  UpdateBillingPlanInput,
} from "@/types/billing";

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingInfo: builder.query<ApiResponse<BillingInfo>, void>({
      query: () => companyEndpoints.billing.info,
      providesTags: ["Billing"],
    }),
    updateBillingPlan: builder.mutation<
      ApiResponse<any>,
      UpdateBillingPlanInput
    >({
      query: (data) => ({
        url: companyEndpoints.billing.changePlan,
        method: ApiMethods.PUT,
        body: data,
      }),
      invalidatesTags: ["Billing"],
    }),
    getBillingHistory: builder.query<
      PaginatedResponse<BillingInvoice>,
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        sortBy?: string;
      } | void
    >({
      query: (params) => ({
        url: companyEndpoints.billing.history,
        method: ApiMethods.GET,
        params: params || undefined,
      }),
      providesTags: ["Billing"],
    }),
    getPaymentMethods: builder.query<ApiResponse<BillingPaymentMethod[]>, void>(
      {
        query: () => companyEndpoints.billing.paymentMethods,
        providesTags: ["PaymentMethods"],
      },
    ),
    addPaymentMethod: builder.mutation<
      ApiResponse<BillingPaymentMethod>,
      AddPaymentMethodInput
    >({
      query: (data) => ({
        url: companyEndpoints.billing.addPaymentMethod,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    setPrimaryPaymentMethod: builder.mutation<
      ApiResponse<BillingPaymentMethod>,
      { id: string; isPrimary: boolean }
    >({
      query: ({ id, isPrimary }) => ({
        url: companyEndpoints.billing.setPrimaryPaymentMethod(id),
        method: ApiMethods.PUT,
        body: { isPrimary },
      }),
      invalidatesTags: ["PaymentMethods", "Billing"],
    }),
    subscribe: builder.mutation<ApiResponse<SubscribeResponse>, SubscribeInput>(
      {
        query: (data) => ({
          url: companyEndpoints.billing.subscribe,
          method: ApiMethods.POST,
          body: data,
        }),
      },
    ),
    verifySubscription: builder.mutation<
      ApiResponse<any>,
      VerifySubscriptionInput
    >({
      query: (data) => ({
        url: companyEndpoints.billing.verify,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["Billing"],
    }),
    cancelSubscription: builder.mutation<ApiResponse<any>, { status: string }>({
      query: (data) => ({
        url: companyEndpoints.billing.cancel,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["Billing"],
    }),
    getUsageStats: builder.query<ApiResponse<UsageStats>, void>({
      query: () => companyEndpoints.billing.usage,
      providesTags: ["Billing"],
    }),
    getInvoicePdfUrl: builder.query<string, string>({
      query: (id) => companyEndpoints.billing.invoicePdf(id),
    }),
  }),
});

export const {
  useGetBillingInfoQuery,
  useUpdateBillingPlanMutation,
  useGetBillingHistoryQuery,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useSetPrimaryPaymentMethodMutation,
  useSubscribeMutation,
  useVerifySubscriptionMutation,
  useCancelSubscriptionMutation,
  useGetUsageStatsQuery,
  useLazyGetInvoicePdfUrlQuery,
} = billingApi;
