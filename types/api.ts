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
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  title?: string;
}

export interface Certification {
  name: string;
  membershipNumber: string;
}

export interface ProfessionalDetails {
  professionalTitle: string;
  certifications: Certification[];
  yearsOfExperience: number;
  industrySpecialization: string;
  specializedSkills: string[];
}

export interface UpdateProfessionalDetailsInput {
  certifications: Certification[];
  yearsOfExperience: number;
  industrySpecialization: string;
  specializedSkills: string[];
}

export interface SecurityPreferences {
  emailAlertsEnabled: boolean;
  sessionTimeoutEnabled: boolean;
}

export interface UpdateSecurityPreferencesInput {
  emailAlertsEnabled: boolean;
  sessionTimeoutEnabled: boolean;
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
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  type?: string;
  industry?: string;
  companySize?: string;
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
  providerRef?: string;
}

export interface BillingPlan {
  _id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

export interface BillingPaymentMethod {
  _id: string;
  type: string;
  last4: string;
  label: string;
  isPrimary: boolean;
  expiryDate?: string;
}

export interface BillingInvoice {
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  description?: string;
  billingInterval?: string;
  createdAt?: string;
}

export interface BillingInfo {
  plan: BillingPlan;
  subscriptionStatus: string;
  billingInterval: string;
  nextBillingDate: string;
  totalSeats: number;
  usedSeats: number;
  paymentMethods: BillingPaymentMethod[];
  recentInvoices: BillingInvoice[];
}

export interface SubscribeInput {
  planId: string;
  billingInterval: "monthly" | "annually";
}

export interface SubscribeResponse {
  authorizationUrl: string;
  reference: string;
  invoiceId: string;
}

export interface VerifySubscriptionInput {
  reference: string;
}

export interface UsageStats {
  activeProjects: {
    used: number;
    limit: number;
  };
  boqExtractions: {
    used: number;
    limit: number;
  };
  plan: {
    name: string;
    slug: string;
  };
  subscriptionStatus: string;
  nextBillingDate: string;
  billingInterval: string;
}

export interface CompanyProfile {
  id: string;
  _id?: string;
  name?: string;
  legalName?: string;
  email: string;
  ownerId: string;
  type?: string;
  industry?: string;
  companySize?: string;
  address?: string;
  addresses?: any[];
  phone?: string;
  logo?: string;
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
