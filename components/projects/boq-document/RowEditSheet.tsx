"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  BoqDocumentRow,
  BoqLockableField,
  PatchBoqRowRequest,
} from "@/types/boqDocument";

interface RowEditSheetProps {
  row: BoqDocumentRow | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (patch: PatchBoqRowRequest) => void;
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

export function RowEditSheet({
  row,
  open,
  saving,
  onOpenChange,
  onSubmit,
}: RowEditSheetProps) {
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

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleUnlock = (field: BoqLockableField) =>
    setUnlock((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });

  const handleSave = () => {
    if (!row) return;
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
        const q = Number(form.quantity.replace(/[,\s]/g, ""));
        if (form.quantity !== "" && Number.isFinite(q)) patch.quantity = q;
      }
      if (form.rate !== original.rate) {
        const r = Number(form.rate.replace(/[,\s]/g, ""));
        if (form.rate !== "" && Number.isFinite(r) && r >= 0) patch.rate = r;
      }
    }

    if (unlock.size > 0) patch.unlock = Array.from(unlock);

    if (Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }
    onSubmit(patch);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold">Edit row</SheetTitle>
          <SheetDescription className="text-[11px]">
            Edits persist immediately and survive the next recalculation.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
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

        <SheetFooter className="flex-row justify-end gap-2 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 bg-amber-500 hover:bg-amber-600"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
