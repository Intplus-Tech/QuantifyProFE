"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Ban, Check, LayoutPanelTop, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  setElementStatus,
  updateElementDimensions,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import {
  applicableDimensionKeys,
  computeElementQuantities,
  fmt,
  missingDimensionKeys,
  type DimensionKey,
} from "../calc";
import type { ElementDimensions, ExtractedElement } from "../types";

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  length: "Length (L)",
  width: "Width (W)",
  depth: "Depth (D)",
  diameter: "Diameter (Ø)",
};

const toMetres = (mm: number | null) => (mm === null ? "" : (mm / 1000).toFixed(2));

export function QuickEditModal({
  element,
  onClose,
}: {
  element: ExtractedElement | null;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const globalParameters = useSelector(
    (state: RootState) => state.aiFlow.globalParameters,
  );

  const missing = useMemo(
    () => (element ? missingDimensionKeys(element.dimensions) : []),
    [element],
  );

  const applicable = useMemo(
    () => (element ? applicableDimensionKeys(element.dimensions) : []),
    [element],
  );

  // When OCR failed, only the failed dimensions get inputs (as designed).
  // When everything was read, every dimension becomes editable so the row can
  // still be corrected.
  const editKeys = missing.length > 0 ? missing : applicable;

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!element) return;
    setDrafts(
      Object.fromEntries(
        editKeys.map((key) => [key, toMetres(element.dimensions[key])]),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element?.id]);

  const draftDimensions: ElementDimensions | null = useMemo(() => {
    if (!element) return null;
    const next = { ...element.dimensions };
    for (const key of editKeys) {
      const raw = drafts[key];
      const parsed = Number(raw);
      next[key] = raw !== undefined && raw !== "" && Number.isFinite(parsed)
        ? parsed * 1000
        : null;
    }
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, drafts]);

  const preview = draftDimensions
    ? computeElementQuantities(draftDimensions, globalParameters)
    : null;

  const allFilled = editKeys.every((key) => {
    const raw = drafts[key];
    return raw !== undefined && raw !== "" && Number(raw) > 0;
  });

  if (!element) return null;

  const readOnlyKeys = applicable.filter((key) => !editKeys.includes(key));

  const handleSave = () => {
    if (!allFilled) return;
    const changes: Partial<ElementDimensions> = {};
    for (const key of editKeys) changes[key] = Number(drafts[key]) * 1000;

    dispatch(updateElementDimensions({ elementId: element.id, dimensions: changes }));
    toast.success(`${element.id} saved`, {
      description: "Quantities recalculated from the updated dimensions.",
    });
    onClose();
  };

  const handleReject = () => {
    dispatch(setElementStatus({ elementId: element.id, status: "rejected" }));
    toast.warning(`${element.id} rejected`, {
      description: "It is excluded from all schedules and totals.",
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex-1 text-[15px] font-semibold text-slate-800">
            Quick Edit: {element.id} (Grid {element.grid}) | Page {element.page}
          </DialogTitle>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 px-5 py-4">
          <DetectedRow label="Detected Shape" value={element.dimensions.shape} />

          {readOnlyKeys.map((key) => (
            <DetectedRow
              key={key}
              label={DIMENSION_LABELS[key]}
              value={`${fmt((element.dimensions[key] ?? 0) / 1000)} m`}
            />
          ))}

          {missing.map((key) => (
            <FailedRow key={key} label={DIMENSION_LABELS[key]} />
          ))}

          <div className="pt-2">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {missing.length > 0
                ? `Enter missing dimension${missing.length > 1 ? "s" : ""}`
                : "Adjust dimensions"}
            </p>

            <div className="space-y-2">
              {editKeys.map((key, index) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[11px] text-slate-500">
                    {DIMENSION_LABELS[key]}
                  </span>
                  <div className="flex w-36 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
                    <input
                      autoFocus={index === 0}
                      inputMode="decimal"
                      aria-label={`${DIMENSION_LABELS[key]} in metres`}
                      value={drafts[key] ?? ""}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [key]: e.target.value }))
                      }
                      placeholder="0.00"
                      className="w-full bg-transparent text-sm tabular-nums outline-none placeholder:text-slate-300"
                    />
                    <span className="shrink-0 text-xs text-slate-400">m</span>
                  </div>
                  {missing.includes(key) && (
                    <p className="text-[11px] text-slate-400">
                      Value required to complete calculation
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {preview && (
            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-md bg-slate-100 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                <LayoutPanelTop className="h-3.5 w-3.5" />
                Live Preview Results
              </span>
              <div className="ml-auto flex flex-wrap gap-x-7 gap-y-2">
                <PreviewStat
                  label="Concrete"
                  value={allFilled ? `${fmt(preview.concrete)} m³` : "—"}
                />
                <PreviewStat
                  label="Formwork"
                  value={allFilled ? `${fmt(preview.formwork)} m²` : "—"}
                />
                <PreviewStat
                  label="Rebar"
                  value={allFilled ? `${fmt(preview.rebar, 1)} kg` : "—"}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <Button
            variant="outline"
            onClick={handleReject}
            className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Ban className="h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleSave} disabled={!allFilled}>
            Save Result
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetectedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
      <span className="text-[13px] text-slate-700">
        {label}: <span className="font-medium">{value}</span>
      </span>
    </div>
  );
}

function FailedRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-red-50 px-3 py-2.5 ring-1 ring-red-200">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <X className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
      <span className="text-[13px] text-slate-700">
        {label}: <span className="font-medium">NOT DETECTED - OCR failed</span>
      </span>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="font-mono text-[12px] font-semibold tabular-nums text-slate-700">
        {value}
      </p>
    </div>
  );
}
