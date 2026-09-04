import type { AxiosProgressEvent } from "axios";
import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import type { ApiResponse, FileUploadResponse } from "@/types/common";
import type {
  AiDetectedMeasurementElement,
  AiTakeoffJob,
  AnalysePageBody,
  AnalysePageData,
  CreateAiSessionBody,
  CreateAiSessionData,
  FinishSessionBody,
  FinishSessionData,
  HydrateSessionData,
  ReviewElementsBody,
} from "@/types/aiTakeoff";

export const aiTakeoffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /uploads — multipart. Used for the drawing and for each page raster. */
    uploadAiFile: builder.mutation<
      ApiResponse<FileUploadResponse>,
      {
        file: File;
        folder?: string;
        onUploadProgress?: (event: AxiosProgressEvent) => void;
      }
    >({
      query: ({ file, folder, onUploadProgress }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (folder) formData.append("folder", folder);

        return {
          url: ApiEndpoints.uploads.upload,
          method: ApiMethods.POST,
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
        };
      },
    }),

    // GET /uploads/:id lives in uploadApi as `getUpload` — injecting a second
    // endpoint under the same name silently overrides it at runtime.

    /** POST /projects/:projectId/ai-takeoff/sessions */
    createAiTakeoffSession: builder.mutation<
      ApiResponse<CreateAiSessionData>,
      { projectId: string; body: CreateAiSessionBody }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.aiTakeoff.createSession(projectId),
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["AiTakeoffSession"],
    }),

    /** GET /ai-takeoff/sessions/:sessionId — session, elements and jobs */
    getAiTakeoffSession: builder.query<ApiResponse<HydrateSessionData>, string>({
      query: (sessionId) => ApiEndpoints.aiTakeoff.getSession(sessionId),
      providesTags: (_result, _error, sessionId) => [
        { type: "AiTakeoffSession" as const, id: sessionId },
      ],
    }),

    /** POST /ai-takeoff/sessions/:sessionId/pages — 202 + job */
    analyseAiTakeoffPage: builder.mutation<
      ApiResponse<AnalysePageData>,
      { sessionId: string; body: AnalysePageBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.aiTakeoff.analysePage(sessionId),
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: "AiTakeoffJob" as const, id: sessionId },
      ],
    }),

    /** GET /ai-takeoff/sessions/:sessionId/jobs */
    getAiTakeoffJobs: builder.query<ApiResponse<AiTakeoffJob[]>, string>({
      query: (sessionId) => ApiEndpoints.aiTakeoff.sessionJobs(sessionId),
      providesTags: (_result, _error, sessionId) => [
        { type: "AiTakeoffJob" as const, id: sessionId },
      ],
    }),

    /**
     * GET /ai-takeoff/jobs/:jobId
     * The documented fallback when Socket.IO is unavailable — drive it with
     * `pollingInterval` and stop once status is completed or failed.
     */
    getAiTakeoffJob: builder.query<ApiResponse<AiTakeoffJob>, string>({
      query: (jobId) => ApiEndpoints.aiTakeoff.job(jobId),
      providesTags: (_result, _error, jobId) => [
        { type: "AiTakeoffJob" as const, id: jobId },
      ],
    }),

    /** PATCH /ai-takeoff/sessions/:sessionId/elements/review — bulk accept/reject */
    reviewAiTakeoffElements: builder.mutation<
      ApiResponse<AiDetectedMeasurementElement[]>,
      { sessionId: string; body: ReviewElementsBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.aiTakeoff.reviewElements(sessionId),
        method: ApiMethods.PATCH,
        body,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: "AiTakeoffSession" as const, id: sessionId },
      ],
    }),

    /** POST /ai-takeoff/sessions/:sessionId/finish — materialize (+ optional BOQ commit) */
    finishAiTakeoffSession: builder.mutation<
      ApiResponse<FinishSessionData>,
      { sessionId: string; body?: FinishSessionBody }
    >({
      query: ({ sessionId, body }) => ({
        url: ApiEndpoints.aiTakeoff.finish(sessionId),
        method: ApiMethods.POST,
        body: body ?? {},
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: "AiTakeoffSession" as const, id: sessionId },
        "Projects",
      ],
    }),
  }),
});

export const {
  useUploadAiFileMutation,
  useCreateAiTakeoffSessionMutation,
  useGetAiTakeoffSessionQuery,
  useLazyGetAiTakeoffSessionQuery,
  useAnalyseAiTakeoffPageMutation,
  useGetAiTakeoffJobsQuery,
  useGetAiTakeoffJobQuery,
  useReviewAiTakeoffElementsMutation,
  useFinishAiTakeoffSessionMutation,
} = aiTakeoffApi;
