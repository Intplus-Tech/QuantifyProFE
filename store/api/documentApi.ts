import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { documents as docEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import { BoqRequest, BoqResponse, ProcessDocumentInput } from "@/types/documents";
import { setJobs } from "../slices/documentSlice";

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    processDocument: builder.mutation<ApiResponse<any>, ProcessDocumentInput>({
      query: (data) => ({
        url: docEndpoints.process,
        method: ApiMethods.POST,
        body: data,
      }),
    }),
    generateBoq: builder.mutation<ApiResponse<BoqResponse>, BoqRequest>({
      query: (data) => ({
        url: docEndpoints.jobDetails(data.urn),
        method: ApiMethods.POST,
        body: data,
      }),
    }),
    getJobs: builder.query<ApiResponse<any[]>, void>({
      query: () => docEndpoints.jobs,
      providesTags: ["Documents"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setJobs(data.data));
        } catch {}
      },
    }),
  }),
});

export const {
  useProcessDocumentMutation,
  useGenerateBoqMutation,
  useGetJobsQuery,
} = documentApi;
