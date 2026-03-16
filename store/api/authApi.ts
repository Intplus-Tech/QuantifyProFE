import { baseApi } from "./baseApi";
import { auth as authEndpoints } from "@/utils/endpoints";
import { LoginResponse, RegistrationResponse } from "@/types/auth";
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "@/types/api";
import { logout } from "../slices/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegistrationResponse, RegisterInput>({
      query: (userData) => ({
        url: authEndpoints.register,
        method: "POST",
        body: userData,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: authEndpoints.logout,
        method: "POST",
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
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<any, ForgotPasswordInput>({
      query: (body) => ({
        url: authEndpoints.forgotPassword,
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<any, ResetPasswordInput>({
      query: (body) => ({
        url: authEndpoints.resetPassword,
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<any, ChangePasswordInput>({
      query: (body) => ({
        url: authEndpoints.changePassword,
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.mutation<any, { token: string }>({
      query: (body) => ({
        url: authEndpoints.verifyEmail,
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<any, { email: string; otp: string }>({
      query: (body) => ({
        url: authEndpoints.verifyEmail, // Assuming OTP uses same endpoint or similar
        method: "POST",
        body,
      }),
    }),
    resendVerificationEmail: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: authEndpoints.resendVerificationEmail,
        method: "POST",
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
