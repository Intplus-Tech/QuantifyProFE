import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import { ApiResponse, PaginatedResponse } from "@/types/common";
import { Template, CreateTemplateRequest } from "@/types/templates";

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<
      PaginatedResponse<Template>,
      { page?: number; limit?: number; type?: string; search?: string }
    >({
      query: (params) => ({
        url: ApiEndpoints.template.list,
        method: ApiMethods.GET,
        params,
      }),
      providesTags: ["Templates"],
    }),
    getTemplateById: builder.query<ApiResponse<Template>, string>({
      query: (templateId) => ({
        url: ApiEndpoints.template.details(templateId),
        method: ApiMethods.GET,
      }),
      providesTags: (result, error, id) => [{ type: "Templates", id }],
    }),
    createTemplate: builder.mutation<ApiResponse<Template>, CreateTemplateRequest>({
      query: (body) => ({
        url: ApiEndpoints.template.create,
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    deleteTemplate: builder.mutation<ApiResponse<null>, string>({
      query: (templateId) => ({
        url: ApiEndpoints.template.delete(templateId),
        method: ApiMethods.DELETE,
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
} = templatesApi;
