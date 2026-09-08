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

    /**
     * DELETE /projects/:projectId/boq-document/rows/:rowId
     *
     * Not in the boq_v2 contract yet — the documented BOQ surface is GET the
     * document, PATCH a row, GET the materials. This follows the same URL
     * convention as the PATCH so it works the moment the endpoint lands; until
     * then the caller reports the 404/405 rather than pretending the row went.
     */
    deleteBoqDocumentRow: builder.mutation<
      ApiResponse<BoqDocument>,
      { projectId: string; rowId: string }
    >({
      query: ({ projectId, rowId }) => ({
        url: ApiEndpoints.projects.boqDocumentRow(projectId, rowId),
        method: ApiMethods.DELETE,
      }),
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Like PATCH, a delete moves every total above the row, so the
          // server hands back the whole retotalled document.
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
          // Cache untouched — the row is still there.
        }
      },
    }),

    /** DELETE /projects/:projectId/boq-document/sections/:sectionId */
    deleteBoqDocumentSection: builder.mutation<
      ApiResponse<BoqDocument>,
      { projectId: string; sectionId: string }
    >({
      query: ({ projectId, sectionId }) => ({
        url: ApiEndpoints.projects.boqDocumentSection(projectId, sectionId),
        method: ApiMethods.DELETE,
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
          // Cache untouched.
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
  useDeleteBoqDocumentRowMutation,
  useDeleteBoqDocumentSectionMutation,
  useGetMaterialTakeoffQuery,
} = boqDocumentApi;
