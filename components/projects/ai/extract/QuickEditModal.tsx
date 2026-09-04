"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Ban, Check, LayoutPanelTop, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  applyDimensionsToGroup,
  setElementQuantity,
  setElementStatus,
  updateElementDimensions,
} from "@/store/slices/aiFlowSlice";
import { MEASURE_TYPES } from "../mock-data";
import type { RootState } from "@/store";
import {
  applicableDimensionFields,
  computeElementQuantities,
  fmt,
  isDimensionKnown,
  missingDimensionKeys,
  type DimensionKey,
} from "../calc";
import { useAiTakeoff } from "../useAiTakeoff";
import type { ElementDimensions, ExtractedElement } from "../types";

// Labels come from the element's own spec now — a pile asks for a diameter and
// a length, a column for width, depth and height. See elementSpec.ts.

// Three decimals, trailing zeros trimmed: rounding the draft to 2dp turned a
// 25 mm value into "0.03" and, on save, wrote 30 mm back.
const toMetres = (mm: number | null) =>
  mm === null ? "" : String(Number((mm / 1000).toFixed(3)));

export function QuickEditModal({
  element,
  onClose,
}: {
  element: ExtractedElement | null;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const { reviewDetections } = useAiTakeoff();
  const globalParameters = useSelector(
    (state: RootState) => state.aiFlow.globalParameters,
  );

  const fields = useMemo(
    () =>
      element ? applicableDimensionFields(element.measureTypeId, element.dimensions) : [],
    [element],
  );

  const missing = useMemo(
    () => (element ? missingDimensionKeys(element.dimensions, element.measureTypeId) : []),
    [element],
  );

  const applicable = useMemo(() => fields.map((f) => f.key), [fields]);
  const fieldFor = (key: DimensionKey) => fields.find((f) => f.key === key);

  // When OCR failed, only the failed dimensions get inputs (as designed).
  // When everything was read, every dimension becomes editable so the row can
  // still be corrected.
  const editKeys = missing.length > 0 ? missing : applicable;

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [countDraft, setCountDraft] = useState("1");

  // A legend gives one spec for a whole run of piles or caps, so offer to push
  // the figures across the group instead of asking for them 130 times.
  const groups = useSelector((state: RootState) => state.aiFlow.groups);
  const siblings = element
    ? (groups
        .find((group) => group.measureTypeId === element.measureTypeId)
        ?.elements.filter((e) => e.status !== "rejected").length ?? 1)
    : 1;
  const measureLabel = element
    ? (MEASURE_TYPES.find((m) => m.id === element.measureTypeId)?.label ??
      "elements")
    : "elements";

  useEffect(() => {
    if (!element) return;
    setDrafts(
      Object.fromEntries(
        editKeys.map((key) => [
          key,
          // A dimension that came back as ~0 is not a reading to preserve.
          isDimensionKnown(element.dimensions[key])
            ? toMetres(element.dimensions[key])
            : "",
        ]),
      ),
    );
    setApplyToAll(false);
    setCountDraft(String(element.quantity || 1));
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

  // Per member, then multiplied by the row's member count for the row total.
  const preview =
    draftDimensions && element
      ? computeElementQuantities(
          draftDimensions,
          globalParameters,
          element.measureTypeId,
        )
      : null;
  // The count in the box, so the preview moves as it is corrected.
  const parsedCount = Math.max(1, Math.round(Number(countDraft) || 0));
  const members = Number.isFinite(parsedCount) ? parsedCount : 1;

  const allFilled = editKeys.every((key) => {
    const raw = drafts[key];
    return raw !== undefined && raw !== "" && Number(raw) > 0;
  });

  if (!element) return null;

  const readOnlyKeys = applicable.filter((key) => !editKeys.includes(key));
  const scaled = (value: number) => value * members;

  // Saving accepts the detection; rejecting excludes it. Both are mirrored to
  // PATCH /ai-takeoff/sessions/:id/elements/review when a session is live.
  const handleSave = async () => {
    if (!allFilled) return;
    const changes: Partial<ElementDimensions> = {};
    for (const key of editKeys) changes[key] = Number(drafts[key]) * 1000;

    if (members !== (element.quantity || 1)) {
      dispatch(setElementQuantity({ elementId: element.id, quantity: members }));
    }

    if (applyToAll) {
      dispatch(
        applyDimensionsToGroup({
          measureTypeId: element.measureTypeId,
          dimensions: changes,
        }),
      );
    } else {
      dispatch(updateElementDimensions({ elementId: element.id, dimensions: changes }));
    }

    await reviewDetections([element.id], "accepted");
    toast.success(applyToAll ? `${siblings} ${measureLabel} updated` : `${element.id} saved`, {
      description: "Quantities recalculated from the updated dimensions.",
    });
    onClose();
  };

  const handleReject = async () => {
    dispatch(setElementStatus({ elementId: element.id, status: "rejected" }));
    await reviewDetections([element.id], "rejected");
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

          <div className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
            <span className="flex-1 text-[13px] text-slate-700">
              How many of these?
              <span className="block text-[11px] text-slate-500">
                One detection can stand for a whole run — a legend row of 130
                piles, or a grid the detector under-counted. Quantities below
                are for all {members}.
              </span>
            </span>
            <div className="flex w-24 shrink-0 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
              <input
                inputMode="numeric"
                aria-label="Number of members this row stands for"
                value={countDraft}
                onChange={(event) => setCountDraft(event.target.value)}
                className="w-full bg-transparent text-sm tabular-nums outline-none"
              />
              <span className="shrink-0 text-xs text-slate-400">no.</span>
            </div>
          </div>

          {readOnlyKeys.map((key) => (
            <DetectedRow
              key={key}
              label={fieldFor(key)?.label ?? key}
              value={`${fmt((element.dimensions[key] ?? 0) / 1000)} m`}
            />
          ))}

          {missing.map((key) => (
            <FailedRow key={key} label={fieldFor(key)?.label ?? key} />
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
                  <span className="w-32 shrink-0 text-[11px] text-slate-500">
                    {fieldFor(key)?.label ?? key}
                    {fieldFor(key)?.hint && (
                      <span className="block text-[10px] text-slate-400">
                        {fieldFor(key)?.hint}
                      </span>
                    )}
                  </span>
                  <div className="flex w-36 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
                    <input
                      autoFocus={index === 0}
                      inputMode="decimal"
                      aria-label={`${fieldFor(key)?.label ?? key} in metres`}
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

          {siblings > 1 && (
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2.5">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(event) => setApplyToAll(event.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-amber-500"
              />
              <span className="text-[12px] leading-relaxed text-slate-700">
                Apply to all {siblings} {measureLabel.toLowerCase()}
                <span className="block text-[11px] text-slate-500">
                  A legend or schedule usually gives one size for the whole run.
                  The drawing marks where each one sits, not how big it is, so
                  entering it once here fills them all.
                </span>
              </span>
            </label>
          )}

          {preview && (
            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-md bg-slate-100 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                <LayoutPanelTop className="h-3.5 w-3.5" />
                Live Preview Results
              </span>
              <div className="ml-auto flex flex-wrap gap-x-7 gap-y-2">
                <PreviewStat
                  label="Concrete"
                  value={allFilled ? `${fmt(scaled(preview.concrete))} m³` : "—"}
                />
                <PreviewStat
                  label="Formwork"
                  value={allFilled ? `${fmt(scaled(preview.formwork))} m²` : "—"}
                />
                <PreviewStat
                  label="Rebar"
                  value={allFilled ? `${fmt(scaled(preview.rebar), 1)} kg` : "—"}
                />
                <PreviewStat
                  label="Excavation"
                  value={allFilled ? `${fmt(scaled(preview.excavation))} m³` : "—"}
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
        {label}:{" "}
        <span className="font-medium">Not shown on this drawing — enter it below</span>
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
