"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CreatedElement } from "./types";
import type { WsConcreteMeasurement } from "../workspaceSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantTotal(variants: WsConcreteMeasurement[]): number {
  if (variants.length === 0) return 0;
  const { tool } = variants[0].canvas;
  switch (tool) {
    case "count":
      return variants.reduce((s, v) => s + v.canvas.count, 0);
    case "length":
      return Math.round(variants.reduce((s, v) => s + v.canvas.length, 0) * 100) / 100;
    case "area":
      return Math.round(variants.reduce((s, v) => s + v.canvas.area, 0) * 100) / 100;
  }
}

function unitLabel(variants: WsConcreteMeasurement[]): string {
  if (variants.length === 0) return "items";
  const { tool, unit } = variants[0].canvas;
  switch (tool) {
    case "count": return "items";
    case "length": return unit;
    case "area": return unit === "Meters" ? "m²" : `${unit}²`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmAssignmentModal({
  open,
  pendingVariants,
  targetElement,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pendingVariants: WsConcreteMeasurement[];
  targetElement: CreatedElement | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const adding = variantTotal(pendingVariants);
  const current = variantTotal(targetElement?.variants ?? []);
  const newTotal = current + adding;
  const unit = unitLabel(pendingVariants);
  const elementName = targetElement?.name ?? "Element";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Confirm Assignment</DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-slate-600">
          You are about to add{" "}
          <span className="font-semibold text-amber-600">
            {adding} {unit}
          </span>{" "}
          to the existing element:
        </p>

        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0" />
            <span className="text-sm font-semibold text-slate-800">{elementName}</span>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Current {unit}</span>
              <span className="text-slate-700">
                {current} {unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adding</span>
              <span className="text-amber-600 font-semibold">
                + {adding} {unit}
              </span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">New total</span>
              <span className="text-slate-800">
                {newTotal} {unit}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-amber-500 hover:bg-amber-600 text-white">
            Confirm Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
