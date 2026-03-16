export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface RegistrationData {
  user: User;
  message: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: RegistrationData;
  timestamp: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  timestamp: string;
}
export interface LoginData {
  user: User;
  tokens: Tokens;
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  data: User;
  timestamp: string;
}
