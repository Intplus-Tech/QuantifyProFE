"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { computeVolume } from "./types";
import type { CreatedElement } from "./types";
import type { WsConcreteMeasurement } from "../workspaceSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantLabel(el: CreatedElement): string {
  const count = el.variants.length;
  if (count === 0) return "—";
  return `${count} ${el.name}`;
}

function measuredTotal(variants: WsConcreteMeasurement[], distanceUnit: string): string {
  if (variants.length === 0) return "0.00";
  const tool = variants[0].canvas.tool;
  if (tool === "count") {
    const total = variants.reduce((s, v) => s + v.canvas.count, 0);
    return `${total}`;
  }
  if (tool === "length") {
    const total = variants.reduce((s, v) => s + v.canvas.length, 0);
    return `${total.toFixed(2)} ${distanceUnit === "Meters" ? "m" : distanceUnit}`;
  }
  const total = variants.reduce((s, v) => s + v.canvas.area, 0);
  return `${total.toFixed(2)} ${distanceUnit === "Meters" ? "m²" : `${distanceUnit}²`}`;
}

function volumeTotal(variants: WsConcreteMeasurement[]): string {
  if (variants.length === 0) return "0.00";
  const total = variants.reduce((s, v) => {
    const vol = parseFloat(computeVolume(v.measureType, v.concreteFields, v.canvas));
    return s + (isNaN(vol) ? 0 : vol);
  }, 0);
  return total > 0 ? `${total.toFixed(2)} m³` : "0.00";
}

function rebarSummary(variants: WsConcreteMeasurement[]): string {
  let totalBars = 0;
  for (const v of variants) {
    if (!v.rebar) continue;
    for (const bar of [...v.rebar.mainBars, ...v.rebar.additionBars]) {
      const n = parseInt(bar.count, 10);
      if (!isNaN(n)) totalBars += n;
    }
  }
  return totalBars > 0 ? `${totalBars} bars` : "—";
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function TableRow({
  element,
  label,
  measured,
  volume,
  rebar,
  inProgress = false,
}: {
  element: string;
  label: string;
  measured: string;
  volume: string;
  rebar: string;
  inProgress?: boolean;
}) {
  return (
    <tr
      className={`border-b border-slate-100 last:border-0 ${
        inProgress ? "bg-blue-50/60" : "hover:bg-slate-50/60"
      }`}
    >
      <td className="px-3 py-2.5">
        <div className={`text-[12px] font-semibold ${inProgress ? "text-blue-600" : "text-slate-700"}`}>
          {element}
        </div>
        {inProgress && (
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
            In Progress
          </div>
        )}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {label}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {measured}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {volume}
      </td>
      <td className={`px-3 py-2.5 text-[12px] ${inProgress ? "text-blue-500" : "text-slate-600"}`}>
        {rebar}
      </td>
    </tr>
  );
}

function MeasurementTable({
  elements,
  pendingVariants,
  scaleWhat,
  distanceUnit,
}: {
  elements: CreatedElement[];
  pendingVariants: WsConcreteMeasurement[];
  scaleWhat: string;
  distanceUnit: string;
}) {
  const hasRows = elements.length > 0 || pendingVariants.length > 0;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50/80">
          {["Element", "Variants", "Measured", "Volume", "Rebar"].map((h) => (
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
            <td colSpan={5} className="px-3 py-4 text-center text-[12px] text-slate-400 italic">
              No measurements yet. Apply &amp; Continue to see rows here.
            </td>
          </tr>
        )}
        {elements.map((el) => (
          <TableRow
            key={el.id}
            element={el.name}
            label={variantLabel(el)}
            measured={measuredTotal(el.variants, distanceUnit)}
            volume={volumeTotal(el.variants)}
            rebar={rebarSummary(el.variants)}
          />
        ))}
        {pendingVariants.length > 0 && (
          <TableRow
            element={scaleWhat}
            label={`${pendingVariants.length} variant${pendingVariants.length !== 1 ? "s" : ""}`}
            measured={measuredTotal(pendingVariants, distanceUnit)}
            volume={volumeTotal(pendingVariants)}
            rebar={rebarSummary(pendingVariants)}
            inProgress
          />
        )}
      </tbody>
    </table>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveMeasurementsPanel({
  elements,
  pendingVariants,
  scaleWhat,
  distanceUnit,
}: {
  elements: CreatedElement[];
  pendingVariants: WsConcreteMeasurement[];
  scaleWhat: string;
  distanceUnit: string;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const totalRows = elements.length + (pendingVariants.length > 0 ? 1 : 0);

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
          <button
            onClick={() => setExpanded(true)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline table — collapsed by default to preserve canvas space */}
        {!collapsed && (
          <div className="max-h-48 overflow-y-auto">
            <MeasurementTable
              elements={elements}
              pendingVariants={pendingVariants}
              scaleWhat={scaleWhat}
              distanceUnit={distanceUnit}
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
              scaleWhat={scaleWhat}
              distanceUnit={distanceUnit}
            />
          </div>
          <div className="shrink-0 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {elements.length} element{elements.length !== 1 ? "s" : ""} assigned
              {pendingVariants.length > 0 && ` · ${pendingVariants.length} pending variant${pendingVariants.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
