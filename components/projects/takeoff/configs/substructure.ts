/**
 * Substructure Takeoff Configurations
 * ─────────────────────────────────────────────────────────────────────────────
 * Add a new `if` block for each item slug under the "substructure" section.
 * The item slug comes from the URL: /takeoff/substructure/[item]
 *
 * Items currently configured:
 *  • foundation        → Pile Cap foundation (Excavation, Pad Concrete, etc.)
 *  • strip-foundation  → Strip Foundation + Blockwork
 *
 * To add a new item:
 *  1. Copy an existing `if` block below.
 *  2. Change the `item` slug to match the URL segment.
 *  3. Adjust tabs, columns, and defaultRows as needed.
 *  4. Add the route to ProjectWorkspaceLayout.tsx → substructureItems.
 */

import { PenTool, Settings2 } from "lucide-react";
import type { TakeoffConfig } from "./types";

export function getSubstructureConfig(item: string): TakeoffConfig | null {
  // ── Foundation (Pile Cap) ──────────────────────────────────────────────────
  if (item === "foundation") {
    return {
      tabs: [
        {
          id: "excavation-clearing",
          label: "Excavation & Clearing",
          title: "Clearing & Topsoil Excavation",
          subtitle: "Enter site clearing measurements. All calculations automated in backend.",
          icon: PenTool,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "areaRef", label: "AREA REFERENCE", highlight: true },
            { key: "noThus", label: "NO. THUS", highlight: true },
            { key: "length", label: "LENGTH (M)", highlight: true },
            { key: "width", label: "WIDTH (M)", highlight: true },
            { key: "depth", label: "DEPTH (M)", highlight: true },
          ],
          defaultRows: [{ id: "CL1" }],
        },
        {
          id: "excavation-pad-pit",
          label: "Excavation (Pad_Pit)",
          title: "Excavation (Pad_Pit)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "noPiles", label: "No. of Piles", highlight: true },
            { key: "noThus", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
          ],
          defaultRows: [{ id: "PC1" }],
        },
        {
          id: "pad-concrete",
          label: "Pad (Concrete)",
          title: "Pad (Concrete)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape of Pile Cap", highlight: true, type: "select", options: ["Regular", "Irregular"] },
                { key: "areaDeduct", label: "Area To Be Deducted", highlight: true },
                { key: "noThus", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth(m)", highlight: true },
              ],
              defaultRows: [{ id: "PC1" }, { id: "PC2" }],
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
              groupLabelPrefix: "PILE CAP",
              groupIdPrefix: "PC",
              defaultRows: [],
            },
          ],
        },
        {
          id: "column-beam",
          label: "Column and Beam In Pile Cap Formwork (Concrete)",
          title: "Column and Beam In Pile Cap Formwork (Concrete)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              tables: [
                {
                  id: "beam",
                  label: "BEAM",
                  prefix: "BM",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "floorThickness", label: "Floor Thickness", highlight: true },
                    { key: "noThus", label: "No Thus", highlight: true },
                    { key: "length", label: "Length (m)", highlight: true },
                    { key: "width", label: "Width (m)", highlight: true },
                    { key: "depth", label: "Depth (m)", highlight: true },
                  ],
                  defaultRows: [{ id: "BM1" }, { id: "BM2" }, { id: "BM3" }, { id: "BM4" }, { id: "BM5" }],
                },
                {
                  id: "column",
                  label: "COLUMN",
                  prefix: "C",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "floorThickness", label: "Floor Thickness", highlight: true },
                    { key: "noThus", label: "No Thus", highlight: true },
                    { key: "length", label: "Length (m)", highlight: true },
                    { key: "width", label: "Width (m)", highlight: true },
                    { key: "depth", label: "Depth (m)", highlight: true },
                  ],
                  defaultRows: [{ id: "C1" }, { id: "C2" }, { id: "C3" }, { id: "C4" }],
                },
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              tables: [
                {
                  id: "beam-reinf",
                  label: "BEAM",
                  prefix: "BM",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                    { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                    { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                    { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                    { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
                  ],
                  defaultRows: [{ id: "BM1-1" }, { id: "BM2-1" }],
                },
                {
                  id: "column-reinf",
                  label: "COLUMN",
                  prefix: "C",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                    { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                    { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                    { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                    { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
                  ],
                  defaultRows: [{ id: "C1-1" }, { id: "C2-1" }],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // ── Strip Foundation ───────────────────────────────────────────────────────
  if (item === "strip-foundation") {
    return {
      tabs: [
        {
          id: "strip-foundation-concrete",
          label: "Strip Foundation (Concrete)",
          title: "Strip Foundation (Concrete)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "noThus", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
              ],
              defaultRows: [{ id: "SF1" }, { id: "SF2" }],
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
              groupLabelPrefix: "STRIP FOUNDATION",
              groupIdPrefix: "SF",
              defaultRows: [],
            },
          ],
        },
        {
          id: "blockwork",
          label: "Blockwork In Strip Foundation",
          title: "Blockwork In Strip Foundation",
          subtitle: "Enter blockwork specifications. All calculations automated.",
          icon: Settings2,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "noThus", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "height", label: "Height (m)", highlight: true },
                { key: "thickness", label: "Thickness (m)", highlight: true },
              ],
              defaultRows: [{ id: "BW1" }],
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
              groupLabelPrefix: "BLOCKWORK",
              groupIdPrefix: "BW",
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Swimming Pool (Substructure location) ─────────────────────────────────
  // This config is used when poolLocations includes "substructure".
  // The "external" / superstructure variant lives in superstructure.ts.
  if (item === "swimming-pool") {
    return {
      tabs: [
        {
          id: "pool-excavation",
          label: "Excavation",
          title: "Swimming Pool Excavation",
          subtitle: "Enter excavation measurements. All calculations automated.",
          icon: PenTool,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "noThus", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "depth", label: "Depth (m)", highlight: true },
          ],
          defaultRows: [{ id: "POOL1" }],
        },
        {
          id: "pool-concrete",
          label: "Pool (Concrete)",
          title: "Swimming Pool (Concrete)",
          subtitle: "Enter pool concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "noThus", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
                { key: "wallThickness", label: "Wall Thickness (m)", highlight: true },
              ],
              defaultRows: [{ id: "PC1" }],
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
              groupLabelPrefix: "POOL",
              groupIdPrefix: "PC",
              defaultRows: [],
            },
          ],
        },
        {
          id: "pool-waterproofing",
          label: "Waterproofing",
          title: "Swimming Pool Waterproofing",
          subtitle: "Enter waterproofing specifications. All calculations automated.",
          icon: Settings2,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "noThus", label: "No. Thus", highlight: true },
            { key: "area", label: "Area (m²)", highlight: true },
            { key: "type", label: "Type", highlight: true, type: "select", options: ["Crystalline", "Membrane", "Cementitious"] },
          ],
          defaultRows: [{ id: "WP1" }],
        },
      ],
    };
  }

  // No match — return null so the router can fall back to the generic config
  return null;
}
