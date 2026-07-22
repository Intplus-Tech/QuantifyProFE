import type { ComponentType } from "react";
import { Type, Undo2, Redo2 } from "lucide-react";
import type { DrawingCategory } from "@/store/slices/manualWizardSlice";
import type { ToolId, ElementConcreteConfig, ConcreteRowDef } from "./types";

export const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export const PALETTE_LABELS: Record<string, string> = {
  "#ef4444": "Red",
  "#f97316": "Orange",
  "#eab308": "Yellow",
  "#22c55e": "Green",
  "#3b82f6": "Blue",
  "#8b5cf6": "Purple",
  "#ec4899": "Pink",
  "#64748b": "Slate",
};

export const TOOLS: {
  id: ToolId;
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
}[] = [
  { id: "text", icon: Type, label: "Text", description: "Add text annotations to the drawing" },
  { id: "undo", icon: Undo2, label: "Undo", description: "Undo the last action" },
  { id: "redo", icon: Redo2, label: "Redo", description: "Redo the last undone action" },
];

export const BAR_SIZE_OPTIONS = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25", "Y32"];

// The real length measured on the drawing for a Lintel always gets this added
// on top before it's used as the BOQ quantity (door opening + bearing on each side).
export const LINTEL_LENGTH_BONUS_M = 0.3;

// ─── "What do you want to measure?" category list ──────────────────────────────
// Each category drives which canvas tool auto-activates (see ELEMENT_CONFIGS below).
// "Stud Column / Column in Foundation" and "Columns" are dual-mode: the user picks
// Count or Area right after choosing the category.

export const SCALE_MEASURE_OPTIONS = [
  "Piles",
  "Pile Cap",
  "Ground Beam / Raft",
  "Column Base / Pad",
  "Stud Column / Column in Foundation",
  "Ground Floor Slab",
  "Blockwork on Foundation",
  "Columns",
  "Floor Beams",
  "Staircase",
  "Upper Floor Slab",
  "Lintel",
  "Blockwork",
  "Roof",
  "Windows",
  "Doors",
  "Floor Finishes",
  "Wall Finishes",
  "Ceiling Finishes",
];

const countLWH: ConcreteRowDef[] = [
  {
    fields: [
      { key: "length", label: "Length (m)", defaultValue: "0" },
      { key: "width", label: "Width (m)", defaultValue: "0" },
    ],
  },
  { fields: [{ key: "height", label: "Height (m)", defaultValue: "0" }] },
];

const areaHeightOnly: ConcreteRowDef[] = [
  { fields: [{ key: "height", label: "Height (m)", defaultValue: "0" }] },
];

export const ELEMENT_CONFIGS: Record<string, ElementConcreteConfig> = {
  Piles: {
    tool: "count",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pile as:",
    tagPlaceholder: "e.g. P1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "shape", label: "Shape", defaultValue: "Circular", type: "select", options: ["Circular", "Square", "Rectangular"] },
          { key: "depth", label: "Depth (m)", defaultValue: "0" },
        ],
      },
      {
        fields: [
          { key: "diameter", label: "Diameter (m)", defaultValue: "0" },
          { key: "plasticizers", label: "Plasticizers", defaultValue: "0" },
        ],
      },
    ],
  },
  "Pile Cap": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pile Cap as:",
    tagPlaceholder: "e.g. PC1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Ground Beam / Raft": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this beam as:",
    tagPlaceholder: "e.g. BM1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0" },
          { key: "depth", label: "Depth (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  "Column Base / Pad": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Base as:",
    tagPlaceholder: "e.g. PD1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Stud Column / Column in Foundation": {
    tool: "choice",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Column as:",
    tagPlaceholder: "e.g. SC1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: countLWH,
    rowsByChoice: { count: countLWH, area: areaHeightOnly },
  },
  "Ground Floor Slab": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. GFS1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Blockwork on Foundation": {
    tool: "length",
    sectionHeader: "BLOCKWORK (FROM MEASUREMENT)",
    tagLabel: "Tag this run as:",
    tagPlaceholder: "e.g. BW-F1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "height", label: "Height (m)", defaultValue: "0" }] }],
  },
  Columns: {
    tool: "choice",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Column as:",
    tagPlaceholder: "e.g. C1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: countLWH,
    rowsByChoice: { count: countLWH, area: areaHeightOnly },
  },
  "Floor Beams": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this beam as:",
    tagPlaceholder: "e.g. FB1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0" },
          { key: "depth", label: "Depth (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  Staircase: {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Staircase as:",
    tagPlaceholder: "e.g. ST1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [],
  },
  "Upper Floor Slab": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. UFS1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  Lintel: {
    tool: "length",
    sectionHeader: "LINTEL (FROM MEASUREMENT)",
    tagLabel: "Tag this Lintel as:",
    tagPlaceholder: "e.g. L1",
    measureLabel: "Length (door opening + 300mm)",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [],
  },
  Blockwork: {
    tool: "length",
    sectionHeader: "BLOCKWORK (FROM MEASUREMENT)",
    tagLabel: "Tag this run as:",
    tagPlaceholder: "e.g. BW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "height", label: "Height (m)", defaultValue: "0" }] }],
  },
  Roof: {
    tool: "length",
    sectionHeader: "ROOF (FROM MEASUREMENT)",
    tagLabel: "Tag this run as:",
    tagPlaceholder: "e.g. RF1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [],
  },
  Windows: {
    tool: "count",
    sectionHeader: "WINDOWS (FROM MEASUREMENT)",
    tagLabel: "Tag this Window as:",
    tagPlaceholder: "e.g. W1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  Doors: {
    tool: "count",
    sectionHeader: "DOORS (FROM MEASUREMENT)",
    tagLabel: "Tag this Door as:",
    tagPlaceholder: "e.g. D1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  "Floor Finishes": {
    tool: "area",
    sectionHeader: "FINISHES (FROM MEASUREMENT)",
    tagLabel: "Tag this area as:",
    tagPlaceholder: "e.g. FF1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [],
  },
  "Wall Finishes": {
    tool: "length",
    sectionHeader: "FINISHES (FROM MEASUREMENT)",
    tagLabel: "Tag this run as:",
    tagPlaceholder: "e.g. WF1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "height", label: "Height (m)", defaultValue: "0" }] }],
  },
  "Ceiling Finishes": {
    tool: "area",
    sectionHeader: "FINISHES (FROM MEASUREMENT)",
    tagLabel: "Tag this area as:",
    tagPlaceholder: "e.g. CF1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [],
  },
};

export const MOCK_EXISTING_ELEMENTS = [
  { id: "pile", name: "Pile", path: "Substructure / Piles", count: 15 },
  { id: "pilecaps", name: "Pile Caps", path: "Substructure / Pile Caps", count: 16 },
];

export const ACCEPTED_EXTENSIONS = [
  ".pdf", ".jpg", ".jpeg", ".png",
  ".rvt", ".ifc", ".nwd", ".skp", ".fbx", ".obj",
  ".dwg", ".dxf", ".dgn",
];

export type ViewerType = "pdf" | "image" | "ifc" | "dxf" | "three" | "unsupported";

export const VIEWER_MAP: Record<string, ViewerType> = {
  ".pdf":  "pdf",
  ".jpg":  "image",
  ".jpeg": "image",
  ".png":  "image",
  ".ifc":  "ifc",
  ".dxf":  "dxf",
  ".fbx":  "three",
  ".obj":  "three",
  ".stl":  "three",
  ".ply":  "three",
  ".dae":  "three",
  // Proprietary formats — no free client-side viewer available
  ".rvt":  "unsupported",
  ".nwd":  "unsupported",
  ".skp":  "unsupported",
  ".dwg":  "unsupported",
  ".dgn":  "unsupported",
};

export const EXT_CATEGORY: Record<string, DrawingCategory> = {
  ".pdf": "pdf",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".rvt": "bim-3d",
  ".ifc": "bim-3d",
  ".nwd": "bim-3d",
  ".skp": "bim-3d",
  ".fbx": "bim-3d",
  ".obj": "bim-3d",
  ".dwg": "cad-2d",
  ".dxf": "cad-2d",
  ".dgn": "cad-2d",
};
