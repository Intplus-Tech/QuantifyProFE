"use client";

import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PileRow } from "./types";
import { computeVolume } from "./types";
import type { WsConcreteMeasurement } from "../workspaceSession";

// ─── Category folder options ───────────────────────────────────────────────────

const CATEGORY_FOLDERS: { group: string; items: string[] }[] = [
  {
    group: "Substructure",
    items: [
      "Substructure / Piles",
      "Substructure / Pile Caps",
      "Substructure / Ground Beams",
      "Substructure / Foundations (Strip/Raft)",
      "Substructure / Blinding Concrete",
    ],
  },
  {
    group: "Superstructure",
    items: [
      "Superstructure / Columns",
      "Superstructure / Beams",
      "Superstructure / Slabs",
      "Superstructure / Shear Walls",
      "Superstructure / Stairs",
      "Superstructure / Roof Structure",
    ],
  },
  {
    group: "Architectural",
    items: [
      "Architectural / External Walls (Blockwork/Brick)",
      "Architectural / Internal Walls (Partition)",
      "Architectural / Lintel",
      "Architectural / Parapet Walls",
      "Architectural / Doors",
      "Architectural / Windows",
      "Architectural / Floor Finishes (Paint/Tiles)",
      "Architectural / Ceiling Finishes",
      "Architectural / Roof Finishes",
    ],
  },
  {
    group: "MEP",
    items: [
      "MEP / Electrical (Conduit, Cables, Panels)",
      "MEP / Plumbing (Pipes, Fittings, Fixtures)",
      "MEP / HVAC (Ductwork, Diffusers, Units)",
      "MEP / Fire Protection (Sprinklers, Alarms)",
    ],
  },
  {
    group: "External Works",
    items: [
      "External Works / Swimming Pool",
      "External Works / Pavement / Hardscape",
      "External Works / Landscaping",
      "External Works / Drainage",
      "External Works / Fencing / Gates",
    ],
  },
  {
    group: "Site Works",
    items: [
      "Site Works / Earthworks (Excavation, Filling)",
      "Site Works / Compaction",
      "Site Works / Dewatering",
    ],
  },
  {
    group: "Finishes & Fixtures",
    items: [
      "Finishes & Fixtures / Kitchen (Countertops, Cabinets, Appliances)",
      "Finishes & Fixtures / Bathroom (Sanitary Ware, Accessories)",
      "Finishes & Fixtures / Joinery (Shelves, Wardrobes)",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function measureColumnMeta(tool: "count" | "length" | "area", unit: string) {
  switch (tool) {
    case "count":
      return { header: "Count", accessor: (v: WsConcreteMeasurement) => String(v.canvas.count) };
    case "length":
      return {
        header: `Length (${unit})`,
        accessor: (v: WsConcreteMeasurement) => v.canvas.length.toFixed(2),
      };
    case "area":
      return {
        header: `Area (${unit === "Meters" ? "m²" : `${unit}²`})`,
        accessor: (v: WsConcreteMeasurement) => v.canvas.area.toFixed(2),
      };
  }
}

function defaultCategoryFolder(measureType: string): string {
  const map: Record<string, string> = {
    "Piles":                              "Substructure / Piles",
    "Pile Cap":                           "Substructure / Pile Caps",
    "Ground Beam / Raft":                 "Substructure / Ground Beams",
    "Column Base / Pad":                  "Substructure / Foundations (Strip/Raft)",
    "Stud Column / Column in Foundation": "Substructure / Foundations (Strip/Raft)",
    "Ground Floor Slab":                  "Substructure / Blinding Concrete",
    "Blockwork on Foundation":            "Architectural / External Walls (Blockwork/Brick)",
    "Columns":                            "Superstructure / Columns",
    "Floor Beams":                        "Superstructure / Beams",
    "Staircase":                          "Superstructure / Stairs",
    "Upper Floor Slab":                   "Superstructure / Slabs",
    "Lintel":                             "Architectural / Lintel",
    "Blockwork":                          "Architectural / External Walls (Blockwork/Brick)",
    "Roof":                               "Superstructure / Roof Structure",
    "Windows":                            "Architectural / Windows",
    "Doors":                              "Architectural / Doors",
    "Floor Finishes":                     "Architectural / Floor Finishes (Paint/Tiles)",
    "Wall Finishes":                      "Architectural / Internal Walls (Partition)",
    "Ceiling Finishes":                   "Architectural / Ceiling Finishes",
  };
  return map[measureType] ?? "Substructure / Piles";
}

function defaultMeasurementUnit(tool: "count" | "length" | "area"): string {
  switch (tool) {
    case "count": return "Counts";
    case "length": return "m";
    case "area": return "m²";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateNewElementModal({
  open,
  pendingVariants,
  measureType,
  onClose,
  onUseExisting,
  onCreate,
}: {
  open: boolean;
  pendingVariants: WsConcreteMeasurement[];
  measureType: string;
  onClose: () => void;
  onUseExisting: () => void;
  onCreate: (data: { categoryFolder: string; measurementUnit: string; rows: PileRow[] }) => void;
}) {
  const activeTool = pendingVariants[0]?.canvas.tool ?? "count";
  const activeUnit = pendingVariants[0]?.canvas.unit ?? "Meters";

  const colMeta = useMemo(
    () => measureColumnMeta(activeTool, activeUnit),
    [activeTool, activeUnit],
  );

  const [categoryFolder, setCategoryFolder] = useState(
    () => defaultCategoryFolder(measureType),
  );
  const [measurementUnit, setMeasurementUnit] = useState(
    () => defaultMeasurementUnit(activeTool),
  );

  // No measurements yet — still allow creating the element as a zero-value shell
  // (e.g. right after "+ New Element", before anything's been drawn).
  const [rows, setRows] = useState<PileRow[]>(() =>
    pendingVariants.length > 0
      ? pendingVariants.map((v) => ({
          id: v.id,
          name: v.tag || v.measureType,
          count: colMeta.accessor(v),
          volume: computeVolume(v.measureType, v.concreteFields, v.canvas),
        }))
      : [{ id: "placeholder", name: measureType, count: "0", volume: "0" }],
  );

  function updateRow(id: string, field: keyof PileRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function handleCreate() {
    toast.success("Element created");
    onCreate({ categoryFolder, measurementUnit, rows });
  }

  const sectionHeader = `Assign ${measureType} Parameters`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl! max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base font-bold">Create New Element</DialogTitle>
          <p className="text-[12px] text-slate-500">Define custom parameters and sub-items</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Basic Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">Category folder</label>
                <Select value={categoryFolder} onValueChange={setCategoryFolder}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CATEGORY_FOLDERS.map(({ group, items }) => (
                      <SelectGroup key={group}>
                        <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {group}
                        </SelectLabel>
                        {items.map((folder) => (
                          <SelectItem key={folder} value={folder}>
                            {folder.split(" / ").slice(1).join(" / ")}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">Measurement Unit</label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Counts">Counts</SelectItem>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                    <SelectItem value="m">m (linear)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parameters table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {sectionHeader}
              </p>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 bg-white">
              {[measureType, colMeta.header, "Volume (m³)"].map((h) => (
                <div
                  key={h}
                  className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider"
                >
                  {h}
                </div>
              ))}
            </div>
            {rows.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-slate-400">
                No variants saved yet. Use &quot;Apply &amp; Continue&quot; first.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-3 border-b border-slate-50 last:border-0"
                >
                  <div className="px-4 py-3 text-[13px] text-slate-600 flex items-center">
                    {row.name}
                  </div>
                  <div className="px-3 py-2 flex items-center">
                    <Input
                      value={row.count}
                      onChange={(e) => updateRow(row.id, "count", e.target.value)}
                      className="h-8 text-sm w-24"
                    />
                  </div>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <Input
                      value={row.volume}
                      onChange={(e) => updateRow(row.id, "volume", e.target.value)}
                      className="h-8 text-sm w-24"
                    />
                    <span className="text-[11px] text-slate-500">m³</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onUseExisting}
            className="text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Use Existing Element
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={rows.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 disabled:opacity-40"
            >
              Create Element <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
