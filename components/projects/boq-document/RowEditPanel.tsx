"use client";

import { useMemo, useState } from "react";
import { Lock, Trash2 } from "lucide-react";
import { DraggablePanel } from "@/components/ui/draggable-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "./format";
import type {
  BoqDocumentRow,
  BoqLockableField,
  PatchBoqRowRequest,
} from "@/types/boqDocument";

interface RowEditPanelProps {
  row: BoqDocumentRow | null;
  open: boolean;
  saving: boolean;
  currency: string;
  /** SMM code + title of the section the row sits in, for the panel subtitle. */
  sectionCode?: string;
  sectionTitle?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (patch: PatchBoqRowRequest) => void;
  /** Omitted when the row cannot be removed. */
  onDelete?: (row: BoqDocumentRow) => void;
}

interface FormState {
  itemCode: string;
  descriptionLeadIn: string;
  description: string;
  unit: string;
  quantity: string;
  rate: string;
}

function toForm(row: BoqDocumentRow | null): FormState {
  return {
    itemCode: row?.itemCode ?? "",
    descriptionLeadIn: row?.descriptionLeadIn ?? "",
    description: row?.description ?? "",
    unit: row?.unit ?? "",
    quantity:
      row?.quantity === null || row?.quantity === undefined
        ? ""
        : String(row.quantity),
    rate:
      row?.rate === null || row?.rate === undefined ? "" : String(row.rate),
  };
}

function parseNumeric(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function LockedBadge({
  field,
  locked,
  unlockSet,
  onToggle,
}: {
  field: BoqLockableField;
  locked: boolean;
  unlockSet: Set<BoqLockableField>;
  onToggle: (field: BoqLockableField) => void;
}) {
  if (!locked) return null;
  const willUnlock = unlockSet.has(field);
  return (
    <button
      type="button"
      data-no-drag
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors ${
        willUnlock
          ? "bg-slate-100 text-slate-400 line-through"
          : "bg-amber-100 text-amber-700"
      }`}
      title={
        willUnlock
          ? "Standard wording returns on the next commit"
          : "You overrode this — the generator leaves it alone. Click to unlock."
      }
    >
      <Lock className="h-2.5 w-2.5" />
      {willUnlock ? "Unlocking" : "Locked"}
    </button>
  );
}

export function RowEditPanel({
  row,
  onDelete,
  open,
  saving,
  currency,
  sectionCode,
  sectionTitle,
  onOpenChange,
  onSubmit,
}: RowEditPanelProps) {
  const [form, setForm] = useState<FormState>(toForm(row));
  const [unlock, setUnlock] = useState<Set<BoqLockableField>>(new Set());
  const [syncedRowId, setSyncedRowId] = useState(row?.rowId ?? null);

  // Reset the form whenever a different row is opened for editing.
  if ((row?.rowId ?? null) !== syncedRowId) {
    setSyncedRowId(row?.rowId ?? null);
    setForm(toForm(row));
    setUnlock(new Set());
  }

  const isItem = row?.rowType === "item";
  const lockedFields = useMemo(
    () => new Set<BoqLockableField>(row?.locked ?? []),
    [row],
  );

  const computedAmount = useMemo(() => {
    if (!isItem) return null;
    const q = parseNumeric(form.quantity);
    const r = parseNumeric(form.rate);
    if (q === null || r === null) return null;
    return q * r;
  }, [isItem, form.quantity, form.rate]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleUnlock = (field: BoqLockableField) =>
    setUnlock((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });

  const buildPatch = (): PatchBoqRowRequest | null => {
    if (!row) return null;
    const patch: PatchBoqRowRequest = {};
    const original = toForm(row);

    if (form.itemCode.trim() !== original.itemCode)
      patch.itemCode = form.itemCode.trim();
    if (form.descriptionLeadIn !== original.descriptionLeadIn)
      patch.descriptionLeadIn = form.descriptionLeadIn;
    if (form.description.trim() !== original.description.trim())
      patch.description = form.description.trim();

    if (isItem) {
      if (form.unit.trim() !== original.unit) patch.unit = form.unit.trim();
      if (form.quantity !== original.quantity) {
        const q = parseNumeric(form.quantity);
        if (q !== null) patch.quantity = q;
      }
      if (form.rate !== original.rate) {
        const r = parseNumeric(form.rate);
        if (r !== null && r >= 0) patch.rate = r;
      }
    }

    if (unlock.size > 0) patch.unlock = Array.from(unlock);
    return patch;
  };

  const dirty = useMemo(() => {
    const patch = buildPatch();
    return patch !== null && Object.keys(patch).length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, unlock, row]);

  const handleSave = () => {
    const patch = buildPatch();
    if (!patch || Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }
    onSubmit(patch);
  };

  const subtitle =
    sectionCode || sectionTitle
      ? [sectionCode, sectionTitle].filter(Boolean).join(" · ") +
        (row?.itemCode ? ` · Item ${row.itemCode}` : "")
      : row?.itemCode
        ? `Item ${row.itemCode}`
        : undefined;

  return (
    <DraggablePanel
      open={open && !!row}
      onClose={() => onOpenChange(false)}
      recenterKey={row?.rowId ?? null}
      title="Edit item"
      subtitle={subtitle}
      className="w-[23rem]"
      footer={
        <div className="flex items-center gap-2">
          {onDelete && row ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={saving}
              onClick={() => onDelete(row)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-amber-500 hover:bg-amber-600"
              disabled={saving || !dirty}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-slate-600">
              Item code
            </Label>
            <LockedBadge
              field="itemCode"
              locked={lockedFields.has("itemCode")}
              unlockSet={unlock}
              onToggle={toggleUnlock}
            />
          </div>
          <Input
            value={form.itemCode}
            maxLength={10}
            onChange={(e) => set("itemCode", e.target.value)}
            className="h-9 text-[12px]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-slate-600">
              Description lead-in
            </Label>
            <LockedBadge
              field="descriptionLeadIn"
              locked={lockedFields.has("descriptionLeadIn")}
              unlockSet={unlock}
              onToggle={toggleUnlock}
            />
          </div>
          <Input
            value={form.descriptionLeadIn}
            maxLength={200}
            placeholder="e.g. Excavating:"
            onChange={(e) => set("descriptionLeadIn", e.target.value)}
            className="h-9 text-[12px]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-slate-600">
              Description
            </Label>
            <LockedBadge
              field="description"
              locked={lockedFields.has("description")}
              unlockSet={unlock}
              onToggle={toggleUnlock}
            />
          </div>
          <Textarea
            value={form.description}
            maxLength={2000}
            rows={4}
            onChange={(e) => set("description", e.target.value)}
            className="resize-none text-[12px]"
          />
        </div>

        {isItem && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Unit
                  </Label>
                  <LockedBadge
                    field="unit"
                    locked={lockedFields.has("unit")}
                    unlockSet={unlock}
                    onToggle={toggleUnlock}
                  />
                </div>
                <Input
                  value={form.unit}
                  maxLength={50}
                  onChange={(e) => set("unit", e.target.value)}
                  className="h-9 text-[12px]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Qty
                  </Label>
                  <LockedBadge
                    field="quantity"
                    locked={lockedFields.has("quantity")}
                    unlockSet={unlock}
                    onToggle={toggleUnlock}
                  />
                </div>
                <Input
                  value={form.quantity}
                  inputMode="decimal"
                  onChange={(e) => set("quantity", e.target.value)}
                  className="h-9 text-[12px]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Rate
                  </Label>
                  <LockedBadge
                    field="rate"
                    locked={lockedFields.has("rate")}
                    unlockSet={unlock}
                    onToggle={toggleUnlock}
                  />
                </div>
                <Input
                  value={form.rate}
                  inputMode="decimal"
                  onChange={(e) => set("rate", e.target.value)}
                  className="h-9 text-[12px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Amount (qty × rate)
              </span>
              <span className="text-[13px] font-bold text-amber-600 tabular-nums">
                {computedAmount === null
                  ? "—"
                  : formatMoney(computedAmount, currency)}
              </span>
            </div>
          </>
        )}

        {row?.origin && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
            Generated from{" "}
            <span className="font-semibold text-slate-700">
              {row.origin.elementId}
            </span>{" "}
            ({row.origin.elementType} · {row.origin.workType}). Quantity
            refreshes on the next commit unless you lock it.
          </p>
        )}
      </div>
    </DraggablePanel>
  );
}
