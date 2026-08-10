import type {
  AiProjectMeta,
  BbsGroup,
  BoqSection,
  ConcreteScheduleRow,
  DrawingPageMeta,
  ExtractedGroup,
  ExtractionStep,
  FormworkBreakdownRow,
  FormworkMaterialRow,
  GlobalParameters,
  MeasureType,
  RebarScheduleRow,
} from "./types";

// TODO: Replace this whole module with `aiExtractionApi` responses once the
// extraction endpoints exist. Every export here is consumed through
// `store/slices/aiFlowSlice.ts` only — no component imports it directly.

export const MEASURE_TYPES: MeasureType[] = [
  { id: "piles", label: "PILES", group: "foundations", icon: "Landmark" },
  { id: "pile-cap", label: "PILE CAP", group: "foundations", icon: "Anchor" },
  { id: "raft-foundation", label: "RAFT FOUND.", group: "foundations", icon: "Layers" },
  { id: "strip-foundation", label: "STRIP FOUND.", group: "foundations", icon: "Milestone" },
  { id: "pad-footing", label: "PAD FOOTING", group: "foundations", icon: "Square" },
  { id: "ground-beam", label: "GROUND BEAM", group: "foundations", icon: "GitCommitHorizontal" },
  { id: "columns", label: "COLUMNS", group: "superstructure", icon: "Columns3" },
  { id: "beams", label: "BEAMS", group: "superstructure", icon: "Minus" },
  { id: "slabs", label: "SLABS", group: "superstructure", icon: "SquareStack" },
  { id: "shear-walls", label: "SHEAR WALLS", group: "superstructure", icon: "Grid2x2" },
  { id: "lift-walls", label: "LIFT WALLS", group: "superstructure", icon: "Frame" },
  { id: "stairs", label: "STAIRS", group: "superstructure", icon: "TrendingUp" },
  { id: "ramps", label: "RAMPS", group: "superstructure", icon: "Triangle" },
  { id: "blockwork", label: "BLOCKWORK", group: "superstructure", icon: "Blocks" },
  // Figma shows "STAIRS" twice in the superstructure grid; treated as a design
  // slip and mapped to DOORS to keep every tile addressable.
  { id: "doors", label: "DOORS", group: "superstructure", icon: "DoorOpen" },
  { id: "windows", label: "WINDOWS", group: "superstructure", icon: "AppWindow" },
  { id: "roof", label: "ROOF", group: "superstructure", icon: "Home" },
  { id: "swimming-pool", label: "SWIMMING POOL", group: "superstructure", icon: "Waves" },
];

export const DEFAULT_GLOBAL_PARAMETERS: GlobalParameters = {
  workingSpace: 300,
  blinding: 50,
  concreteCover: 50,
  soilType: "Sand/Gravel",
};

export const SOIL_TYPES = ["Sand/Gravel", "Clay", "Silt", "Rock", "Made Ground"];

export const MOCK_PROJECT_META: AiProjectMeta = {
  projectTitle: "PROPOSED RESIDENTIAL DEVELOPMENT",
  clientName: "OMOWUNMI FANIMOKUN",
  subject: "FANIMOKUN - LEKKI PENINSULA",
  siteRef: "EX-204-London",
  date: "OCT 24, 2024",
};

export const MOCK_PAGES: DrawingPageMeta[] = [
  { number: 1, status: "processed" },
  { number: 2, status: "processed" },
  { number: 3, status: "processed" },
  { number: 4, status: "review" },
  { number: 5, status: "current" },
  { number: 6, status: "pending" },
  { number: 7, status: "pending" },
  { number: 8, status: "pending" },
  { number: 9, status: "pending" },
];

export const EXTRACTION_STEPS: ExtractionStep[] = [
  {
    id: "scan",
    title: "Scanning Layout Pages",
    detail: "Detected 47 pile symbols across 12 grid pages.",
    status: "pending",
  },
  {
    id: "specs",
    title: "Extracting Pile Specifications",
    detail: "Found: 600mm Diameter | 10m Depth | +0.00 Cut-Off | Bored Piles Only",
    status: "pending",
  },
  {
    id: "match",
    title: "Cross-Page Matching",
    detail: "Matched 47 piles to reinforcement details from Page 6 (Pile Cap Section)",
    status: "pending",
  },
  {
    id: "rebar",
    title: "Extracting Reinforcement Details",
    detail: "Resolved 2,450 bars across 5 sizes (10mm – 25mm) from the bar schedule.",
    status: "pending",
  },
  {
    id: "quantities",
    title: "Calculating Quantities",
    detail: "Applying: Cover=50mm, Working Space=300mm, Blinding=50mm…",
    status: "pending",
  },
];

const rect = (length: number | null, width: number | null, depth: number | null) => ({
  shape: "Rectangle",
  length,
  width,
  depth,
  diameter: null,
});

export const MOCK_EXTRACTED_GROUPS: ExtractedGroup[] = [
  {
    measureTypeId: "pile-cap",
    title: "PILE CAPS",
    pageRange: "PAGES 1-3",
    elements: [
      { id: "PC-1", measureTypeId: "pile-cap", grid: "A/1", page: 1, source: "Pg1_Base", confidence: 98, status: "valid", dimensions: rect(2400, 2400, 800) },
      { id: "PC-2", measureTypeId: "pile-cap", grid: "B/1", page: 1, source: "Pg1_Base", confidence: 97, status: "valid", dimensions: rect(2400, 2400, 800) },
      { id: "PC-3", measureTypeId: "pile-cap", grid: "C/2", page: 2, source: "Pg2_Detail", confidence: 95, status: "valid", dimensions: rect(1800, 1800, 600) },
      { id: "PC-4", measureTypeId: "pile-cap", grid: "D/3", page: 2, source: "Pg2_Detail", confidence: 65, status: "review", dimensions: rect(3200, 3200, null), note: "Pending (Depth missing)" },
      { id: "PC-5", measureTypeId: "pile-cap", grid: "A/4", page: 3, source: "Pg3_Plan", confidence: 96, status: "valid", dimensions: rect(2400, 2400, 800) },
      { id: "PC-6", measureTypeId: "pile-cap", grid: "B/4", page: 3, source: "Pg3_Plan", confidence: 99, status: "valid", dimensions: rect(2400, 2400, 800) },
      { id: "PC-7", measureTypeId: "pile-cap", grid: "C/4", page: 3, source: "Pg3_Plan", confidence: 92, status: "valid", dimensions: rect(1800, 1800, 600) },
      { id: "PC-8", measureTypeId: "pile-cap", grid: "D/4", page: 3, source: "Pg3_Plan", confidence: 94, status: "valid", dimensions: rect(1800, 1800, 600) },
    ],
  },
  {
    measureTypeId: "ground-beam",
    title: "GROUND BEAMS",
    pageRange: "PAGES 1-2",
    elements: [
      { id: "GB-1", measureTypeId: "ground-beam", grid: "Grid 1", page: 1, source: "Pg1_Base", confidence: 98, status: "valid", dimensions: rect(4500, 300, 600) },
      { id: "GB-2", measureTypeId: "ground-beam", grid: "Grid 2", page: 1, source: "Pg1_Base", confidence: 97, status: "valid", dimensions: rect(4500, 300, 600) },
      { id: "GB-3", measureTypeId: "ground-beam", grid: "Grid A", page: 2, source: "Pg2_Detail", confidence: 95, status: "valid", dimensions: rect(6000, 300, 600) },
      { id: "GB-4", measureTypeId: "ground-beam", grid: "Grid B", page: 2, source: "Pg2_Detail", confidence: 96, status: "valid", dimensions: rect(6000, 300, 600) },
      { id: "GB-5", measureTypeId: "ground-beam", grid: "Grid C", page: 2, source: "Pg2_Detail", confidence: 93, status: "valid", dimensions: rect(3000, 300, 600) },
      { id: "GB-6", measureTypeId: "ground-beam", grid: "Grid D", page: 2, source: "Pg2_Detail", confidence: 94, status: "valid", dimensions: rect(3000, 300, 600) },
    ],
  },
];

export const MOCK_BOQ_SECTIONS: BoqSection[] = [
  {
    id: "foundations",
    title: "FOUNDATIONS",
    itemLabel: "ITEM DESCRIPTION",
    items: [
      { id: "f-piles", label: "PILES (600mm Bored)", qty: 47, unit: "Nos.", rate: null, concrete: 133.01, rebar: 17106.08, formwork: 0, excavation: 230.7 },
      { id: "f-pilecaps", label: "PILE CAPS (PC1 + PC2)", qty: 8, unit: "Nos.", rate: null, concrete: 52.9, rebar: 7896.08, formwork: 96.64, excavation: 83.6 },
      { id: "f-groundbeams", label: "GROUND BEAMS (GB1 + GB2)", qty: 13, unit: "Nos.", rate: null, concrete: 68.2, rebar: 5858.06, formwork: 116.64, excavation: 142.8 },
      { id: "f-strip", label: "STRIP FOOTINGS", qty: 9, unit: "Nos.", rate: null, concrete: 23.14, rebar: 1068.87, formwork: 44.28, excavation: 69.76 },
    ],
  },
  {
    id: "columns",
    title: "COLUMNS",
    count: "(24 NOS)",
    itemLabel: "ITEM",
    descriptorLabel: "SHAPE",
    items: [
      { id: "c1", label: "C1", descriptor: "Rectangular", qty: 8, unit: "Nos.", rate: null, concrete: 18.43, rebar: 2304.4, formwork: 61.44, excavation: null },
      { id: "c2", label: "C2", descriptor: "Rectangular", qty: 10, unit: "Nos.", rate: null, concrete: 17.28, rebar: 2160.0, formwork: 64.8, excavation: null },
      { id: "c3", label: "C3", descriptor: "Circular", qty: 6, unit: "Nos.", rate: null, concrete: 8.48, rebar: 1060.0, formwork: 33.93, excavation: null },
    ],
  },
  {
    id: "beams",
    title: "BEAMS",
    count: "(18 NOS)",
    itemLabel: "ITEM",
    descriptorLabel: "DIMENSION",
    items: [
      { id: "b1", label: "B1", descriptor: "450x600", qty: 6, unit: "Nos.", rate: null, concrete: 12.15, rebar: 1701.0, formwork: 47.25, excavation: null },
      { id: "b2", label: "B2", descriptor: "300x750", qty: 8, unit: "Nos.", rate: null, concrete: 13.5, rebar: 1890.0, formwork: 57.6, excavation: null },
      { id: "b3", label: "B3", descriptor: "300x600", qty: 4, unit: "Nos.", rate: null, concrete: 5.4, rebar: 756.0, formwork: 21.6, excavation: null },
    ],
  },
  {
    id: "slabs",
    title: "SLABS",
    count: "(12 NOS)",
    itemLabel: "ITEM",
    descriptorLabel: "DIMENSION",
    items: [
      { id: "s1", label: "S1", descriptor: "One-way", qty: 6, unit: "Nos.", rate: null, concrete: 43.2, rebar: 3456.0, formwork: 288.0, excavation: null },
      { id: "s2", label: "S2", descriptor: "Two-way", qty: 4, unit: "Nos.", rate: null, concrete: 32.0, rebar: 2880.0, formwork: 200.0, excavation: null },
      { id: "s3", label: "S3", descriptor: "Flat", qty: 2, unit: "Nos.", rate: null, concrete: 18.0, rebar: 1620.0, formwork: 100.0, excavation: null },
    ],
  },
  {
    id: "stairs",
    title: "STAIRS",
    count: "(3 SETS)",
    itemLabel: "ITEM",
    items: [
      { id: "st1", label: "Stair Type A", qty: 3, unit: "Sets", rate: null, concrete: 9.72, rebar: 1263.6, formwork: 38.88, excavation: null },
    ],
  },
];

export const CONTINGENCY_PCT = 5;
export const VAT_PCT = 7.5;

export const MOCK_CONCRETE_SCHEDULE: ConcreteScheduleRow[] = [
  { id: "cs-piles", description: "Piles", grade: "C30", qty: 133.01, wastagePct: 2, unitCost: null },
  { id: "cs-pilecaps", description: "Pile Caps", grade: "C25", qty: 52.9, wastagePct: 2, unitCost: null },
  { id: "cs-groundbeams", description: "Ground Beams", grade: "C25", qty: 68.2, wastagePct: 2, unitCost: null },
  { id: "cs-strip", description: "Strip Footings", grade: "C25", qty: 23.14, wastagePct: 2, unitCost: null },
];

export const MOCK_REBAR_SCHEDULE: RebarScheduleRow[] = [
  { id: "rs-25", barSize: "25mm", qty: 4850, wastagePct: 3, unitCost: null },
  { id: "rs-20", barSize: "20mm", qty: 7230, wastagePct: 3, unitCost: null },
  { id: "rs-16", barSize: "16mm", qty: 8950, wastagePct: 3, unitCost: null },
  { id: "rs-12", barSize: "12mm", qty: 4120, wastagePct: 3, unitCost: null },
  { id: "rs-10", barSize: "10mm", qty: 6775, wastagePct: 3, unitCost: null },
];

export const MOCK_FORMWORK_MATERIAL: FormworkMaterialRow[] = [
  { id: "fm-pilecaps", element: "Pile Caps", qty: 96.64, type: "Plywood", area: 96.64, unitCost: null },
  { id: "fm-groundbeams", element: "Ground Beams", qty: 116.64, type: "Plywood", area: 116.64, unitCost: null },
  { id: "fm-strip", element: "Strip Footings", qty: 44.28, type: "Plywood", area: 44.28, unitCost: null },
];

export const MOCK_BLINDING_VOLUME = 5.1;

export const MOCK_BBS_GROUPS: BbsGroup[] = [
  {
    id: "bbs-pilecaps",
    title: "PILE CAPS - BBS",
    rows: [
      { id: "PC1-M1", barMark: "PC1-M1", size: 25, noBars: 48, cutLength: 2.8, weight: 517.44, shapeCode: "37" },
      { id: "PC1-M2", barMark: "PC1-M2", size: 16, noBars: 144, cutLength: 1.8, weight: 409.54, shapeCode: "11" },
      { id: "PC1-L1", barMark: "PC1-L1", size: 10, noBars: 288, cutLength: 1.6, weight: 285.69, shapeCode: "22" },
      { id: "PC2-M1", barMark: "PC2-M1", size: 25, noBars: 30, cutLength: 3.4, weight: 392.7, shapeCode: "37" },
    ],
  },
  {
    id: "bbs-groundbeams",
    title: "GROUND BEAMS - BBS",
    tags: ["GB1", "GB2", "GB3"],
    rows: [
      { id: "GB1-T1", barMark: "GB1-T1", size: 20, noBars: 36, cutLength: 4.8, weight: 426.82, shapeCode: "11" },
      { id: "GB1-B1", barMark: "GB1-B1", size: 20, noBars: 36, cutLength: 4.8, weight: 426.82, shapeCode: "11" },
      { id: "GB2-L1", barMark: "GB2-L1", size: 12, noBars: 210, cutLength: 1.65, weight: 308.39, shapeCode: "51" },
      { id: "GB3-T1", barMark: "GB3-T1", size: 16, noBars: 48, cutLength: 6.3, weight: 477.79, shapeCode: "11" },
    ],
  },
];

export const MOCK_FORMWORK_BREAKDOWN: FormworkBreakdownRow[] = [
  { id: "fb-pilecaps", element: "PILE CAPS (PC1 + PC2)", type: "Sides Only", area: 96.64, plywoodSheets: 105, timber: 6.5, steelProps: 180, strikingTime: "3 Days" },
  { id: "fb-groundbeams", element: "GROUND BEAMS (GB1 + GB2)", type: "Sides Only", area: 116.64, plywoodSheets: 125, timber: 8.0, steelProps: 210, strikingTime: "3 Days" },
  { id: "fb-strip", element: "STRIP FOOTINGS", type: "Sides Only", area: 44.28, plywoodSheets: 45, timber: 3.5, steelProps: 60, strikingTime: "2 Days" },
];
