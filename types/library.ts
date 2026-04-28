// ─── Category ────────────────────────────────────────────────────────────────

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

export interface LibraryCategorySummary extends LibraryCategory {
  itemCount: number;
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

// ─── Library Item ─────────────────────────────────────────────────────────────

export interface LibraryItemBreakdown {
  machinery: number;
  labour: number;
  material: number;
}

export interface LibraryItem {
  _id: string;
  itemCode?: string;
  categoryId: LibraryCategory | string;
  description: string;
  unit: string;
  baseRate: number;
  markupPercentage: number;
  finalRate: number;
  state?: string;
  country?: string;
  breakdown?: LibraryItemBreakdown;
}

export interface CreateLibraryItemInput {
  categoryId: string;
  description: string;
  unit: string;
  baseRate: number;
  markupPercentage: number;
  state: string;
  country: string;
  breakdown?: LibraryItemBreakdown;
}

export interface UpdateLibraryItemInput {
  categoryId?: string;
  description?: string;
  unit?: string;
  baseRate?: number;
  markupPercentage?: number;
  state?: string;
  country?: string;
  breakdown?: LibraryItemBreakdown;
}

// ─── Price History ────────────────────────────────────────────────────────────

export interface LibraryItemPriceHistoryEntry {
  baseRate: number;
  markupPercentage: number;
  finalRate: number;
  changedAt: string;
}

export interface LibraryItemPriceHistoryData {
  item: {
    _id: string;
    itemCode?: string;
    description: string;
    unit: string;
    baseRate: number;
    markupPercentage: number;
    finalRate: number;
  };
  history: LibraryItemPriceHistoryEntry[];
}

export interface GetPriceHistoryParams {
  itemId: string;
  companyId?: string;
  from?: string;
  to?: string;
}

// ─── Locations & Units ────────────────────────────────────────────────────────

export interface LibraryUnit {
  value: string;
  label: string;
}

