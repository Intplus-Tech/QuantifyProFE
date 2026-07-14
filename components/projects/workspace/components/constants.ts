import type { ComponentType } from "react";
import { Ruler, Pentagon, Hash, Type, Undo2, Redo2 } from "lucide-react";
import type { DrawingCategory } from "@/store/slices/manualWizardSlice";
import type { ToolId, ElementConcreteConfig } from "./types";

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

export const TOOLS: {
  id: ToolId;
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
}[] = [
  { id: "length", icon: Ruler, label: "Length", description: "Measure linear distances on the drawing" },
  { id: "area", icon: Pentagon, label: "Area", description: "Measure polygon areas on the drawing" },
  { id: "count", icon: Hash, label: "Count", description: "Count items and elements on the drawing" },
  { id: "text", icon: Type, label: "Text", description: "Add text annotations to the drawing" },
  { id: "undo", icon: Undo2, label: "Undo", description: "Undo the last action" },
  { id: "redo", icon: Redo2, label: "Redo", description: "Redo the last undone action" },
];

export const BAR_SIZE_OPTIONS = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25", "Y32"];

export const SCALE_MEASURE_OPTIONS = [
  "Pile",
  "Column in Foundation",
  "Ground Beam",
  "Strip",
  "Shear Wall",
  "Slabs",
  "Roof Beams",
  "Roof Slab",
  "Roof Upstands / Parapet",
  "Roof Gutter",
];

export const ELEMENT_CONFIGS: Record<string, ElementConcreteConfig> = {
  Pile: {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pile as:",
    tagPlaceholder: "e.g. P1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "18",
    rows: [
      {
        fields: [
          { key: "shape", label: "Shape", defaultValue: "Circular", type: "select", options: ["Circular", "Square", "Rectangular"] },
          { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
        ],
      },
      {
        fields: [
          { key: "diameter", label: "Diameter (m)", defaultValue: "0.6" },
          { key: "plasticizers", label: "Plasticizers", defaultValue: "1.2" },
        ],
      },
    ],
  },
  "Column in Foundation": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Column as:",
    tagPlaceholder: "e.g. C1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "12",
    rows: [
      {
        fields: [
          { key: "shape", label: "Shape", defaultValue: "Square", type: "select", options: ["Circular", "Square", "Rectangular"] },
          { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
        ],
      },
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0.30" },
          { key: "breadth", label: "Breadth (m)", defaultValue: "0.30" },
        ],
      },
    ],
  },
  "Ground Beam": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this beam as:",
    tagPlaceholder: "e.g. BM1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0.30" },
          { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
        ],
      },
      {
        fields: [
          { key: "quantity", label: "Quantity (identical Beams)", defaultValue: "1" },
        ],
      },
    ],
  },
  Strip: {
    sectionHeader: "CONCRETE FOOTING (FROM MEASUREMENT)",
    tagLabel: "Tag this Strip as:",
    tagPlaceholder: "e.g. #1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "18",
    rows: [
      {
        sectionLabel: "EXCAVATION",
        fields: [{ key: "excavationDepth", label: "Depth (m)", defaultValue: "18" }],
      },
      {
        sectionLabel: "BLOCKWORK",
        fields: [{ key: "blockworkHeight", label: "Height (m)", defaultValue: "18" }],
      },
    ],
  },
  "Shear Wall": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this wall as:",
    tagPlaceholder: "e.g. SW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "49.0",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "0.30" },
          { key: "height", label: "Height (m)", defaultValue: "1.2" },
        ],
      },
    ],
  },
  Slabs: {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. SBO1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "24.5",
    rows: [
      {
        fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "1.2" }],
      },
    ],
  },
  "Roof Beams": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Beam as:",
    tagPlaceholder: "e.g. RB",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "1.2" },
          { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
        ],
      },
    ],
  },
  "Roof Slab": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Slab as:",
    tagPlaceholder: "e.g. RS",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "24.5",
    rows: [
      {
        fields: [{ key: "thickness", label: "Thickness (m)", defaultValue: "1.2" }],
      },
    ],
  },
  "Roof Upstands / Parapet": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Upstands / Parapet as:",
    tagPlaceholder: "e.g. RUP",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      {
        fields: [
          { key: "height", label: "Height (m)", defaultValue: "1.2" },
          { key: "thickness", label: "Thickness (m)", defaultValue: "1.2" },
        ],
      },
    ],
  },
  "Roof Gutter": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Gutter as:",
    tagPlaceholder: "e.g. RG",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      {
        fields: [
          { key: "width", label: "Width (m)", defaultValue: "1.2" },
          { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
        ],
      },
    ],
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
