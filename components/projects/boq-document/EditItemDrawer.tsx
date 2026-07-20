"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmount, formatNaira } from "./format";
import { itemAmount } from "./totals";
import type { BOQBill, BOQItem, BOQSubsection } from "./types";

const MEASUREMENT_METHODS = [
  "Lump Sum",
  "Linear Metres (m)",
  "Square Metres (sq.m)",
  "Cubic Metres (cu.m)",
  "Tonnes (ton)",
  "Number (nr)",
];

interface EditItemDrawerProps {
  item: BOQItem;
  bill: BOQBill;
  subsection: BOQSubsection;
  onSave: (updated: BOQItem) => void;
  onDelete: (itemId: string) => void;
  onClose: () => void;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {hint && <span className="text-[9px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

/** Empty string is preserved so the field can be cleared while typing. */
function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function EditItemDrawer({
  item,
  bill,
  subsection,
  onSave,
  onDelete,
  onClose,
}: EditItemDrawerProps) {
  const [draft, setDraft] = useState<BOQItem>(item);
  const [qtyText, setQtyText] = useState(item.qty?.toString() ?? "");
  const [rateText, setRateText] = useState(item.rate?.toString() ?? "");
  const [lumpText, setLumpText] = useState(item.lumpSum?.toString() ?? "");

  useEffect(() => {
    setDraft(item);
    setQtyText(item.qty?.toString() ?? "");
    setRateText(item.rate?.toString() ?? "");
    setLumpText(item.lumpSum?.toString() ?? "");
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Driven by the subsection's column mode, not by whether values happen to be
  // present — freshly generated BOQs arrive with every rate null.
  const isMeasured = subsection.columns === "full";
  const computed = itemAmount(draft);

  const patch = (changes: Partial<BOQItem>) =>
    setDraft((prev) => ({ ...prev, ...changes }));

  // Keep the item's own method selectable — mapped payloads use "Measured in m³"
  // style labels that aren't in the canonical list.
  const methodOptions = Array.from(
    new Set(
      [draft.measurementMethod, ...MEASUREMENT_METHODS].filter(
        (m): m is string => Boolean(m),
      ),
    ),
  );

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-slate-200 bg-white print:hidden">
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-[12px] font-bold text-slate-900">Edit Item</h2>
          <p className="mt-0.5 text-[9px] text-slate-400">
            {subsection.code} · {bill.title || bill.code}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editor"
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Field label="Item Reference" hint="Auto-assigned">
          <input
            className={inputClass}
            value={draft.ref}
            onChange={(e) => patch({ ref: e.target.value })}
          />
        </Field>

        <Field label="Item Description">
          <textarea
            rows={3}
            className={`${inputClass} resize-none leading-snug`}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </Field>

        <Field label="Measurement Method">
          <select
            className={inputClass}
            value={draft.measurementMethod ?? ""}
            onChange={(e) => patch({ measurementMethod: e.target.value })}
          >
            {methodOptions.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </Field>

        {/* Quantity and unit are meaningful in both layouts. */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input
              inputMode="decimal"
              className={inputClass}
              value={qtyText}
              onChange={(e) => {
                setQtyText(e.target.value);
                patch({ qty: toNumber(e.target.value) });
              }}
            />
          </Field>
          <Field label="Unit">
            <input
              className={inputClass}
              value={draft.unit ?? ""}
              onChange={(e) => patch({ unit: e.target.value })}
            />
          </Field>
        </div>

        {isMeasured ? (
          <>
            <Field label="Unit Rate (₦)" hint={draft.unit ? `per ${draft.unit}` : undefined}>
              <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
                <span className="text-[11px] text-slate-400">₦</span>
                <input
                  inputMode="decimal"
                  className="w-full bg-transparent text-[11px] text-slate-900 outline-none"
                  value={rateText}
                  onChange={(e) => {
                    setRateText(e.target.value);
                    patch({ rate: toNumber(e.target.value) });
                  }}
                />
              </div>
            </Field>
          </>
        ) : (
          <Field label="Total Amount (₦)">
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
              <span className="text-[11px] text-slate-400">₦</span>
              <input
                inputMode="decimal"
                className="w-full bg-transparent text-[11px] text-slate-900 outline-none"
                value={lumpText}
                onChange={(e) => {
                  setLumpText(e.target.value);
                  patch({ lumpSum: toNumber(e.target.value) ?? 0 });
                }}
              />
            </div>
          </Field>
        )}

        {draft.lastEditedAt && (
          <p className="text-[9px] text-slate-400">
            Last edited {draft.lastEditedAt} by {draft.lastEditedBy}
          </p>
        )}

        <div className="rounded-lg bg-amber-50/70 px-3 py-2.5">
          {isMeasured && (
            <p className="mb-1 text-right text-[9px] text-slate-500 tabular-nums">
              {draft.qty === null || draft.rate === null
                ? "Enter quantity and rate"
                : `${formatAmount(draft.qty, 0)} × ${formatNaira(draft.rate, 0)}`}
            </p>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold text-slate-600">
              Computed Amount
            </span>
            <span className="text-[13px] font-bold text-amber-600 tabular-nums">
              {isMeasured && (draft.qty === null || draft.rate === null)
                ? "—"
                : formatNaira(computed, 0)}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Audit Trail
          </h3>
          <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
            Rate and quantity changes are versioned against{" "}
            {draft.lastEditedBy ?? "the preparing firm"}.
          </p>
        </div>
      </div>

      <footer className="space-y-2 border-t border-slate-100 px-4 py-3">
        <Button
          size="sm"
          className="h-8 w-full bg-amber-500 text-[11px] font-semibold text-white hover:bg-amber-600"
          onClick={() => onSave(draft)}
        >
          Save Changes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-[11px] text-slate-500 hover:bg-slate-100"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full border-red-200 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(draft.id)}
        >
          <Trash2 className="mr-1.5 h-3 w-3" />
          Delete This Item
        </Button>
      </footer>
    </div>
  );
}
