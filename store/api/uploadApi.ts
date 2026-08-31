import axios, { AxiosError } from "axios";
import type { AxiosProgressEvent } from "axios";
import { baseApi } from "./baseApi";
import { ApiEndpoints } from "@/utils/endpoints";
import { ApiMethods } from "@/utils/apiMethods";
import { ApiResponse, FileUploadResponse } from "@/types/common";
import { getToken } from "@/utils/tokenManager";

export interface UploadFileArgs {
  formData: FormData;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<FileUploadResponse>, UploadFileArgs>({
      query: ({ formData, onUploadProgress }) => ({
        url: ApiEndpoints.uploads.upload,
        method: ApiMethods.POST,
        body: formData,
        onUploadProgress,
      }),
    }),
    getUpload: builder.query<ApiResponse<FileUploadResponse>, string>({
      query: (fileId) => ({
        url: ApiEndpoints.uploads.getUploads(fileId),
        method: ApiMethods.GET,
      }),
    }),
    downloadUpload: builder.query<string, string>({
      queryFn: async (fileId) => {
        try {
          const token = getToken();
          const response = await axios({
            url: `${ApiEndpoints.baseUrl}${ApiEndpoints.uploads.downloadUpload(fileId)}`,
            method: "GET",
            responseType: "blob",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          return { data: URL.createObjectURL(response.data as Blob) };
        } catch (error) {
          const err = error as AxiosError;
          return {
            error: {
              status: err.response?.status ?? "NETWORK_ERROR",
              data: err.response?.data ?? err.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetUploadQuery,
  useLazyGetUploadQuery,
  useDownloadUploadQuery,
  useLazyDownloadUploadQuery,
} = uploadApi;
