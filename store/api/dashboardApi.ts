import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import { DashboardStats } from "@/types/dashboard";
import { ApiResponse } from "@/types/common";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => ({
        url: ApiEndpoints.dashboard.summary,
        method: ApiMethods.GET,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetDashboardStatsQuery } = dashboardApi;
