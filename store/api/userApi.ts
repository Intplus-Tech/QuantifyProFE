import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { user as userEndpoints } from "@/utils/endpoints";
import { ApiResponse, UpdateUserInput } from "@/types/api";
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
  }),
});

export const { useUpdateProfileMutation, useGetProfileQuery } = userApi;
