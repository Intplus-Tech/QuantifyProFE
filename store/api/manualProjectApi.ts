import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { ApiEndpoints } from "@/utils/endpoints";
import {
  UpdateQsConfigPayload,
  UpdateQsConfigResponse,
  UpsertStructuralScopeResponse,
  UpdateFinishingPayload,
  UpdateFinishingResponse,
  UpdateMetricsPayload,
  UpdateMetricsResponse,
} from "@/types/manualProject";
import { TakeoffElementType } from "@/components/projects/takeoff/configs/elementTypes";

export const manualProjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateQsConfig: builder.mutation<
      UpdateQsConfigResponse,
      { projectId: string; body: UpdateQsConfigPayload }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.manual.qsConfig(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    upsertStructuralScope: builder.mutation<
      UpsertStructuralScopeResponse,
      {
        projectId: string;
        foundationType: string;
        body: Record<string, unknown>;
      }
    >({
      query: ({ projectId, foundationType, body }) => ({
        url: ApiEndpoints.manual.structuralScope(projectId, foundationType),
        method: ApiMethods.PUT,
        body,
      }),
    }),

    updateFinishing: builder.mutation<
      UpdateFinishingResponse,
      { projectId: string; body: UpdateFinishingPayload }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.manual.finishing(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    updateMetrics: builder.mutation<
      UpdateMetricsResponse,
      { projectId: string; body: UpdateMetricsPayload }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.manual.metrics(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    upsertTakeoffElements: builder.mutation<
      { success: boolean; message: string; data?: any },
      { projectId: string; elementType: TakeoffElementType; body: any }
    >({
      query: ({ projectId, elementType, body }) => ({
        url: ApiEndpoints.manual.takeoffElements(projectId, elementType),
        method: ApiMethods.PUT,
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        const endpoint = ApiEndpoints.manual.takeoffElements(
          arg.projectId,
          arg.elementType,
        );
        console.log(`[Takeoff][${arg.elementType}] PAYLOAD`, {
          endpoint,
          payload: arg.body,
        });

        try {
          const { data } = await queryFulfilled;
          console.log(`[Takeoff][${arg.elementType}] SUCCESS`, data);
        } catch (error) {
          console.error(`[Takeoff][${arg.elementType}] ERROR`, {
            endpoint,
            error,
          });
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateQsConfigMutation,
  useUpsertStructuralScopeMutation,
  useUpdateFinishingMutation,
  useUpdateMetricsMutation,
  useUpsertTakeoffElementsMutation,
} = manualProjectApi;
