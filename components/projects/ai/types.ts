export type MeasureGroup = "foundations" | "superstructure";

export interface MeasureType {
  id: string;
  label: string;
  group: MeasureGroup;
  /** lucide-react icon name, resolved in MeasureTile to keep this file serialisable */
  icon: string;
}

export type ExtractionStatus = "valid" | "review" | "rejected";

export type PageStatus = "processed" | "review" | "current" | "pending";

export interface ElementDimensions {
  shape: string;
  /** millimetres — null means OCR could not read it */
  length: number | null;
  width: number | null;
  depth: number | null;
  diameter: number | null;
}

export interface ExtractedElement {
  id: string;
  measureTypeId: string;
  grid: string;
  page: number;
  source: string;
  confidence: number;
  status: ExtractionStatus;
  dimensions: ElementDimensions;
  note?: string;
}

export interface ExtractedGroup {
  measureTypeId: string;
  title: string;
  pageRange: string;
  elements: ExtractedElement[];
}

export interface GlobalParameters {
  /** all millimetres except soilType */
  workingSpace: number;
  blinding: number;
  concreteCover: number;
  soilType: string;
}

export interface DrawingPageMeta {
  number: number;
  status: PageStatus;
}

export type ExtractionStepStatus = "pending" | "running" | "done";

export interface ExtractionStep {
  id: string;
  title: string;
  detail: string;
  status: ExtractionStepStatus;
}

export interface ComputedQuantities {
  concrete: number;
  formwork: number;
  rebar: number;
  excavation: number;
}

export interface BoqLineItem {
  id: string;
  label: string;
  descriptor?: string;
  qty: number;
  unit: string;
  rate: number | null;
  concrete: number;
  rebar: number;
  formwork: number;
  excavation: number | null;
}

export interface BoqSection {
  id: string;
  title: string;
  count?: string;
  itemLabel: string;
  descriptorLabel?: string;
  items: BoqLineItem[];
}

export interface ConcreteScheduleRow {
  id: string;
  description: string;
  grade: string;
  qty: number;
  wastagePct: number;
  unitCost: number | null;
}

export interface RebarScheduleRow {
  id: string;
  barSize: string;
  qty: number;
  wastagePct: number;
  unitCost: number | null;
}

export interface FormworkMaterialRow {
  id: string;
  element: string;
  qty: number;
  type: string;
  area: number;
  unitCost: number | null;
}

export interface BbsRow {
  id: string;
  barMark: string;
  size: number;
  noBars: number;
  cutLength: number;
  weight: number;
  shapeCode: string;
}

export interface BbsGroup {
  id: string;
  title: string;
  tags?: string[];
  rows: BbsRow[];
}

export interface FormworkBreakdownRow {
  id: string;
  element: string;
  type: string;
  area: number;
  plywoodSheets: number;
  timber: number;
  steelProps: number;
  strikingTime: string;
}

export interface AiProjectMeta {
  projectTitle: string;
  clientName: string;
  /** short label used in report headings, e.g. "FANIMOKUN - LEKKI PENINSULA" */
  subject: string;
  siteRef: string;
  date: string;
}
