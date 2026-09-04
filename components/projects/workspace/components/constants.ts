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
  // Substructure
  "Piles",
  "Pile Cap",
  "Pile Cap Frames",
  "Ground Beam / Raft",
  "Strip Foundation",
  "Raft Foundation",
  "Column Base / Pad",
  "Column Footing",
  "Stud Column / Column in Foundation",
  "Ground Floor Slab",
  "Oversite Slab",
  "Water Slab",
  "Blockwork on Foundation",
  "Excavation Clearing",
  "Swimming Pool",
  // Superstructure
  "Columns",
  "Roof Column",
  "Floor Beams",
  "Shear Wall",
  "Lift Wall",
  "Lift Shaft",
  "Staircase",
  "Staircase Landing",
  "Staircase Strings & Steps",
  "Staircase Upper Floors",
  "Upper Floor Slab",
  "Roof Slab",
  "Parapet Wall",
  "Parapet Wall Coping",
  "Lintel",
  "Blockwork",
  "Roof",
  // Openings
  "Windows",
  "Doors",
  // Finishes & Fittings
  "Floor Finishes",
  "Wall Finishes",
  "Ceiling Finishes",
  "Kitchen Countertop",
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

export const WALL_TYPE_OPTIONS = ["100mm", "150mm", "225mm"];

const blockworkRows: ConcreteRowDef[] = [
  {
    fields: [
      { key: "height", label: "Height (m)", defaultValue: "0" },
      {
        key: "wallType",
        label: "Wall Type",
        type: "select",
        defaultValue: WALL_TYPE_OPTIONS[0],
        options: WALL_TYPE_OPTIONS,
      },
    ],
  },
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
          { key: "plasticizers", label: "Plasticizers", defaultValue: "false", type: "checkbox" },
        ],
      },
    ],
  },
  "Pile Cap": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pile cap as:",
    tagPlaceholder: "e.g. PC01",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "depth", label: "Depth (m)", defaultValue: "0" },
          {
            key: "count",
            label: "Quantity (Identical Caps)",
            defaultValue: "1",
          },
        ],
      },
    ],
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
    blockworkSides: true,
    sectionHeader: "BLOCKWORK",
    tagLabel: "Tag this Blockwork as:",
    tagPlaceholder: "e.g. BW-F1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: blockworkRows,
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
    blockworkSides: true,
    sectionHeader: "BLOCKWORK",
    tagLabel: "Tag this Blockwork as:",
    tagPlaceholder: "e.g. BW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: blockworkRows,
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

  // ── Added to close the gap between this picker and the backend's element-type
  // catalogue (see toBackendElementType in ProjectWorkspaceView.tsx, which already
  // mapped every one of these) ─────────────────────────────────────────────────

  "Pile Cap Frames": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this frame as:",
    tagPlaceholder: "e.g. PCF1",
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
  "Strip Foundation": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this strip as:",
    tagPlaceholder: "e.g. SF1",
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
  "Raft Foundation": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Raft as:",
    tagPlaceholder: "e.g. RF1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Column Footing": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Footing as:",
    tagPlaceholder: "e.g. CF1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Oversite Slab": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. OS1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Water Slab": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. WS1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Excavation Clearing": {
    tool: "area",
    sectionHeader: "EXCAVATION (FROM MEASUREMENT)",
    tagLabel: "Tag this area as:",
    tagPlaceholder: "e.g. EC1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [],
  },
  "Swimming Pool": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pool as:",
    tagPlaceholder: "e.g. SP1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "depth", label: "Depth (m)", defaultValue: "0" }] }],
  },
  "Roof Column": {
    tool: "choice",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Column as:",
    tagPlaceholder: "e.g. RC1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "0",
    rows: countLWH,
    rowsByChoice: { count: countLWH, area: areaHeightOnly },
  },
  "Shear Wall": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Wall as:",
    tagPlaceholder: "e.g. SW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "thickness", label: "Thickness (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  "Lift Wall": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Wall as:",
    tagPlaceholder: "e.g. LW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "thickness", label: "Thickness (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  "Lift Shaft": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Shaft as:",
    tagPlaceholder: "e.g. LS1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
      { fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] },
    ],
  },
  "Staircase Landing": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Landing as:",
    tagPlaceholder: "e.g. SL1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Staircase Strings & Steps": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Flight as:",
    tagPlaceholder: "e.g. SS1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [],
  },
  "Staircase Upper Floors": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Flight as:",
    tagPlaceholder: "e.g. SUF1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [],
  },
  "Roof Slab": {
    tool: "area",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. RS1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
  },
  "Parapet Wall": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Wall as:",
    tagPlaceholder: "e.g. PW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "thickness", label: "Thickness (m)", defaultValue: "0" },
          { key: "height", label: "Height (m)", defaultValue: "0" },
        ],
      },
    ],
  },
  "Parapet Wall Coping": {
    tool: "length",
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Coping as:",
    tagPlaceholder: "e.g. PWC1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "width", label: "Width (m)", defaultValue: "0" }] }],
  },
  "Kitchen Countertop": {
    tool: "area",
    sectionHeader: "FITTINGS (FROM MEASUREMENT)",
    tagLabel: "Tag this Countertop as:",
    tagPlaceholder: "e.g. KC1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "0",
    rows: [{ fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "0" }] }],
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
