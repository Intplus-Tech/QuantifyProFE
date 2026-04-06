import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import { ApiResponse, FileUploadResponse } from "@/types/common";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<FileUploadResponse>, FormData>({
      query: (formData) => ({
        url: ApiEndpoints.uploads.upload,
        method: ApiMethods.POST,
        body: formData,
      }),
    }),
  }),
});

export const { useUploadFileMutation } = uploadApi;
