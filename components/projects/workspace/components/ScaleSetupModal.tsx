"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MeasureCombobox, type MeasureGroup } from "./MeasureCombobox";
import { SCALE_MEASURE_OPTIONS, ELEMENT_CONFIGS } from "./constants";

// Every entry in SCALE_MEASURE_OPTIONS gets a category here — this is what
// groups + colour-codes the combobox. Kept in the same order as the backend's
// element-type catalogue (see toBackendElementType in ProjectWorkspaceView.tsx).
const MEASURE_CATEGORY: Record<string, string> = {
  // Substructure
  Piles: "Substructure",
  "Pile Cap": "Substructure",
  "Pile Cap Frames": "Substructure",
  "Ground Beam / Raft": "Substructure",
  "Strip Foundation": "Substructure",
  "Raft Foundation": "Substructure",
  "Column Base / Pad": "Substructure",
  "Column Footing": "Substructure",
  "Stud Column / Column in Foundation": "Substructure",
  "Ground Floor Slab": "Substructure",
  "Oversite Slab": "Substructure",
  "Water Slab": "Substructure",
  "Blockwork on Foundation": "Substructure",
  "Excavation Clearing": "Substructure",
  "Swimming Pool": "Substructure",
  // Superstructure
  Columns: "Superstructure",
  "Roof Column": "Superstructure",
  "Floor Beams": "Superstructure",
  "Shear Wall": "Superstructure",
  "Lift Wall": "Superstructure",
  "Lift Shaft": "Superstructure",
  Staircase: "Superstructure",
  "Staircase Landing": "Superstructure",
  "Staircase Strings & Steps": "Superstructure",
  "Staircase Upper Floors": "Superstructure",
  "Upper Floor Slab": "Superstructure",
  "Roof Slab": "Superstructure",
  "Parapet Wall": "Superstructure",
  "Parapet Wall Coping": "Superstructure",
  Lintel: "Superstructure",
  Blockwork: "Superstructure",
  Roof: "Superstructure",
  // Openings
  Windows: "Openings",
  Doors: "Openings",
  // Finishes & Fittings
  "Floor Finishes": "Finishes & Fittings",
  "Wall Finishes": "Finishes & Fittings",
  "Ceiling Finishes": "Finishes & Fittings",
  "Kitchen Countertop": "Finishes & Fittings",
};

const CATEGORY_ORDER = [
  "Substructure",
  "Superstructure",
  "Openings",
  "Finishes & Fittings",
];

const CATEGORY_DOT: Record<string, string> = {
  Substructure: "bg-amber-500",
  Superstructure: "bg-blue-500",
  Openings: "bg-emerald-500",
  "Finishes & Fittings": "bg-violet-500",
};

// Derived once, not per-render — bucket SCALE_MEASURE_OPTIONS into ordered,
// coloured groups. Any option missing from MEASURE_CATEGORY still surfaces
// (as "Other") rather than silently disappearing from the picker.
const MEASURE_GROUPS: MeasureGroup[] = [...CATEGORY_ORDER, "Other"]
  .map((category) => ({
    category,
    dot: CATEGORY_DOT[category] ?? "bg-slate-300",
    items: SCALE_MEASURE_OPTIONS.filter(
      (m) => (MEASURE_CATEGORY[m] ?? "Other") === category,
    ),
  }))
  .filter((g) => g.items.length > 0);

export function ScaleSetupModal({
  open,
  measure,
  onMeasureChange,
  measureChoice,
  onMeasureChoiceChange,
  onCancel,
  onYes,
}: {
  open: boolean;
  measure: string;
  onMeasureChange: (v: string) => void;
  measureChoice: "count" | "area" | null;
  onMeasureChoiceChange: (v: "count" | "area") => void;
  onCancel: () => void;
  onYes: () => void;
}) {
  const isChoiceCategory = ELEMENT_CONFIGS[measure]?.tool === "choice";
  const canProceed = !isChoiceCategory || measureChoice !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-5 py-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="3" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="16.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="12" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16.5" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800">Page Scale Setup</h3>
            <p className="text-[12px] text-slate-500 mt-1">Would you like to scale for this page?</p>
          </div>

          <div className="w-full space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              What do you want to measure?
            </p>
            <MeasureCombobox value={measure} groups={MEASURE_GROUPS} onChange={onMeasureChange} />
          </div>

          {isChoiceCategory && (
            <div className="w-full space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                How do you want to measure this?
              </p>
              <div className="flex items-center gap-3 w-full">
                {(["count", "area"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onMeasureChoiceChange(c)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold capitalize transition-colors ${
                      measureChoice === c
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 w-full">
            <Button
              onClick={onYes}
              disabled={!canProceed}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40"
            >
              Yes, I want to Scale
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
