"use client";

import { useState } from "react";
import { Link2, Search, Plus, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CreatedElement } from "./types";
import type { WsConcreteMeasurement } from "../workspaceSession";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pendingSummary(variants: WsConcreteMeasurement[]): string {
  if (variants.length === 0) return "No measurements yet";
  const { tool, unit } = variants[0].canvas;
  switch (tool) {
    case "count": {
      const total = variants.reduce((s, v) => s + v.canvas.count, 0);
      return `${total} item${total !== 1 ? "s" : ""} across ${variants.length} variant${variants.length !== 1 ? "s" : ""}`;
    }
    case "length": {
      const total = variants.reduce((s, v) => s + v.canvas.length, 0);
      return `${total.toFixed(2)} ${unit} across ${variants.length} variant${variants.length !== 1 ? "s" : ""}`;
    }
    case "area": {
      const total = variants.reduce((s, v) => s + v.canvas.area, 0);
      const displayUnit = unit === "Meters" ? "m²" : `${unit}²`;
      return `${total.toFixed(2)} ${displayUnit} across ${variants.length} variant${variants.length !== 1 ? "s" : ""}`;
    }
  }
}

function elementCurrentTotal(el: CreatedElement): number {
  return el.variants.reduce((s, v) => s + v.canvas.count, 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AssignItemsModal({
  open,
  existingElements,
  pendingVariants,
  onClose,
  onContinue,
}: {
  open: boolean;
  existingElements: CreatedElement[];
  pendingVariants: WsConcreteMeasurement[];
  onClose: () => void;
  onContinue: (mode: "new" | "existing", elementId?: string) => void;
}) {
  const hasExisting = existingElements.length > 0;
  const [mode, setMode] = useState<"new" | "existing">(hasExisting ? "existing" : "new");
  const [selectedEl, setSelectedEl] = useState<string>(existingElements[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const filtered = existingElements.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold">Assign Items</DialogTitle>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                {pendingSummary(pendingVariants)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <p className="text-[13px] text-slate-600">
          How would you like to assign these items?
        </p>

        <div className="space-y-2">
          {/* Create New Element */}
          <button
            onClick={() => setMode("new")}
            className={`w-full text-left border-2 rounded-xl p-3.5 flex items-start gap-3 transition-colors ${
              mode === "new" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                mode === "new" ? "border-amber-500" : "border-slate-300"
              }`}
            >
              {mode === "new" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-semibold ${mode === "new" ? "text-amber-700" : "text-slate-700"}`}>
                Create New Element
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Define custom parameters and add these items to a brand new element in your BOQ.
              </p>
            </div>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                mode === "new" ? "bg-amber-100" : "border border-slate-200"
              }`}
            >
              <Plus className={`w-3.5 h-3.5 ${mode === "new" ? "text-amber-600" : "text-slate-400"}`} />
            </div>
          </button>

          {/* Assign to Existing — only when there are existing elements */}
          {hasExisting && (
            <div
              className={`border-2 rounded-xl transition-colors ${
                mode === "existing" ? "border-amber-500 bg-amber-50" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => setMode("existing")}
                className="w-full text-left p-3.5 flex items-start gap-3"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    mode === "existing" ? "border-amber-500" : "border-slate-300"
                  }`}
                >
                  {mode === "existing" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-semibold ${
                      mode === "existing" ? "text-amber-700" : "text-slate-700"
                    }`}
                  >
                    Assign to Existing Element
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add these measurements to an element you&apos;ve already created.
                  </p>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === "existing" ? "bg-amber-100" : "border border-slate-200"
                  }`}
                >
                  <Link2
                    className={`w-3.5 h-3.5 ${mode === "existing" ? "text-amber-600" : "text-slate-400"}`}
                  />
                </div>
              </button>

              {mode === "existing" && (
                <div
                  className="px-3.5 pb-3.5 space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search existing elements..."
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    {filtered.length === 0 ? (
                      <p className="text-[11px] text-slate-400 px-2 py-2 italic">
                        No elements match your search.
                      </p>
                    ) : (
                      filtered.map((el) => {
                        const total = elementCurrentTotal(el);
                        return (
                          <button
                            key={el.id}
                            onClick={() => setSelectedEl(el.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                              selectedEl === el.id
                                ? "border-amber-200 bg-white"
                                : "border-slate-100 bg-white hover:bg-slate-50"
                            }`}
                          >
                            {selectedEl === el.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[12px] font-semibold text-slate-700">{el.name}</p>
                              <p className="text-[10px] text-slate-400">{el.category} / {el.name}</p>
                            </div>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {total} item{total !== 1 ? "s" : ""}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onContinue(mode, mode === "existing" ? selectedEl : undefined)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
            disabled={mode === "existing" ? (pendingVariants.length === 0 || !selectedEl) : false}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
