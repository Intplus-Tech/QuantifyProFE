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
  unit: string;
  baseRate: number;
  markupPercentage: number;
  finalRate: number;
  state?: string;
  country?: string;
  [key: string]: any;
}

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
