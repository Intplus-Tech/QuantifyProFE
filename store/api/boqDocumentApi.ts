import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import type { ApiResponse } from "@/types/common";
import type {
  BoqDocument,
  MaterialTakeoffResult,
  PatchBoqRowRequest,
} from "@/types/boqDocument";

export const boqDocumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /projects/:projectId/boq-document
    getBoqDocument: builder.query<ApiResponse<BoqDocument>, string>({
      query: (projectId) => ({
        url: ApiEndpoints.projects.boqDocument(projectId),
        method: ApiMethods.GET,
      }),
      providesTags: (_result, _error, projectId) => [
        { type: "BoqDocument", id: projectId },
      ],
    }),

    // PATCH /projects/:projectId/boq-document/rows/:rowId
    // Response is the whole retotalled document — swap the cache for it.
    patchBoqDocumentRow: builder.mutation<
      ApiResponse<BoqDocument>,
      { projectId: string; rowId: string; body: PatchBoqRowRequest }
    >({
      query: ({ projectId, rowId, body }) => ({
        url: ApiEndpoints.projects.boqDocumentRow(projectId, rowId),
        method: ApiMethods.PATCH,
        body,
      }),
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(
              boqDocumentApi.util.updateQueryData(
                "getBoqDocument",
                projectId,
                (draft) => {
                  draft.data = data.data;
                },
              ),
            );
          }
        } catch {
          // Mutation error surfaces to the caller; cache stays as-is.
        }
      },
    }),

    // GET /projects/:projectId/material-takeoff
    getMaterialTakeoff: builder.query<
      ApiResponse<MaterialTakeoffResult>,
      string
    >({
      query: (projectId) => ({
        url: ApiEndpoints.projects.materialTakeoff(projectId),
        method: ApiMethods.GET,
      }),
      providesTags: (_result, _error, projectId) => [
        { type: "BoqDocument", id: `${projectId}:materials` },
      ],
    }),
  }),
});

export const {
  useGetBoqDocumentQuery,
  usePatchBoqDocumentRowMutation,
  useGetMaterialTakeoffQuery,
} = boqDocumentApi;
