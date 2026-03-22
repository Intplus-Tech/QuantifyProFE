import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { company as companyEndpoints } from "@/utils/endpoints";
import {
  ApiResponse,
  CompanyProfile,
  TeamMember,
  UpdateCompanyInput,
  InviteMemberInput,
} from "@/types/api";
import { setCompany as setCompanyInCompanySlice, setTeamMembers } from "../slices/companySlice";
import { setCompany as setCompanyInAuthSlice } from "../slices/authSlice";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyProfile: builder.query<ApiResponse<CompanyProfile>, void>({
      query: () => companyEndpoints.profile,
      providesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(setCompanyInCompanySlice(data.data));
            dispatch(setCompanyInAuthSlice(data.data));
          }
        } catch {}
      },
    }),
    updateCompanyProfile: builder.mutation<
      ApiResponse<CompanyProfile>,
      UpdateCompanyInput
    >({
      query: (data) => ({
        url: companyEndpoints.updateProfile,
        method: ApiMethods.PUT,
        body: data,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(setCompanyInCompanySlice(data.data));
            dispatch(setCompanyInAuthSlice(data.data));
          }
        } catch {}
      },
    }),
    createCompanyProfile: builder.mutation<
      ApiResponse<CompanyProfile>,
      UpdateCompanyInput
    >({
      query: (data) => ({
        url: companyEndpoints.profile,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(setCompanyInCompanySlice(data.data));
            dispatch(setCompanyInAuthSlice(data.data));
          }
        } catch {}
      },
    }),
    getTeamMembers: builder.query<ApiResponse<TeamMember[]>, void>({
      query: () => companyEndpoints.team.list,
      providesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(setTeamMembers(data.data));
          }
        } catch {}
      },
    }),
    inviteTeamMember: builder.mutation<
      ApiResponse<TeamMember>,
      InviteMemberInput
    >({
      query: (data) => ({
        url: companyEndpoints.team.invite,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useCreateCompanyProfileMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
} = companyApi;
