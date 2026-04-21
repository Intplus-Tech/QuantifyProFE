export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  address: string;
  phoneNumber: string;
  role: "admin" | "user" | "company";
  companyId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  status: "active" | "suspended" | "pending";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: "admin" | "user" | "company";
  companyName?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  data: User;
}
