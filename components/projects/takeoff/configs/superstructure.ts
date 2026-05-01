/**
 * Superstructure Takeoff Configurations
 * ─────────────────────────────────────────────────────────────────────────────
 * Add a new `if` block for each item slug under the "superstructure" section.
 * The item slug comes from the URL: /takeoff/superstructure/[item]
 *
 * Items to configure (routes already registered in ProjectWorkspaceLayout.tsx):
 *  • column       → Column
 *  • floor-beam   → Floor & Beam
 *  • shear-wall   → Shear Wall
 *  • stairs       → Stairs          (shown when numberOfFloors > 0)
 *  • lift-shaft   → Lift Shaft      (shown when hasLift)
 *  • swimming-pool → Swimming Pool  (shown when hasPool)
 *
 * ─── HOW TO ADD A NEW ITEM ────────────────────────────────────────────────────
 *
 * Copy this pattern and paste it inside the function:
 *
 *   if (item === "your-item-slug") {
 *     return {
 *       tabs: [
 *         {
 *           id: "unique-tab-id",
 *           label: "Tab Label",          // shown on the top nav tab
 *           title: "Section Title",      // shown in the content header
 *           subtitle: "Short description.",
 *           icon: PenTool,               // any lucide-react icon
 *
 *           // ── Simple flat table (no sub-tabs) ──
 *           columns: [
 *             { key: "id", label: "ID", readonly: true },
 *             { key: "length", label: "Length (m)", highlight: true },
 *           ],
 *           defaultRows: [{ id: "ITEM1" }],
 *
 *           // ── OR: sub-tabs (Concrete & Formwork + Reinforcement) ──
 *           subTabs: [
 *             {
 *               id: "concrete-formwork",
 *               label: "Concrete & Formwork",
 *               columns: [ ... ],
 *               defaultRows: [ ... ],
 *             },
 *             {
 *               id: "reinforcement",
 *               label: "Reinforcement",
 *               hasBendingSummary: true,          // adds Bending Summary button
 *               groupedBy: "concrete-formwork",   // one table per parent row
 *               groupLabelPrefix: "COLUMN",
 *               groupIdPrefix: "COL",
 *               columns: [
 *                 { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
 *                 // multiInput: true → 4 small boxes per cell, collapses to "v1 - v2 - v3 - v4"
 *               ],
 *               defaultRows: [],
 *             },
 *           ],
 *         },
 *       ],
 *     };
 *   }
 *
 * See configs/types.ts for the full type definitions and field descriptions.
 * See configs/substructure.ts for real-world examples.
 */

import { PenTool, Settings2 } from "lucide-react";
import type { TakeoffConfig } from "./types";

export function getSuperstructureConfig(item: string): TakeoffConfig | null {
  // ── Column ────────────────────────────────────────────────────────────────
  // TODO: implement
  if (item === "column") {
    return {
      tabs: [
        {
          id: "column-concrete",
          label: "Column (Concrete)",
          title: "Column (Concrete)",
          subtitle: "Enter column concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "column",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Height (m)", highlight: true },
              ],
              defaultRows: [{ id: "COL1", shape: "rectangular" }],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              columns: [
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "COLUMN",
              groupIdPrefix: "COL",
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Floor & Beam ──────────────────────────────────────────────────────────
  // TODO: implement
  if (item === "floor-beam") {
    return {
      tabs: [
        {
          id: "floor-beam-concrete",
          label: "Floor & Beam (Concrete)",
          title: "Floor & Beam (Concrete)",
          subtitle: "Enter floor and beam specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "beam",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
              ],
              defaultRows: [{ id: "FB1", shape: "rectangular" }],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              columns: [
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "FLOOR/BEAM",
              groupIdPrefix: "FB",
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Shear Wall ────────────────────────────────────────────────────────────
  // TODO: implement
  if (item === "shear-wall") {
    return {
      tabs: [
        {
          id: "shear-wall-concrete",
          label: "Shear Wall (Concrete)",
          title: "Shear Wall (Concrete)",
          subtitle: "Enter shear wall specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "shear_wall",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "height", label: "Height (m)", highlight: true },
                { key: "thickness", label: "Thickness (m)", highlight: true },
              ],
              defaultRows: [{ id: "SW1", shape: "rectangular" }],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              columns: [
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "SHEAR WALL",
              groupIdPrefix: "SW",
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Stairs ────────────────────────────────────────────────────────────────
  // TODO: implement
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
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "noRisers", label: "No. of Risers", highlight: true },
            { key: "riserHeight", label: "Riser Height (m)", highlight: true },
            { key: "treadWidth", label: "Tread Width (m)", highlight: true },
            { key: "flightWidth", label: "Flight Width (m)", highlight: true },
          ],
          defaultRows: [{ id: "STR1", shape: "rectangular" }],
        },
      ],
    };
  }

  // ── Lift Shaft ────────────────────────────────────────────────────────────
  // TODO: implement
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
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
            { key: "thickness", label: "Wall Thickness (m)", highlight: true },
          ],
          defaultRows: [{ id: "LS1", shape: "rectangular" }],
        },
      ],
    };
  }

  // ── Swimming Pool ─────────────────────────────────────────────────────────
  // TODO: implement
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
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "depth", label: "Depth (m)", highlight: true },
            { key: "wallThickness", label: "Wall Thickness (m)", highlight: true },
          ],
          defaultRows: [{ id: "POOL1", shape: "rectangular" }],
        },
      ],
    };
  }

  return null;
}
