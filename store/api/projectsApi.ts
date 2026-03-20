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
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useArchiveProjectMutation,
} = projectsApi;
