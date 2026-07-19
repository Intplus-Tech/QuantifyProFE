// BOQ document model. Shaped for the editable document UI — every total is
// derived from the items (see totals.ts), never stored.

export type SubsectionAccent = "amber" | "blue" | "green" | "orange";

/** Bill 1 and the M&E bill only carry a lump-sum amount — no qty/unit/rate columns. */
export type ColumnMode = "full" | "amount-only";

export interface BOQItem {
  id: string;
  ref: string; // "1.12", "A", "D20", "R1"
  description: string;
  /** "note" rows are informational (e.g. room schedules) — no ref, no pricing. */
  kind?: "item" | "note";
  qty: number | null;
  unit: string | null;
  rate: number | null;
  /** Used when qty/rate are absent (lump sums, amount-only bills). */
  lumpSum?: number;
  measurementMethod?: string;
  /** Take-off assumptions from the source drawing, shown under the description. */
  notes?: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
}

export interface BOQSubsection {
  id: string;
  code: string; // "1-1", "2A", "2B-E"
  title: string;
  accent: SubsectionAccent;
  columns: ColumnMode;
  items: BOQItem[];
}

export interface BOQBill {
  id: string;
  code: string; // "BILL NO. 2-B"
  title: string;
  pageLabel: string; // "Pages 10-13"
  subsections: BOQSubsection[];
}

/** A row on the master summary page. Pulls from a bill when `billId` is set. */
export interface SummaryRow {
  billNo: string;
  description: string;
  billId?: string;
  amount?: number;
}

export interface ProjectInfo {
  client: string;
  location: string;
  preparedBy: string;
  date: string;
}

export interface QuickSummaryRow {
  label: string;
  amount: number;
  emphasis?: "grand" | "muted";
}

export interface DocumentMeta {
  lastEdited: string;
  version: string;
  ref: string;
  firm: string;
}

export interface BOQDocument {
  title: string;
  subtitle: string;
  projectInfo: ProjectInfo;
  bills: BOQBill[];
  summaryRows: SummaryRow[];
  externalWorks: number;
  contingencyRate: number; // 0.05
  vatRate: number; // 0.075
  meta: DocumentMeta;
  /** Bill reported separately from the main-building sub-total. Omit when there isn't one. */
  preliminariesBillNo?: string;
  generalNotes?: string;
}
