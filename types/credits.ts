export interface CreditBalance {
  balance: number;
  currency: string;
  /** the API also reports the breakdown behind the balance */
  total?: number;
  used?: number;
  reserved?: number;
  available?: number;
}

export interface CreditUsage {
  id: string;
  amount: number;
  feature: string;
  timestamp: string;
}

/**
 * POST /credits/add — admin only.
 * `userId` and `amount` are both required by the API; omitting userId returns
 * a validation failure rather than defaulting to the caller.
 */
export interface AddCreditsInput {
  userId: string;
  amount: number;
  type?: string;
  description?: string;
}

export interface CreditPricing {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}

/** GET /credits/usage — summary by operation type. */
export interface CreditUsageSummary {
  operationType?: string;
  provider?: string;
  count?: number;
  credits?: number;
  costUSD?: number;
  [key: string]: unknown;
}
