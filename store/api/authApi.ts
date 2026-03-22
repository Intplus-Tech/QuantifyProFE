import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { auth as authEndpoints } from "@/utils/endpoints";
import { LoginResponse, RegistrationResponse } from "@/types/auth";
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  ApiResponse,
} from "@/types/api";
import { logout } from "../slices/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
