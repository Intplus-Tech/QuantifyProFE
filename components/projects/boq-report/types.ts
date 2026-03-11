// BOQ Report types — designed for API integration

export interface BOQLineItem {
  item: string;       // e.g. "1.1"
  description: string;
  unit: string;       // e.g. "m³", "m²", "tons"
  qty: number;
  rate: number;       // unit rate in dollars
  total: number;      // qty * rate
}

export interface BOQSection {
  id: string;
  title: string;
  items: BOQLineItem[];
  subtotal: number;
}

export interface CostCategory {
  name: string;
  value: number;
  color: string;      // tailwind bg class e.g. "bg-amber-500"
  percentage: number;  // e.g. 45
}

export interface ResourceAllocation {
  label: string;
  percentage: number;
  color: string;      // tailwind bg class
}

export interface ReportMeta {
  companyName: string;
  companySubtitle: string;
  dateGenerated: string;
  ref: string;
  location: string;
  reportTitle: string;
  reportSubtitle: string;
}

export interface BOQReport {
  meta: ReportMeta;
  sections: BOQSection[];
  costCategories: CostCategory[];
  resourceAllocations: ResourceAllocation[];
  grandTotal: number;
  terms: string[];
}
