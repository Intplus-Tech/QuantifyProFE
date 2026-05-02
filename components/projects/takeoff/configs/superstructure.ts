/**
 * Superstructure Takeoff Configurations
 * ─────────────────────────────────────────────────────────────────────────────
 * Add a new `if` block for each item slug under the "superstructure" section.
 * The item slug comes from the URL: /takeoff/superstructure/[item]
 */

import { PenTool, Settings2 } from "lucide-react";
import type { TakeoffConfig, TakeoffSubTab } from "./types";

/**
 * Standard Reinforcement Sub-Tab template
 */
const getReinforcementSubTab = (groupedBy: string, groupLabelPrefix: string, groupIdPrefix: string, elementType: string): TakeoffSubTab => ({
  id: "reinforcement",
  label: "Reinforcement",
  elementType,
  columns: [
    { key: "id", label: "ID", readonly: true },
    { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
    { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
    { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
    { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
    { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
  ],
  hasBendingSummary: true,
  groupedBy,
  groupLabelPrefix,
  groupIdPrefix,
  singleTable: true,
  defaultRows: [],
});

/**
 * Generates the common structural member sub-tabs for each floor level.
 */
const getFloorMemberSubTabs = (): TakeoffSubTab[] => [
  {
    id: "beam",
    label: "Beam",
    subTabs: [
      {
        id: "concrete-formwork",
        label: "Concrete & Formwork",
        elementType: "beam",
        columns: [
          { key: "id", label: "ID", readonly: true },
          { key: "noThus", label: "No. Thus", highlight: true },
          { key: "length", label: "Length (m)", highlight: true },
          { key: "width", label: "Width (m)", highlight: true },
          { key: "thickness", label: "Thickness", highlight: true },
        ],
        defaultRows: [{ id: "BM1" }, { id: "BM2" }, { id: "BM3" }],
      },
      getReinforcementSubTab("concrete-formwork", "BEAM", "BM", "beam"),
    ],
  },
  {
    id: "upper-floor",
    label: "Upper Floor",
    subTabs: [
      {
        id: "concrete-formwork",
        label: "Concrete & Formwork",
        elementType: "floor",
        columns: [
          { key: "id", label: "ID", readonly: true },
          { key: "noThus", label: "No. Thus", highlight: true },
          { key: "length", label: "Length (m)", highlight: true },
          { key: "width", label: "Width (m)", highlight: true },
          { key: "thickness", label: "Thickness", highlight: true },
        ],
        defaultRows: [{ id: "CF1" }, { id: "CF2" }, { id: "CF3" }],
      },
      getReinforcementSubTab("concrete-formwork", "UPPER FLOOR", "UF", "floor"),
      {
        id: "after-stairs-void-ddt",
        label: "After stairs_Void_ddt",
        elementType: "void_ddt",
        columns: [
          { key: "id", label: "ID", readonly: true },
          { key: "fillingThickness", label: "Filling Thickness", highlight: true },
          { key: "noThus", label: "No Thus", highlight: true },
          { key: "length", label: "Length (m)", highlight: true },
          { key: "width", label: "Width (m)", highlight: true },
          { key: "thickness", label: "Thickness (m)", highlight: true },
        ],
        defaultRows: [{ id: "VOID1" }],
      },
    ],
  },
  {
    id: "upper-floors-ddt-stairs",
    label: "Upper Floors (Ddt / Stairs)",
    subTabs: [
      {
        id: "concrete-formwork",
        label: "Concrete & Formwork",
        elementType: "stair_ddt",
        columns: [
          { key: "id", label: "ID", readonly: true },
          { key: "noThus", label: "No. Thus", highlight: true },
          { key: "length", label: "Length (m)", highlight: true },
          { key: "width", label: "Width (m)", highlight: true },
          { key: "thickness", label: "Thickness", highlight: true },
        ],
        defaultRows: [{ id: "CF1" }, { id: "CF2" }, { id: "CF3" }],
      },
      getReinforcementSubTab("concrete-formwork", "STAIRS DDT", "SD", "stair_ddt"),
    ],
  },
];

export function getSuperstructureConfig(item: string): TakeoffConfig | null {
  const levels = [
    "Column In Foundation",
    "Messlin Floor",
    "Ground Floor",
    "First Floor",
    "Second Floor",
    "Third Floor",
  ];

  // ── Column ────────────────────────────────────────────────────────────────
  if (item === "column") {
    return {
      tabs: levels.map((level) => ({
        id: level.toLowerCase().replace(/ /g, "-"),
        label: level,
        title: level,
        subtitle: `Enter column specifications for ${level}. All calculations automated.`,
        icon: Settings2,
        subTabs: [
          {
            id: "concrete-formwork",
            label: "Concrete & Formwork",
            elementType: "column",
            columns: [
              { key: "id", label: "ID", readonly: true },
              {
                key: "shape",
                label: "Shape",
                type: "select",
                options: ["Rectangular", "Circular"],
              },
              {
                key: "state",
                label: "State",
                type: "select",
                options: ["Isolated", "-"],
              },
              { key: "count", label: "No. Thus", highlight: true },
              { key: "length", label: "Length/Radius (m)", highlight: true },
              { key: "width", label: "Width (m)", highlight: true },
              { key: "depth", label: "Height (m)", highlight: true },
            ],
            defaultRows: [{ id: "CT1", shape: "Rectangular", state: "Isolated" }],
          },
          getReinforcementSubTab("concrete-formwork", "COLUMN", "CT", "column"),
        ],
      })),
    };
  }

  // ── Floor & Beam ──────────────────────────────────────────────────────────
  if (item === "floor-beam") {
    return {
      tabs: levels.slice(1).map((level) => ({
        id: level.toLowerCase().replace(/ /g, "-"),
        label: level,
        title: level,
        subtitle: `Enter floor and beam specifications for ${level}.`,
        icon: PenTool,
        subTabs: getFloorMemberSubTabs(),
      })),
    };
  }

  // ── Shear Wall ────────────────────────────────────────────────────────────
  if (item === "shear-wall") {
    return {
      tabs: levels.slice(1).map((level) => ({
        id: level.toLowerCase().replace(/ /g, "-"),
        label: level,
        title: `Shear Wall - ${level}`,
        subtitle: "Enter shear wall specifications. All calculations automated.",
        icon: PenTool,
        subTabs: [
          {
            id: "concrete-formwork",
            label: "Concrete & Formwork",
            elementType: "shear_wall",
            columns: [
              { key: "id", label: "ID", readonly: true },
              { key: "count", label: "No. Thus", highlight: true },
              { key: "length", label: "Length (m)", highlight: true },
              { key: "height", label: "Height (m)", highlight: true },
              { key: "thickness", label: "Thickness (m)", highlight: true },
            ],
            defaultRows: [{ id: "SW1" }],
          },
          getReinforcementSubTab("concrete-formwork", "SHEAR WALL", "SW", "shear_wall"),
        ],
      })),
    };
  }

  // ── Stairs ────────────────────────────────────────────────────────────────
  if (item === "stairs") {
    return {
      tabs: [
        {
          id: "stairs-concrete",
          label: "Stairs (Concrete)",
          title: "Stairs (Concrete)",
          subtitle: "Enter stair specifications. All calculations automated.",
          icon: PenTool,
          elementType: "staircase",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "noRisers", label: "No. of Risers", highlight: true },
            { key: "riserHeight", label: "Riser Height (m)", highlight: true },
            { key: "treadWidth", label: "Tread Width (m)", highlight: true },
            { key: "flightWidth", label: "Flight Width (m)", highlight: true },
          ],
          defaultRows: [{ id: "STR1" }],
        },
      ],
    };
  }

  // ── Lift Shaft ────────────────────────────────────────────────────────────
  if (item === "lift-shaft") {
    return {
      tabs: [
        {
          id: "lift-shaft-concrete",
          label: "Lift Shaft (Concrete)",
          title: "Lift Shaft (Concrete)",
          subtitle: "Enter lift shaft specifications. All calculations automated.",
          icon: Settings2,
          elementType: "lift_wall",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "noThus", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
            { key: "wallThickness", label: "Wall Thickness (m)", highlight: true },
          ],
          defaultRows: [{ id: "LS1" }],
        },
      ],
    };
  }

  // ── Swimming Pool ─────────────────────────────────────────────────────────
  if (item === "swimming-pool") {
    return {
      tabs: [
        {
          id: "pool-concrete",
          label: "Pool (Concrete)",
          title: "Swimming Pool (Concrete)",
          subtitle: "Enter pool specifications. All calculations automated.",
          icon: Settings2,
          elementType: "swimming_pool",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "noThus", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "depth", label: "Depth (m)", highlight: true },
            { key: "wallThickness", label: "Wall Thickness (m)", highlight: true },
          ],
          defaultRows: [{ id: "POOL1" }],
        },
      ],
    };
  }

  return null;
}
