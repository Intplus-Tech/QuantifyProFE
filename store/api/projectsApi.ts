import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import {
  setProjects,
  setSelectedProject,
  addProject,
  updateProjectInState,
  removeProject,
} from "../slices/projectsSlice";
import { ApiResponse, PaginatedResponse } from "@/types/common";
import {
  Project,
  BimUploadResponse,
  BimTranslationStatus,
  BimJob,
  BimJobUpdateRequest,
  PdfBoqGenerateResponse,
  PdfBoqJob,
  PdfBoqCreateProjectRequest,
  PdfBoqCreateProjectResponse,
  ProjectDashboardSummary,
  ProjectThumbnailResponse,
  BoqReportPreview,
  SaveBoqRowRequest,
  SaveBoqRowResponse,
  ProjectMember,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
  ProjectActivity,
  MultiBoqJob,
  MultiBoqGenerateResponse,
  MultiBoqJobUpdateRequest,
} from "@/types/projects";
import { ProjectStructuralScopesResponse } from "@/types/manualProject";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<
      PaginatedResponse<Project>,
      {
        page?: number;
        limit?: number;
        status?: string;
        source?: string;
        companyId?: string;
      }
    >({
      query: (params) => ({
        url: ApiEndpoints.projects.list,
        method: ApiMethods.GET,
        params,
      }),
      providesTags: ["Projects"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data && data?.pagination) {
            dispatch(
              setProjects({ data: data.data, pagination: data.pagination }),
            );
          }
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        }
      },
    }),
    getProjectById: builder.query<ApiResponse<Project>, string>({
      query: (projectId) => ({
        url: ApiEndpoints.projects.details(projectId),
        method: ApiMethods.GET,
      }),
      providesTags: (result, error, id) => [{ type: "Projects", id }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Adapting based on standard response style, could be wrapped in success/data
          const projectData = data?.data || data;
          if (projectData && projectData._id) {
            dispatch(setSelectedProject(projectData));
          }
        } catch (error) {
          console.error("Failed to fetch project details:", error);
        }
      },
    }),
    getProjectStructuralScopes: builder.query<
      ProjectStructuralScopesResponse,
      string
    >({
      query: (projectId) => ({
        url: ApiEndpoints.projects.structuralScopes(projectId),
        method: ApiMethods.GET,
      }),
      providesTags: (result, error, projectId) => [
        { type: "Projects", id: `${projectId}-structural-scopes` },
      ],
    }),
    createProject: builder.mutation<ApiResponse<Project>, Partial<Project>>({
      query: (body) => ({
        url: ApiEndpoints.projects.create,
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Projects"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const projectData = data?.data || data;
          if (projectData && projectData._id) {
            dispatch(addProject(projectData));
          }
        } catch (error) {
          console.error("Failed to create project:", error);
        }
      },
    }),
    updateProject: builder.mutation<
      ApiResponse<Project>,
      { projectId: string; body: Partial<Project> }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.projects.update(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Projects", id: projectId },
        "Projects",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const projectData = data?.data || data;
          if (projectData && projectData._id) {
            dispatch(updateProjectInState(projectData));
          }
        } catch (error) {
          console.error("Failed to update project:", error);
        }
      },
    }),
    deleteProject: builder.mutation<ApiResponse<null>, string>({
      query: (projectId) => ({
        url: ApiEndpoints.projects.delete(projectId),
        method: ApiMethods.DELETE,
      }),
      invalidatesTags: ["Projects"],
      async onQueryStarted(projectId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeProject(projectId));
        } catch (error) {
          console.error("Failed to delete project:", error);
        }
      },
    }),
    archiveProject: builder.mutation<ApiResponse<Project>, string>({
      query: (projectId) => ({
        url: ApiEndpoints.projects.archive(projectId),
        method: ApiMethods.PATCH, // Usually patching status to archived
      }),
      async onQueryStarted(projectId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const projectData = data?.data || data;
          if (projectData && projectData._id) {
            dispatch(updateProjectInState(projectData));
          }
        } catch (error) {
          console.error("Failed to archive project:", error);
        }
      },
    }),
    uploadBimFile: builder.mutation<
      ApiResponse<BimUploadResponse>,
      { formData: FormData; onProgress?: (percent: number) => void }
    >({
      query: ({ formData, onProgress }) => ({
        url: ApiEndpoints.bim.upload,
        method: ApiMethods.POST,
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        },
      }),
    }),
    getBimStatus: builder.query<ApiResponse<BimTranslationStatus>, string>({
      query: (urn) => ({
        url: ApiEndpoints.bim.status(urn),
        method: ApiMethods.GET,
      }),
    }),
    submitBimBoqJob: builder.mutation<
      ApiResponse<{ jobId: string; status: string }>,
      string
    >({
      query: (urn) => ({
        url: ApiEndpoints.bim.generateBoq(urn),
        method: ApiMethods.POST,
      }),
    }),
    getBimJobs: builder.query<
      PaginatedResponse<BimJob>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: ApiEndpoints.bim.jobs,
        method: ApiMethods.GET,
        params,
      }),
    }),
    getBimJobById: builder.query<ApiResponse<BimJob>, string>({
      query: (jobId) => ({
        url: ApiEndpoints.bim.jobDetails(jobId),
        method: ApiMethods.GET,
      }),
    }),
    updateBimJob: builder.mutation<
      ApiResponse<BimJob>,
      { jobId: string; body: BimJobUpdateRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.bim.updateJob(jobId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    getBimJobPdf: builder.query<Blob, string>({
      query: (jobId) => ({
        url: ApiEndpoints.bim.jobPdf(jobId),

        responseHandler: (response: any) => response.blob(),
      }),
    }),
    createProjectFromBimBoq: builder.mutation<
      ApiResponse<PdfBoqCreateProjectResponse>,
      { jobId: string; body: PdfBoqCreateProjectRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.bim.createProject(jobId),
        method: ApiMethods.POST,
        body,
      }),
    }),
    uploadPdfBoq: builder.mutation<
      ApiResponse<PdfBoqGenerateResponse>,
      { formData: FormData; onProgress?: (percent: number) => void }
    >({
      query: ({ formData, onProgress }) => ({
        url: ApiEndpoints.pdfBoq.generate,
        method: ApiMethods.POST,
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        },
      }),
    }),
    getPdfBoqJobs: builder.query<
      PaginatedResponse<PdfBoqJob>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: ApiEndpoints.pdfBoq.jobs,
        method: ApiMethods.GET,
        params,
      }),
    }),
    getPdfBoqJobById: builder.query<ApiResponse<PdfBoqJob>, string>({
      query: (jobId) => ({
        url: ApiEndpoints.pdfBoq.jobDetails(jobId),
        method: ApiMethods.GET,
      }),
    }),
    updatePdfBoqJob: builder.mutation<
      ApiResponse<PdfBoqJob>,
      { jobId: string; body: BimJobUpdateRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.pdfBoq.updateJob(jobId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    getPdfBoqJobPdf: builder.query<Blob, string>({
      query: (jobId) => ({
        url: ApiEndpoints.pdfBoq.jobPdf(jobId),
        method: ApiMethods.GET,
        responseHandler: (response: any) => response.blob(),
      }),
    }),
    createProjectFromPdfBoq: builder.mutation<
      ApiResponse<PdfBoqCreateProjectResponse>,
      { jobId: string; body: PdfBoqCreateProjectRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.pdfBoq.createProject(jobId),
        method: ApiMethods.POST,
        body,
      }),
    }),
    uploadMultiBoq: builder.mutation<
      ApiResponse<MultiBoqGenerateResponse>,
      { formData: FormData; onProgress?: (percent: number) => void }
    >({
      query: ({ formData, onProgress }) => ({
        url: ApiEndpoints.multiBoq.generate,
        method: ApiMethods.POST,
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        },
      }),
    }),
    getMultiBoqJobById: builder.query<ApiResponse<MultiBoqJob>, string>({
      query: (jobId) => ({
        url: ApiEndpoints.multiBoq.jobDetails(jobId),
        method: ApiMethods.GET,
      }),
    }),
    updateMultiBoqJob: builder.mutation<
      ApiResponse<MultiBoqJob>,
      { jobId: string; body: MultiBoqJobUpdateRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.multiBoq.updateJob(jobId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    getMultiBoqJobPdf: builder.query<Blob, string>({
      query: (jobId) => ({
        url: ApiEndpoints.multiBoq.jobPdf(jobId),
        method: ApiMethods.GET,
        responseHandler: (response: any) => response.blob(),
      }),
    }),
    createProjectFromMultiBoq: builder.mutation<
      ApiResponse<PdfBoqCreateProjectResponse>,
      { jobId: string; body: PdfBoqCreateProjectRequest }
    >({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.multiBoq.createProject(jobId),
        method: ApiMethods.POST,
        body,
      }),
    }),
    getProjectDashboard: builder.query<
      ApiResponse<ProjectDashboardSummary>,
      string
    >({
      query: (projectId) => ({
        url: ApiEndpoints.projects.dashboard(projectId),
        method: ApiMethods.GET,
      }),
    }),
    updateProjectThumbnail: builder.mutation<
      ApiResponse<ProjectThumbnailResponse>,
      { projectId: string; thumbnailUrl: string }
    >({
      query: ({ projectId, thumbnailUrl }) => ({
        url: ApiEndpoints.projects.updateThumbnail(projectId),
        method: ApiMethods.PATCH,
        body: { thumbnailUrl },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Projects", id: projectId },
        "Projects",
      ],
      async onQueryStarted(
        { projectId, thumbnailUrl },
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            // Update the project in the state with the new thumbnail
            // Since updateProjectInState expects a Full Project, we cast it if needed
            // or we use a more granular update if available.
            // For now, we utilize the dispatcher to update the UI immediately.
            dispatch(
              updateProjectInState({ _id: projectId, thumbnailUrl } as any),
            );
          }
        } catch (error) {
          console.error("Failed to update project thumbnail state:", error);
        }
      },
    }),
    getBoqReportPreview: builder.query<ApiResponse<BoqReportPreview>, string>({
      query: (projectId) => ({
        url: ApiEndpoints.projects.boqReportPreview(projectId),
        method: ApiMethods.GET,
      }),
    }),
    saveBoqRowToLibrary: builder.mutation<
      ApiResponse<SaveBoqRowResponse>,
      { projectId: string; body: SaveBoqRowRequest }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.projects.saveBoqRowToLibrary(projectId),
        method: ApiMethods.POST,
        body,
      }),
    }),
    getProjectsByCompany: builder.query<
      PaginatedResponse<Project>,
      {
        companyId: string;
        page?: number;
        limit?: number;
        status?: string;
        source?: string;
        search?: string;
      }
    >({
      query: ({ companyId, ...params }) => ({
        url: ApiEndpoints.projects.listByCompany(companyId),
        method: ApiMethods.GET,
        params,
      }),
    }),
    getProjectActivity: builder.query<
      ApiResponse<ProjectActivity[]>,
      { projectId: string; limit?: number }
    >({
      query: ({ projectId, ...params }) => ({
        url: ApiEndpoints.projects.activity(projectId),
        method: ApiMethods.GET,
        params,
      }),
    }),
    getProjectMembers: builder.query<
      PaginatedResponse<ProjectMember>,
      { projectId: string; page?: number; limit?: number }
    >({
      query: ({ projectId, ...params }) => ({
        url: ApiEndpoints.projects.members.list(projectId),
        method: ApiMethods.GET,
        params,
      }),
    }),
    addProjectMember: builder.mutation<
      ApiResponse<ProjectMember>,
      { projectId: string; body: AddProjectMemberRequest }
    >({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.projects.members.add(projectId),
        method: ApiMethods.POST,
        body,
      }),
    }),
    updateProjectMemberRole: builder.mutation<
      ApiResponse<ProjectMember>,
      { projectId: string; memberId: string; body: UpdateProjectMemberRequest }
    >({
      query: ({ projectId, memberId, body }) => ({
        url: ApiEndpoints.projects.members.update(projectId, memberId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    deleteProjectMember: builder.mutation<
      ApiResponse<null>,
      { projectId: string; memberId: string }
    >({
      query: ({ projectId, memberId }) => ({
        url: ApiEndpoints.projects.members.remove(projectId, memberId),
        method: ApiMethods.DELETE,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetProjectStructuralScopesQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useArchiveProjectMutation,
  useUploadBimFileMutation,
  useGetBimStatusQuery,
  useGetBimJobsQuery,
  useGetBimJobByIdQuery,
  useUpdateBimJobMutation,
  useGetBimJobPdfQuery,
  useSubmitBimBoqJobMutation,
  useCreateProjectFromBimBoqMutation,
  useUploadPdfBoqMutation,
  useGetPdfBoqJobsQuery,
  useGetPdfBoqJobByIdQuery,
  useUpdatePdfBoqJobMutation,
  useGetPdfBoqJobPdfQuery,
  useLazyGetPdfBoqJobPdfQuery,
  useCreateProjectFromPdfBoqMutation,
  useUploadMultiBoqMutation,
  useGetMultiBoqJobByIdQuery,
  useUpdateMultiBoqJobMutation,
  useGetMultiBoqJobPdfQuery,
  useCreateProjectFromMultiBoqMutation,
  useGetProjectDashboardQuery,
  useUpdateProjectThumbnailMutation,
  useGetBoqReportPreviewQuery,
  useSaveBoqRowToLibraryMutation,
  useGetProjectsByCompanyQuery,
  useGetProjectActivityQuery,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useDeleteProjectMemberMutation,
} = projectsApi;
