import { baseApi } from "./baseApi";
import { plans as plansEndpoints } from "@/utils/endpoints";
import { ApiResponse, Plan, CreatePlanInput } from "@/types/api";
import { setPlans, setActivePlan } from "../slices/plansSlice";

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ApiResponse<Plan[]>, void>({
      query: () => plansEndpoints.all,
      providesTags: ["Plans"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setPlans(data.data));
        } catch {}
      },
    }),
    getPlanDetails: builder.query<ApiResponse<Plan>, string>({
      query: (id) => plansEndpoints.details(id),
      providesTags: ["Plans"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setActivePlan(data.data));
        } catch {}
      },
    }),
    createPlan: builder.mutation<ApiResponse<Plan>, CreatePlanInput>({
      query: (data) => ({
        url: plansEndpoints.create,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Plans"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanDetailsQuery,
  useCreatePlanMutation,
} = plansApi;
