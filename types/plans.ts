export interface Plan {
  id: string;
  name: string;
  price: number;
  [key: string]: any;
}

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
