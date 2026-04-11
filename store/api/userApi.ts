import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { user as userEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import {
  UpdateUserInput,
  ProfessionalDetails,
  UpdateProfessionalDetailsInput,
  SecurityPreferences,
  UpdateSecurityPreferencesInput,
} from "@/types/user";
import { GetUserProfileResponse, User } from "@/types/auth";
import { setUser } from "../slices/authSlice";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<GetUserProfileResponse, void>({
      query: () => userEndpoints.profile,
      providesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(setUser(data.data));
          }
        } catch {}
      },
    }),
    updateProfile: builder.mutation<
      GetUserProfileResponse,
      { id: string; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: userEndpoints.updateProfile(id),
        method: ApiMethods.PUT,
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getProfessionalDetails: builder.query<
      ApiResponse<ProfessionalDetails>,
      void
    >({
      query: () => userEndpoints.professionalDetails,
      providesTags: ["User"],
    }),
    updateProfessionalDetails: builder.mutation<
      ApiResponse<User>,
      UpdateProfessionalDetailsInput
    >({
      query: (data) => ({
        url: userEndpoints.professionalDetails,
        method: ApiMethods.PUT,
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getSecurityPreferences: builder.query<
      ApiResponse<SecurityPreferences>,
      void
    >({
      query: () => userEndpoints.securityPreferences,
      providesTags: ["User"],
    }),
    updateSecurityPreferences: builder.mutation<
      ApiResponse<User>,
      UpdateSecurityPreferencesInput
    >({
      query: (data) => ({
        url: userEndpoints.securityPreferences,
        method: ApiMethods.PUT,
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useGetProfileQuery,
  useGetProfessionalDetailsQuery,
  useUpdateProfessionalDetailsMutation,
  useGetSecurityPreferencesQuery,
  useUpdateSecurityPreferencesMutation,
} = userApi;
