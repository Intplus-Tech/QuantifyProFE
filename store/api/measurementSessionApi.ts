import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import type {
  CreateSessionBody,
  UpdateCanvasBody,
  UpsertElementBody,
  UpdateSessionStatusBody,
  FinalizeSessionBody,
  GetSessionResponse,
  DeleteSessionResponse,
  UpdateCanvasResponse,
  GetElementsResponse,
  UpsertElementResponse,
  DeleteElementResponse,
  FinalizeSessionResponse,
  UpdateStatusResponse,
  CreateSessionResponse,
  ListSessionsResponse,
} from "@/types/measurementSession";

export const measurementSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /projects/:projectId/measurement-sessions
    createMeasurementSession: builder.mutation<
      CreateSessionResponse,
      { projectId: string; body: CreateSessionBody }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.measurementSessions.create(projectId),
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    // GET /projects/:projectId/measurement-sessions
    listProjectMeasurementSessions: builder.query<ListSessionsResponse, string>({
      query: (projectId) => ({
        url: ApiEndpoints.measurementSessions.listByProject(projectId),
        method: ApiMethods.GET,
      }),
      providesTags: ["Projects"],
    }),

    // GET /measurement-sessions/:sessionId
    getMeasurementSession: builder.query<GetSessionResponse, string>({
      query: (sessionId) => ({
        url: ApiEndpoints.measurementSessions.get(sessionId),
        method: ApiMethods.GET,
      }),
    }),

    // DELETE /measurement-sessions/:sessionId
    deleteMeasurementSession: builder.mutation<DeleteSessionResponse, string>({
      query: (sessionId) => ({
        url: ApiEndpoints.measurementSessions.delete(sessionId),
        method: ApiMethods.DELETE,
      }),
      invalidatesTags: ["Projects"],
    }),

    // PATCH /measurement-sessions/:sessionId/canvas
    updateMeasurementCanvas: builder.mutation<
      UpdateCanvasResponse,
      { sessionId: string; body: UpdateCanvasBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.measurementSessions.updateCanvas(sessionId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),

    // GET /measurement-sessions/:sessionId/elements
    listMeasurementElements: builder.query<GetElementsResponse, string>({
      query: (sessionId) => ({
        url: ApiEndpoints.measurementSessions.listElements(sessionId),
        method: ApiMethods.GET,
      }),
    }),

    // POST /measurement-sessions/:sessionId/elements
    upsertMeasurementElement: builder.mutation<
      UpsertElementResponse,
      { sessionId: string; body: UpsertElementBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.measurementSessions.upsertElement(sessionId),
        method: ApiMethods.POST,
        body,
      }),
    }),

    // DELETE /measurement-sessions/:sessionId/elements/:clientId
    deleteMeasurementElement: builder.mutation<
      DeleteElementResponse,
      { sessionId: string; clientId: string }
    >({
      query: ({ sessionId, clientId }) => ({
        url: ApiEndpoints.measurementSessions.deleteElement(sessionId, clientId),
        method: ApiMethods.DELETE,
      }),
    }),

    // POST /measurement-sessions/:sessionId/finalize
    finalizeMeasurementSession: builder.mutation<
      FinalizeSessionResponse,
      { sessionId: string; body: FinalizeSessionBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.measurementSessions.finalize(sessionId),
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    // PATCH /measurement-sessions/:sessionId/status
    updateMeasurementSessionStatus: builder.mutation<
      UpdateStatusResponse,
      { sessionId: string; body: UpdateSessionStatusBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.measurementSessions.updateStatus(sessionId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
  }),
});

export const {
  useCreateMeasurementSessionMutation,
  useListProjectMeasurementSessionsQuery,
  useLazyListProjectMeasurementSessionsQuery,
  useGetMeasurementSessionQuery,
  useLazyGetMeasurementSessionQuery,
  useDeleteMeasurementSessionMutation,
  useUpdateMeasurementCanvasMutation,
  useListMeasurementElementsQuery,
  useUpsertMeasurementElementMutation,
  useDeleteMeasurementElementMutation,
  useFinalizeMeasurementSessionMutation,
  useUpdateMeasurementSessionStatusMutation,
} = measurementSessionApi;
