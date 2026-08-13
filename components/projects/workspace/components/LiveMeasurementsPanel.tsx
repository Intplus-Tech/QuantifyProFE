"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { computeArea, computeVolume } from "./types";
import type { CreatedElement } from "./types";
import type { WsConcreteMeasurement } from "../workspaceSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unitLabel(distanceUnit: string, squared: boolean): string {
  const base = distanceUnit === "Meters" ? "m" : distanceUnit;
  return squared ? `${base}²` : base;
}

function volumeDisplay(variant: WsConcreteMeasurement): string {
  const vol = parseFloat(computeVolume(variant.measureType, variant.concreteFields, variant.canvas));
  return !isNaN(vol) && vol > 0 ? `${vol.toFixed(2)} m³` : "—";
}

function rebarDisplay(variant: WsConcreteMeasurement): string {
  if (!variant.rebar) return "—";
  let totalBars = 0;
  for (const bar of [...variant.rebar.mainBars, ...variant.rebar.additionBars]) {
    const n = parseInt(bar.count, 10);
    if (!isNaN(n)) totalBars += n;
  }
  return totalBars > 0 ? `${totalBars} bars` : "—";
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  distanceUnit,
  inProgress,
  selected,
  onSelect,
  onDelete,
}: {
  variant: WsConcreteMeasurement;
  distanceUnit: string;
  inProgress: boolean;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const tool = variant.canvas.tool;
  const countDisplay = tool === "count" ? `${variant.canvas.count}` : "—";
  const lengthDisplay =
    tool === "length" ? `${variant.canvas.length.toFixed(2)} ${unitLabel(distanceUnit, false)}` : "—";
  // Area tool → the actual traced polygon area. Any other tool → a Height × Width
  // fallback from whatever concrete fields were recorded (e.g. Window/Door openings).
  const computedArea = computeArea(variant.concreteFields, variant.canvas);
  const areaDisplay =
    tool === "area"
      ? `${computedArea.toFixed(2)} ${unitLabel(distanceUnit, true)}`
      : computedArea > 0
        ? `${computedArea.toFixed(2)} m²`
        : "—";

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${
        selected
          ? "bg-amber-50"
          : inProgress
            ? "bg-blue-50/60 hover:bg-blue-50"
            : "hover:bg-slate-50/60"
      }`}
    >
      <td className="px-3 py-2.5">
        <div className={`text-[12px] font-semibold ${selected ? "text-amber-700" : inProgress ? "text-blue-600" : "text-slate-700"}`}>
          {variant.tag || variant.measureType}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wide ${inProgress ? "text-blue-400" : "text-slate-400"}`}>
          {inProgress ? "In Progress" : variant.measureType}
        </div>
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${selected ? "text-amber-700" : inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {countDisplay}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${selected ? "text-amber-700" : inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {lengthDisplay}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${selected ? "text-amber-700" : inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {areaDisplay}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${selected ? "text-amber-700" : inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {volumeDisplay(variant)}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${selected ? "text-amber-700" : inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {rebarDisplay(variant)}
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete this measurement"
          className="w-6 h-6 inline-flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function MeasurementTable({
  elements,
  pendingVariants,
  distanceUnit,
  selectedVariantId,
  onSelectVariant,
  onDeleteVariant,
}: {
  elements: CreatedElement[];
  pendingVariants: WsConcreteMeasurement[];
  distanceUnit: string;
  selectedVariantId: string | null;
  onSelectVariant: (variant: WsConcreteMeasurement) => void;
  onDeleteVariant: (variant: WsConcreteMeasurement) => void;
}) {
  // Every individual variant gets its own row — no summing across a category.
  const assignedRows = elements.flatMap((el) => el.variants);
  const hasRows = assignedRows.length > 0 || pendingVariants.length > 0;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50/80">
          {["Element", "Count", "Length", "Area", "Volume", "Rebar", ""].map((h) => (
            <th
              key={h}
              className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!hasRows && (
          <tr>
            <td colSpan={7} className="px-3 py-4 text-center text-[12px] text-slate-400 italic">
              No measurements yet. Apply &amp; Continue to see rows here.
            </td>
          </tr>
        )}
        {assignedRows.map((v) => (
          <VariantRow
            key={v.id}
            variant={v}
            distanceUnit={distanceUnit}
            inProgress={false}
            selected={selectedVariantId === v.id}
            onSelect={() => onSelectVariant(v)}
            onDelete={() => onDeleteVariant(v)}
          />
        ))}
        {pendingVariants.map((v) => (
          <VariantRow
            key={v.id}
            variant={v}
            distanceUnit={distanceUnit}
            inProgress
            selected={selectedVariantId === v.id}
            onSelect={() => onSelectVariant(v)}
            onDelete={() => onDeleteVariant(v)}
          />
        ))}
      </tbody>
    </table>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveMeasurementsPanel({
  elements,
  pendingVariants,
  distanceUnit,
  selectedVariantId,
  onSelectVariant,
  onDeleteVariant,
  onClearAll,
}: {
  elements: CreatedElement[];
  pendingVariants: WsConcreteMeasurement[];
  /** Kept for backwards-compat callers; no longer used for display since every
   *  row now shows its own measureType instead of one shared category name. */
  scaleWhat?: string;
  distanceUnit: string;
  selectedVariantId: string | null;
  onSelectVariant: (variant: WsConcreteMeasurement) => void;
  onDeleteVariant: (variant: WsConcreteMeasurement) => void;
  onClearAll: () => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const totalRows =
    elements.reduce((s, el) => s + el.variants.length, 0) + pendingVariants.length;

  return (
    <>
      <div className="shrink-0 bg-white border-t border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center shrink-0">
              <div className="grid grid-cols-2 gap-px p-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-1 h-1 bg-slate-400 rounded-[1px]" />
                ))}
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Live Measurements
            </span>
            {totalRows > 0 && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-px">
                {totalRows}
              </span>
            )}
            {collapsed
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            }
          </button>
          <div className="flex items-center gap-1">
            {totalRows > 0 && (
              <button
                onClick={onClearAll}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear all measurements"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setExpanded(true)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline table — collapsed by default to preserve canvas space */}
        {!collapsed && (
          <div className="max-h-48 overflow-y-auto">
            <MeasurementTable
              elements={elements}
              pendingVariants={pendingVariants}
              distanceUnit={distanceUnit}
              selectedVariantId={selectedVariantId}
              onSelectVariant={onSelectVariant}
              onDeleteVariant={onDeleteVariant}
            />
          </div>
        )}
      </div>

      {/* Full-screen expand dialog */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl! max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold">Live Measurements</DialogTitle>
            <button
              onClick={() => setExpanded(false)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg">
            <MeasurementTable
              elements={elements}
              pendingVariants={pendingVariants}
              distanceUnit={distanceUnit}
              selectedVariantId={selectedVariantId}
              onSelectVariant={onSelectVariant}
              onDeleteVariant={onDeleteVariant}
            />
          </div>
          <div className="shrink-0 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {elements.length} element{elements.length !== 1 ? "s" : ""} assigned
              {pendingVariants.length > 0 && ` · ${pendingVariants.length} pending variant${pendingVariants.length !== 1 ? "s" : ""}`}
            </span>
            {totalRows > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
