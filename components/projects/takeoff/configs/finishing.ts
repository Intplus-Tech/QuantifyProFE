/**
 * Finishing Takeoff Configurations
 * ─────────────────────────────────────────────────────────────────────────────
 * Add a new `if` block for each item slug under the "finishing" section.
 * The item slug comes from the URL: /takeoff/finishing/[item]
 *
 * Items to configure (routes already registered in ProjectWorkspaceLayout.tsx):
 *  • roof-beam-slab           → Roof Beam & Slab
 *  • walls-openings           → Walls & Openings
 *  • roof-structure-covering  → Roof Structure & Covering
 *  • floors-ceilings          → Floor's & Ceiling's
 *
 * ─── HOW TO ADD A NEW ITEM ────────────────────────────────────────────────────
 * See the comment block at the top of configs/superstructure.ts for full examples.
 * See configs/types.ts for all type definitions and field descriptions.
 * See configs/substructure.ts for real-world working examples.
 */

import { PenTool, Settings2 } from "lucide-react";
import type { TakeoffConfig } from "./types";

export function getFinishingConfig(item: string): TakeoffConfig | null {
  // ── Roof Beam & Slab ──────────────────────────────────────────────────────
  // TODO: implement
  if (item === "roof-beam-slab") {
    return {
      tabs: [
        {
          id: "roof-beam-slab-concrete",
          label: "Roof Beam & Slab (Concrete)",
          title: "Roof Beam & Slab (Concrete)",
          subtitle: "Enter roof beam and slab specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "roof_slab",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
              ],
              defaultRows: [{ id: "RBS1", shape: "rectangular" }],
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
              groupLabelPrefix: "ROOF BEAM/SLAB",
              groupIdPrefix: "RBS",
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Walls & Openings ──────────────────────────────────────────────────────
  // TODO: implement
  if (item === "walls-openings") {
    return {
      tabs: [
        {
          id: "walls-blockwork",
          label: "Walls (Blockwork)",
          title: "Walls (Blockwork)",
          subtitle: "Enter wall blockwork specifications. All calculations automated.",
          icon: Settings2,
          elementType: "wall",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
            { key: "thickness", label: "Thickness (m)", highlight: true },
          ],
          defaultRows: [{ id: "WALL1", shape: "rectangular" }],
        },
        {
          id: "openings",
          label: "Openings",
          title: "Openings (Doors & Windows)",
          subtitle: "Enter opening specifications. Deductions applied automatically.",
          icon: Settings2,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "type", label: "Type", highlight: true, type: "select", options: ["Door", "Window", "Vent"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
          ],
          defaultRows: [{ id: "OP1" }],
        },
      ],
    };
  }

  // ── Roof Structure & Covering ─────────────────────────────────────────────
  // TODO: implement
  if (item === "roof-structure-covering") {
    return {
      tabs: [
        {
          id: "roof-structure",
          label: "Roof Structure",
          title: "Roof Structure",
          subtitle: "Enter roof structure specifications. All calculations automated.",
          icon: PenTool,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "span", label: "Span (m)", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "pitch", label: "Pitch (°)", highlight: true },
          ],
          defaultRows: [{ id: "RS1" }],
        },
        {
          id: "roof-covering",
          label: "Roof Covering",
          title: "Roof Covering",
          subtitle: "Enter roof covering specifications. All calculations automated.",
          icon: Settings2,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "type", label: "Type", highlight: true, type: "select", options: ["Metal Sheet", "Tiles", "Membrane"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "area", label: "Area (m²)", highlight: true },
          ],
          defaultRows: [{ id: "RC1" }],
        },
      ],
    };
  }

  // ── Floor's & Ceiling's ───────────────────────────────────────────────────
  // TODO: implement
  if (item === "floors-ceilings") {
    return {
      tabs: [
        {
          id: "floors",
          label: "Floors",
          title: "Floors",
          subtitle: "Enter floor finishing specifications. All calculations automated.",
          icon: Settings2,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "type", label: "Finish Type", highlight: true, type: "select", options: ["Tiles", "Screed", "Timber", "Epoxy"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
          ],
          defaultRows: [{ id: "FL1" }],
        },
        {
          id: "ceilings",
          label: "Ceilings",
          title: "Ceilings",
          subtitle: "Enter ceiling specifications. All calculations automated.",
          icon: Settings2,
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "type", label: "Ceiling Type", highlight: true, type: "select", options: ["Plasterboard", "Suspended", "Exposed"] },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
          ],
          defaultRows: [{ id: "CL1" }],
        },
      ],
    };
  }

  return null;
}
