import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { auth as authEndpoints } from "@/utils/endpoints";
import { ApiResponse } from "@/types/common";
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  LoginResponse,
  RegistrationResponse,
} from "@/types/auth";
import { logout, setAuth } from "../slices/authSlice";
import { setToken, removeToken } from "@/utils/tokenManager";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (userData) => ({
        url: authEndpoints.login,
        method: ApiMethods.POST,
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            const token = (data.data as any).tokens?.accessToken || (data.data as any).accessToken;
            if (token) {
              setToken(token);
              dispatch(
                setAuth({
                  accessToken: token,
                  currentUser: data.data.user,
                  user: null,
                  company: null,
                })
              );
            }
          }
        } catch {}
      },
    }),
    register: builder.mutation<RegistrationResponse, RegisterInput>({
      query: (userData) => ({
        url: authEndpoints.register,
        method: ApiMethods.POST,
        body: userData,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: authEndpoints.logout,
        method: ApiMethods.POST,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          dispatch(logout());
        } catch {}
      },
    }),
    refreshToken: builder.mutation<any, RefreshTokenInput>({
      query: (body) => ({
        url: authEndpoints.refresh,
        method: ApiMethods.POST,
        body,
      }),
    }),
    forgotPassword: builder.mutation<any, ForgotPasswordInput>({
      query: (body) => ({
        url: authEndpoints.forgotPassword,
        method: ApiMethods.POST,
        body,
      }),
    }),
    resetPassword: builder.mutation<any, ResetPasswordInput>({
      query: (body) => ({
        url: authEndpoints.resetPassword,
        method: ApiMethods.POST,
        body,
      }),
    }),
    changePassword: builder.mutation<ApiResponse<{ message: string }>, ChangePasswordInput>({
      query: (body) => ({
        url: authEndpoints.changePassword,
        method: ApiMethods.POST,
        body,
      }),
    }),
    verifyEmail: builder.mutation<any, { token: string }>({
      query: (body) => ({
        url: authEndpoints.verifyEmail,
        method: ApiMethods.POST,
        body,
      }),
    }),
    verifyOtp: builder.mutation<any, { email: string; otp: string }>({
      query: (body) => ({
        url: authEndpoints.verifyEmail, // Assuming OTP uses same endpoint or similar
        method: ApiMethods.POST,
        body,
      }),
    }),
    resendVerificationEmail: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: authEndpoints.resendVerificationEmail,
        method: ApiMethods.POST,
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useVerifyOtpMutation,
  useResendVerificationEmailMutation,
} = authApi;
