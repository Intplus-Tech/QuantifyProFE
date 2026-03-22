export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  title?: string;
  professionalTitle?: string;
  certifications?: Array<{ name: string; membershipNumber: string }>;
  yearsOfExperience?: number;
  industrySpecialization?: string;
  specializedSkills?: string[];
  emailAlertsEnabled?: boolean;
  sessionTimeoutEnabled?: boolean;
  role: string;
  status: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
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

export interface LoginData {
  user: User;
  tokens: Tokens;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  timestamp: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  data: User;
  timestamp: string;
}
