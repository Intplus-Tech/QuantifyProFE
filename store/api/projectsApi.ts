import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import {
  setProjects,
  setSelectedProject,
  addProject,
  updateProjectInState,
  removeProject,
  Project,
} from "../slices/projectsSlice";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export interface BimUploadResponse {
  urn: string;
  objectKey: string;
  bucketKey: string;
  translationStatus: string;
}

export interface BimTranslationStatus {
  urn: string;
  status: string;
  progress: string;
  derivatives: any[];
}

export interface BimJob {
  _id: string;
  urn: string;
  originalFilename: string;
  fileType: string;
  status: string;
  viewName?: string;
  rawItemCount?: number;
  filteredItemCount?: number;
  thumbnailUrl?: string;
  viewIndex?: number;
  createdAt: string;
  result?: {
    projectTitle: string;
    sections: any[]; 
  };
}

export interface BimWorkItem {
  item: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  total?: number;
  notes?: string;
}

export interface BimSection {
  sectionName: string;
  workItems: BimWorkItem[];
}

export interface BimJobUpdateRequest {
  projectTitle?: string;
  sections?: BimSection[];
  generalNotes?: string;
}

export interface PdfBoqGenerateResponse {
  jobId: string;
  status: string;
}

export interface PdfBoqJob {
  _id: string;
  originalFilename: string;
  status: string;
  createdAt: string;
  result?: {
    projectTitle: string;
    sections: BimSection[];
  };
}

export interface PdfBoqCreateProjectRequest {
  name: string;
  description: string;
  companyId?: string;
  clientId?: string;
  clientName?: string;
  projectCode?: string;
  projectType?: string;
  projectLocation?: string;
  drawingType?: string;
}

export interface PdfBoqCreateProjectResponse {
  _id: string;
  name: string;
  description: string;
  source: string;
  sourceJobId: string;
  status: string;
  clientName: string;
  projectCode: string;
  projectType: string;
  projectLocation: string;
  boqResult: any;
  createdAt: string;
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<
      PaginatedResponse<Project>,
      { page?: number; limit?: number; status?: string; source?: string; companyId?: string }
    >({
      query: (params) => ({
        url: ApiEndpoints.projects.list,
        method: ApiMethods.GET,
        params,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data && data?.pagination) {
            dispatch(setProjects({ data: data.data, pagination: data.pagination }));
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
    createProject: builder.mutation<ApiResponse<Project>, Partial<Project>>({
      query: (body) => ({
        url: ApiEndpoints.projects.create,
        method: ApiMethods.POST,
        body,
      }),
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
    updateProject: builder.mutation<ApiResponse<Project>, { projectId: string; body: Partial<Project> }>({
      query: ({ projectId, body }) => ({
        url: ApiEndpoints.projects.update(projectId),
        method: ApiMethods.PATCH,
        body,
      }),
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
    uploadBimFile: builder.mutation<ApiResponse<BimUploadResponse>, FormData>({
      query: (formData) => ({
        url: ApiEndpoints.bim.upload,
        method: ApiMethods.POST,
        body: formData,
      }),
    }),
    getBimStatus: builder.query<ApiResponse<BimTranslationStatus>, string>({
      query: (urn) => ({
        url: ApiEndpoints.bim.status(urn),
        method: ApiMethods.GET,
      }),
    }),
    getBimJobs: builder.query<PaginatedResponse<BimJob>, { page?: number; limit?: number }>({
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
    updateBimJob: builder.mutation<ApiResponse<BimJob>, { jobId: string; body: BimJobUpdateRequest }>({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.bim.updateJob(jobId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    getBimJobPdf: builder.query<ApiResponse<any>, string>({
      query: (jobId) => ({
        url: ApiEndpoints.bim.jobPdf(jobId),
        method: ApiMethods.GET,
      }),
    }),
    generatePdfBoq: builder.mutation<ApiResponse<PdfBoqGenerateResponse>, FormData>({
      query: (formData) => ({
        url: ApiEndpoints.pdfBoq.generate,
        method: ApiMethods.POST,
        body: formData,
      }),
    }),
    getPdfBoqJobs: builder.query<PaginatedResponse<PdfBoqJob>, { page?: number; limit?: number }>({
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
    updatePdfBoqJob: builder.mutation<ApiResponse<PdfBoqJob>, { jobId: string; body: BimJobUpdateRequest }>({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.pdfBoq.updateJob(jobId),
        method: ApiMethods.PATCH,
        body,
      }),
    }),
    getPdfBoqJobPdf: builder.query<ApiResponse<any>, string>({
      query: (jobId) => ({
        url: ApiEndpoints.pdfBoq.jobPdf(jobId),
        method: ApiMethods.GET,
      }),
    }),
    createProjectFromPdfBoq: builder.mutation<ApiResponse<PdfBoqCreateProjectResponse>, { jobId: string; body: PdfBoqCreateProjectRequest }>({
      query: ({ jobId, body }) => ({
        url: ApiEndpoints.pdfBoq.createProject(jobId),
        method: ApiMethods.POST,
        body,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
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
  useGeneratePdfBoqMutation,
  useGetPdfBoqJobsQuery,
  useGetPdfBoqJobByIdQuery,
  useUpdatePdfBoqJobMutation,
  useGetPdfBoqJobPdfQuery,
  useCreateProjectFromPdfBoqMutation,
} = projectsApi;
