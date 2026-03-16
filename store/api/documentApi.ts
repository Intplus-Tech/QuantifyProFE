import { baseApi } from "./baseApi";
import { documents as docEndpoints } from "@/utils/endpoints";
import {
  ApiResponse,
  BoqRequest,
  BoqResponse,
  ProcessDocumentInput,
} from "@/types/api";
import { setJobs } from "../slices/documentSlice";

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    processDocument: builder.mutation<ApiResponse<any>, ProcessDocumentInput>({
      query: (data) => ({
        url: docEndpoints.process,
        method: "POST",
        body: data,
      }),
    }),
    generateBoq: builder.mutation<ApiResponse<BoqResponse>, BoqRequest>({
      query: (data) => ({
        url: docEndpoints.jobDetails(data.urn),
        method: "POST",
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
