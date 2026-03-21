import { User } from "./auth";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  timestamp: string;
}

// --- Auth & User ---
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
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// --- Credits ---
export interface CreditBalance {
  balance: number;
  currency: string;
}

export interface CreditUsage {
  id: string;
  amount: number;
  feature: string;
  timestamp: string;
}

export interface AddCreditsInput {
  amount: number;
  paymentMethodId?: string;
}

// --- Documents ---
export interface ProcessDocumentInput {
  uploadedFileId: string;
  documentType: string;
  operationTypes: string[];
  preferredProvider?: string;
  documentHint?: string;
}

export interface EstimateDocumentInput {
  operationTypes: string[];
  pageCount: number;
}

export interface BoqRequest {
  urn: string;
  documentHint?: string;
  viewIndex?: number;
}

export interface BoqResponse {
  urn: string;
  modelGuid: string;
  viewName: string;
  rawItemCount: number;
  filteredItemCount: number;
  boq: string;
  boqData: Record<string, any>;
  generatedAt: string;
}

// --- Company ---
export interface UpdateCompanyInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export interface InviteMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AddLocationInput {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface UpdateBillingPlanInput {
  planId: string;
  billingInterval: "monthly" | "annually";
}

export interface AddPaymentMethodInput {
  type: "card" | "bank_account";
  last4: string;
  label: string;
  expiryDate?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  ownerId: string;
  [key: string]: any;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

// --- Library ---
export interface CreateCategoryInput {
  name: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isGlobal?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateLibraryItemInput {
  categoryId: string;
  description: string;
  unit?: string;
  baseRate: number;
  markupPercentage?: number;
  state?: string;
  country?: string;
  breakdown?: {
    machinery?: number;
    labour?: number;
    material?: number;
  };
}

export interface UpdateLibraryItemInput {
  categoryId?: string;
  description?: string;
  unit?: string;
  baseRate?: number;
  markupPercentage?: number;
  state?: string;
  country?: string;
  breakdown?: Record<string, any>;
}

export interface LibraryCategory {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
  companyId?: string | null;
  isGlobal?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface LibraryItem {
  _id: string;
  categoryId: LibraryCategory | string;
  description: string;
  finalRate: number;
  [key: string]: any;
}

// --- Plans ---
export interface CreatePlanInput {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency?: string;
  benefits: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  [key: string]: any;
}

// --- Support ---
export interface CreateTicketInput {
  fullName: string;
  email: string;
  subject: string;
  description: string;
  category?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  [key: string]: any;
}
