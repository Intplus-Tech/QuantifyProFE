/**
 * Manual project creation wizard — RTK Query API slice.
 *
 * This file is ONLY for the manual-mode wizard endpoints.
 * Do NOT add AI-flow endpoints here — use store/api/projectsApi.ts for those.
 *
 * Mutations exposed:
 *   useUpdateQsConfigMutation
 *   useUpsertStructuralScopeMutation
 *   useUpdateFinishingMutation
 *   useUpdateMetricsMutation
 */

import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { manualProjectEndpoints } from "@/utils/endpoints/manualEndpoints";
import {
  UpdateQsConfigPayload,
  UpdateQsConfigResponse,
  UpsertStructuralScopeResponse,
  UpdateFinishingPayload,
  UpdateFinishingResponse,
  UpdateMetricsPayload,
  UpdateMetricsResponse,
} from "@/types/manualProject";

export const manualProjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * PATCH /takeoff/:projectId/qs-config
     * Step 2 of the manual wizard — registers foundation type, floors, lift, pool.
     * Must be called BEFORE upsertStructuralScope.
     */
    updateQsConfig: builder.mutation<
      UpdateQsConfigResponse,
      { projectId: string; body: UpdateQsConfigPayload }
    >({
      query: ({ projectId, body }) => ({
        url: manualProjectEndpoints.qsConfig(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    /**
     * PUT /takeoff/:projectId/structural-scope/:foundationType
     * Step 3 of the manual wizard — uploads pile, blinding, and superstructure specs.
     * Requires qs-config to be set first.
     */
    upsertStructuralScope: builder.mutation<
      UpsertStructuralScopeResponse,
      { projectId: string; foundationType: string; body: Record<string, unknown> }
    >({
      query: ({ projectId, foundationType, body }) => ({
        url: manualProjectEndpoints.structuralScope(projectId, foundationType),
        method: ApiMethods.PUT,
        body,
      }),
    }),

    /**
     * PATCH /projects/:projectId/finishing
     * Step 4 of the manual wizard — tile types, paint specs, finishing details.
     */
    updateFinishing: builder.mutation<
      UpdateFinishingResponse,
      { projectId: string; body: UpdateFinishingPayload }
    >({
      query: ({ projectId, body }) => ({
        url: manualProjectEndpoints.finishing(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    /**
     * PATCH /projects/:projectId/metrics
     * Step 5 of the manual wizard — financial percentages (markup, retention, etc.).
     */
    updateMetrics: builder.mutation<
      UpdateMetricsResponse,
      { projectId: string; body: UpdateMetricsPayload }
    >({
      query: ({ projectId, body }) => ({
        url: manualProjectEndpoints.metrics(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
  }),
  // Prevent overriding endpoints from projectsApi if they share a base tag
  overrideExisting: false,
});

export const {
  useUpdateQsConfigMutation,
  useUpsertStructuralScopeMutation,
  useUpdateFinishingMutation,
  useUpdateMetricsMutation,
} = manualProjectApi;
