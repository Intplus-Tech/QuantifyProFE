import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { plans as plansEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import { setPlans, setActivePlan } from "../slices/plansSlice";
import { CreatePlanInput, Plan } from "@/types/plans";

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
        method: ApiMethods.POST,
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
