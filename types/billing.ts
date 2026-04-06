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
