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

export interface CreditPricing {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}
