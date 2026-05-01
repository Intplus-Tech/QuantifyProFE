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
          elementType: "excavation_clearing",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "areaReference", label: "AREA REFERENCE", highlight: true },
            { key: "count", label: "NO. THUS", highlight: true },
            { key: "length", label: "LENGTH (M)", highlight: true },
            { key: "width", label: "WIDTH (M)", highlight: true },
            { key: "depth", label: "DEPTH (M)", highlight: true },
          ],
          defaultRows: [{ id: "CL1", shape: "rectangular" }],
        },
        {
          id: "excavation-pad-pit",
          label: "Excavation (Pad_Pit)",
          title: "Excavation (Pad_Pit)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          elementType: "ddt_pad_pit_in_strip",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "numberOfPiles", label: "No. of Piles", highlight: true },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "height", label: "Height (m)", highlight: true },
          ],
          defaultRows: [{ id: "PC1", shape: "rectangular" }],
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
              elementType: "pile_cap",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape of Pile Cap", highlight: true, type: "select", options: ["rectangular", "circular"] },
                { key: "areaDeduct", label: "Area To Be Deducted", highlight: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth(m)", highlight: true },
              ],
              defaultRows: [{ id: "PC1", shape: "rectangular" }],
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
                  elementType: "beam",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                    { key: "floorThickness", label: "Floor Thickness", highlight: true },
                    { key: "count", label: "No Thus", highlight: true },
                    { key: "length", label: "Length (m)", highlight: true },
                    { key: "width", label: "Width (m)", highlight: true },
                    { key: "depth", label: "Depth (m)", highlight: true },
                  ],
                  defaultRows: [{ id: "BM1", shape: "rectangular" }],
                },
                {
                  id: "column",
                  label: "COLUMN",
                  prefix: "C",
                  elementType: "column_in_foundation",
                  columns: [
                    { key: "id", label: "ID", readonly: true },
                    { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                    { key: "floorThickness", label: "Floor Thickness", highlight: true },
                    { key: "count", label: "No Thus", highlight: true },
                    { key: "length", label: "Length (m)", highlight: true },
                    { key: "width", label: "Width (m)", highlight: true },
                    { key: "depth", label: "Depth (m)", highlight: true },
                  ],
                  defaultRows: [{ id: "C1", shape: "rectangular" }],
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
                  defaultRows: [{ id: "BM1-1" }],
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
                  defaultRows: [{ id: "C1-1" }],
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
          id: "excavation-clearing",
          label: "Excavation & Clearing",
          title: "Clearing & Topsoil Excavation",
          subtitle: "Enter site clearing measurements. All calculations automated in backend.",
          icon: PenTool,
          elementType: "excavation_clearing",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "areaReference", label: "AREA REFERENCE", highlight: true },
            { key: "count", label: "NO. THUS", highlight: true },
            { key: "length", label: "LENGTH (M)", highlight: true },
            { key: "width", label: "WIDTH (M)", highlight: true },
            { key: "depth", label: "DEPTH (M)", highlight: true },
          ],
          defaultRows: [
            { id: "EC1", shape: "rectangular", areaReference: "Site A", count: 1, length: 50.00, width: 30.00, depth: 0.30 },
            { id: "EC2", shape: "rectangular", areaReference: "Site B", count: 1, length: 25.00, width: 20.00, depth: 0.30 },
            { id: "EC3", shape: "rectangular", areaReference: "Access Rd", count: 1, length: 40.00, width: 5.00, depth: 0.15 }
          ],
        },
        {
          id: "excavation-strip",
          label: "Excavation (Strip)",
          title: "Excavation (Strip)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "strip",
              label: "Strip",
              elementType: "excavation_strip",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
              ],
              defaultRows: [
                { id: "ES1", count: 1, length: 18.05, width: 0.28, depth: 3.935 },
                { id: "ES2", count: 1, length: 9.80, width: 0.28, depth: 3.935 },
                { id: "ES3" }
              ],
            },
            {
              id: "ddt-pad-pit",
              label: "Ddt Pad_Pit In Strip",
              elementType: "ddt_pad_pit_in_strip",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "stripThickness", label: "Strip Thickness", highlight: true },
                { key: "numberOfBranches", label: "No. of Branches", highlight: true },
                { key: "colBLength", label: "Col. B Length (m)", highlight: true },
                { key: "colBWidth", label: "Col. B Width (m)", highlight: true },
                { key: "pitDepth", label: "Pit Depth (m)", highlight: true },
                { key: "blockworkWidth", label: "Blockwork Width", highlight: true },
                { key: "blockworkHeight", label: "Blockwork Height", highlight: true },
              ],
              defaultRows: [
                { id: "ES1", stripThickness: 1, numberOfBranches: 18.05, colBLength: 0.28, colBWidth: 3.935, pitDepth: 3.935, blockworkWidth: 3.935, blockworkHeight: 3.935 },
                { id: "ES2", stripThickness: 1, numberOfBranches: 9.80, colBLength: 0.28, colBWidth: 3.935, pitDepth: 3.935, blockworkWidth: 3.935, blockworkHeight: 3.935 },
                { id: "ES3" }
              ],
            },
            {
              id: "strip-length-calculator",
              label: "Strip Length Calculator",
              elementType: "strip_length_calculator",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "nr", label: "Nr", highlight: true },
                { key: "lin", label: "Lin", highlight: true },
              ],
              defaultRows: [
                { id: "ES1", nr: 3.935, lin: 3.935 },
                { id: "ES2", nr: 3.935, lin: 3.935 },
                { id: "ES3" }
              ],
            },
          ],
        },
        {
          id: "pad-footing",
          label: "Pad Footing",
          title: "Pad Footing",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete, Formwork & BRC Mesh",
              elementType: "pad_footing",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
                { key: "fillingThickness", label: "Filing Thickness", highlight: true },
              ],
              defaultRows: [
                { id: "PD1", count: 1, length: 18.05, depth: 0.28, fillingThickness: 3.935 },
                { id: "PD2", count: 1, length: 9.80, depth: 0.28, fillingThickness: 3.935 },
                { id: "PD3" }
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "PAD FOOTING",
              groupIdPrefix: "PD",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [
                { id: "PD1", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "PD2", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "PD3" }
              ],
            },
          ]
        },
        {
          id: "reinforced-strip-foundation",
          label: "Reinforced Strip Foundation",
          title: "Reinforced Strip Foundation",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "strip_foundation",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
                { key: "floorThickness", label: "Floor Thickness", highlight: true },
              ],
              defaultRows: [
                { id: "RSF1", count: 1, length: 18.05, depth: 0.28, floorThickness: 3.935 },
                { id: "RSF2", count: 1, length: 9.80, depth: 0.28, floorThickness: 3.935 },
                { id: "RSF3" }
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "STRIP FOUNDATION",
              groupIdPrefix: "RSF",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [
                { id: "RSF1", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "RSF2", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "RSF3" }
              ],
            },
          ],
        },
        {
          id: "ground-floor-bed",
          label: "Ground Floor Bed",
          title: "Ground Floor Bed",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork-brc",
              label: "Concrete, Formwork & BRC Mesh",
              elementType: "ground_floor_bed",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
                { key: "floorThickness", label: "Floor Thickness", highlight: true },
              ],
              defaultRows: [
                { id: "GFB1", count: 1, length: 18.05, depth: 0.28, floorThickness: 3.935 },
                { id: "GFB2", count: 1, length: 9.80, depth: 0.28, floorThickness: 3.935 },
                { id: "GFB3" }
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [
                { id: "GFB1", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "GFB2", centerToCenter: "12.5 - 12.0 - 12.7 - 12.0", sizeDia: "8.0 - 8.0 - 8.0 - 8.0", noThus: "3.50 - 3.50 - 3.50 - 3.50", noInEach: "3.50 - 3.50 - 3.50 - 3.50", cutLength: "3.50 - 3.50 - 3.50 - 3.50" },
                { id: "GFB3" }
              ],
            },
          ],
        }
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
          tables: [
            {
              id: "pool-excavation",
              label: "Excavation",
              prefix: "EX",
              elementType: "excavation_clearing",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth (m)", highlight: true },
              ],
              defaultRows: [{ id: "POOL1", shape: "rectangular" }],
            },
          ],
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
              defaultRows: [{ id: "PC1", shape: "rectangular" }],
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
  // ── Column In Foundation ─────────────────────────────────────────────────────
  if (item === "column") {
    return {
      tabs: [
        {
          id: "column",
          label: "Column",
          title: "Column In Foundation",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "column_in_foundation",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
                { key: "state", label: "State", type: "select", options: ["isolated", "continuous"] },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length/Radius (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "depth", label: "Depth(m)", highlight: true },
              ],
              defaultRows: [
                { id: "C1", shape: "rectangular", state: "isolated" },
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "COLUMN",
              groupIdPrefix: "C",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [],
            },
          ],
        },
      ],
    };
  }

  // ── Ground Beam ──────────────────────────────────────────────────────────────
  if (item === "ground-beam") {
    return {
      tabs: [
        // Tab 1: Excavation & Clearing (shared clearing/topsoil table)
        {
          id: "excavation-clearing",
          label: "Excavation & Clearing",
          title: "Clearing & Topsoil Excavation",
          subtitle: "Enter site clearing measurements. All calculations automated in backend.",
          icon: PenTool,
          elementType: "excavation_clearing",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "areaReference", label: "AREA REFERENCE", highlight: true },
            { key: "count", label: "NO. THUS", highlight: true },
            { key: "length", label: "LENGTH (M)", highlight: true },
            { key: "width", label: "WIDTH (M)", highlight: true },
            { key: "depth", label: "DEPTH (M)", highlight: true },
          ],
          defaultRows: [{ id: "CL1", shape: "rectangular" }],
        },
        // Tab 2: Excavation (Ground Beam)
        {
          id: "excavation-ground-beam",
          label: "Excavation (Ground Beam)",
          title: "Excavation (Ground Beam)",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          elementType: "excavation_ground_beam",
          columns: [
            { key: "id", label: "ID", readonly: true },
            { key: "shape", label: "Shape", type: "select", options: ["rectangular", "circular"] },
            { key: "fillingThickness", label: "Filling Thickness", highlight: true },
            { key: "count", label: "No. Thus", highlight: true },
            { key: "length", label: "Length (m)", highlight: true },
            { key: "width", label: "Width (m)", highlight: true },
            { key: "depth", label: "Depth (m)", highlight: true },
          ],
          defaultRows: [
            { id: "GB1", shape: "rectangular" },
          ],
        },
        // Tab 3: Ground Beam (Concrete & Formwork + Reinforcement sub-tabs)
        {
          id: "ground-beam",
          label: "Ground Beam",
          title: "Ground Beam",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: PenTool,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "ground_beam",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "floorThickness", label: "Floor Thickness", highlight: true },
                { key: "count", label: "No. Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "height", label: "Depth(m)", highlight: true },
              ],
              defaultRows: [
                { id: "GB1", shape: "rectangular" },
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "GROUND BEAM",
              groupIdPrefix: "GB",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [],
            },
          ],
        },
        // Tab 4: Ground Floor Bed (3 sub-tabs: Concrete & Formwork, Reinforcement, Void Deductions)
        {
          id: "ground-floor-bed",
          label: "Ground Floor Bed",
          title: "Ground Floor Bed",
          subtitle: "Enter concrete specifications. All calculations automated.",
          icon: Settings2,
          subTabs: [
            {
              id: "concrete-formwork",
              label: "Concrete & Formwork",
              elementType: "ground_floor_bed",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "fillingThickness", label: "Filling Thickness", highlight: true },
                { key: "count", label: "No Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "thickness", label: "Thickness (m)", highlight: true },
              ],
              defaultRows: [
                { id: "GFB1", shape: "rectangular" },
              ],
            },
            {
              id: "reinforcement",
              label: "Reinforcement",
              hasBendingSummary: true,
              groupedBy: "concrete-formwork",
              groupLabelPrefix: "GROUND FLOOR BED",
              groupIdPrefix: "GFB",
              columns: [
                { key: "id", label: "ID", readonly: true },
                { key: "centerToCenter", label: "Center to Center", highlight: true, multiInput: true },
                { key: "sizeDia", label: "Size-Dia (mm)", highlight: true, multiInput: true },
                { key: "noThus", label: "No Thus", highlight: true, multiInput: true },
                { key: "noInEach", label: "No in Each", highlight: true, multiInput: true },
                { key: "cutLength", label: "Cut Length (mm)", highlight: true, multiInput: true },
              ],
              defaultRows: [],
            },
            {
              id: "void-deductions",
              label: "Void Deductions",
              elementType: "ground_floor_bed_void",
              columns: [
                // ID is editable here — users type free text like "LIFT", "LIFT 2", "OPENING"
                { key: "id", label: "ID", readonly: false },
                { key: "fillingThickness", label: "Filling Thickness", highlight: true },
                { key: "count", label: "No Thus", highlight: true },
                { key: "length", label: "Length (m)", highlight: true },
                { key: "width", label: "Width (m)", highlight: true },
                { key: "thickness", label: "Thickness (m)", highlight: true },
              ],
              // One blank row to start — default to ROW1 so auto-numbering and deletions work perfectly
              defaultRows: [{ id: "ROW1" }],
            },
          ],
        },
      ],
    };
  }

  return null;
}

