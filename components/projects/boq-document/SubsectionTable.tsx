"use client";

import { Pencil, Plus, Upload } from "lucide-react";
import { InlineNumberCell } from "./InlineNumberCell";
import { formatAmount, formatNaira, formatQty, formatRate } from "./format";
import { itemAmount, subsectionTotal } from "./totals";
import type { BOQItem, BOQSubsection, SubsectionAccent } from "./types";

const ACCENTS: Record<SubsectionAccent, { band: string; chip: string }> = {
  amber: { band: "bg-amber-50/70", chip: "bg-amber-100 text-amber-700" },
  blue: { band: "bg-blue-50/70", chip: "bg-blue-100 text-blue-700" },
  green: { band: "bg-emerald-50/70", chip: "bg-emerald-100 text-emerald-700" },
  orange: { band: "bg-orange-50/70", chip: "bg-orange-100 text-orange-700" },
};

interface SubsectionTableProps {
  subsection: BOQSubsection;
  activeItemId: string | null;
  onEditItem: (itemId: string) => void;
  onUpdateItem: (updated: BOQItem) => void;
  onAddItem: (subsectionId: string) => void;
  onImportCsv: (subsectionId: string) => void;
}

export function SubsectionTable({
  subsection,
  activeItemId,
  onEditItem,
  onUpdateItem,
  onAddItem,
  onImportCsv,
}: SubsectionTableProps) {
  const accent = ACCENTS[subsection.accent];
  const isFull = subsection.columns === "full";
  const total = subsectionTotal(subsection);

  return (
    <section className="border-t border-slate-100 first:border-t-0">
      <header className={`flex items-center gap-2 px-4 py-2 ${accent.band}`}>
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${accent.chip}`}
        >
          {subsection.code}
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
          {subsection.title}
        </h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="w-16 px-4 py-2">{isFull ? "Item" : "Ref"}</th>
              <th className="px-4 py-2">
                {isFull ? "Description" : "Item Description"}
              </th>
              {isFull && <th className="w-24 px-3 py-2 text-right">Qty</th>}
              {isFull && <th className="w-16 px-3 py-2 text-center">Unit</th>}
              {isFull && <th className="w-32 px-3 py-2 text-right">Rate (₦)</th>}
              <th className="w-40 px-4 py-2 text-right">
                {isFull ? "Amount (₦)" : "Total (₦)"}
              </th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>

          <tbody>
            {subsection.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                isFull={isFull}
                isActive={activeItemId === item.id}
                onEdit={() => onEditItem(item.id)}
                onUpdateItem={onUpdateItem}
              />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-4 print:hidden">
          <button
            type="button"
            onClick={() => onAddItem(subsection.id)}
            className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            <Plus className="h-3 w-3" />
            Add Item
          </button>
          <button
            type="button"
            onClick={() => onImportCsv(subsection.id)}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <Upload className="h-3 w-3" />
            Import CSV
          </button>
        </div>

        <p className="text-[10px] text-slate-500">
          Section Total:{" "}
          <span className="font-bold text-amber-600 tabular-nums">
            {formatNaira(total, 0)}
          </span>
        </p>
      </footer>
    </section>
  );
}

function ItemRow({
  item,
  isFull,
  isActive,
  onEdit,
  onUpdateItem,
}: {
  item: BOQItem;
  isFull: boolean;
  isActive: boolean;
  onEdit: () => void;
  onUpdateItem: (updated: BOQItem) => void;
}) {
  // Informational rows (room schedules etc.) carry no pricing and aren't editable.
  if (item.kind === "note") {
    return (
      <tr className="border-b border-slate-50 last:border-b-0">
        <td className="px-4 py-2" />
        <td
          colSpan={isFull ? 6 : 3}
          className="px-4 py-2 text-[10px] italic leading-snug text-slate-500"
        >
          {item.description}
        </td>
      </tr>
    );
  }

  const amount = itemAmount(item);
  const isPriced = item.qty !== null && item.rate !== null;

  return (
    <tr
      className={`border-b border-slate-50 align-top transition-colors last:border-b-0 ${
        isActive ? "bg-amber-50/50" : "hover:bg-slate-50/40"
      }`}
    >
      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
        {item.ref || "—"}
      </td>

      <td className="px-4 py-2.5 text-[11px] leading-snug text-slate-700">
        {item.description}
        {/* Compact layout has no Qty/Unit columns — keep them visible here. */}
        {!isFull && (item.qty !== null || item.unit) && (
          <span className="mt-0.5 block text-[9px] font-medium text-slate-500 tabular-nums">
            {item.qty !== null ? formatQty(item.qty) : "—"}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
        )}
        {item.notes && (
          <span className="mt-0.5 block text-[9px] leading-snug text-slate-400">
            {item.notes}
          </span>
        )}
      </td>

      {isFull && (
        <td className="px-3 py-2 text-[10px] text-slate-500">
          <InlineNumberCell
            value={item.qty}
            display={formatQty}
            active={isActive}
            autoFocus
            ariaLabel={`Quantity for item ${item.ref}`}
            onCommit={(next) => onUpdateItem({ ...item, qty: next })}
          />
        </td>
      )}

      {isFull && (
        <td className="px-3 py-2.5 text-center text-[10px] text-slate-400">
          {item.unit ?? "—"}
        </td>
      )}

      {isFull && (
        <td className="px-3 py-2 text-[10px] text-slate-500">
          <InlineNumberCell
            value={item.rate}
            display={formatRate}
            active={isActive}
            ariaLabel={`Rate for item ${item.ref}`}
            onCommit={(next) => onUpdateItem({ ...item, rate: next })}
          />
        </td>
      )}

      <td className="px-4 py-2 text-[11px] font-semibold text-slate-900">
        {isFull ? (
          // Derived from qty × rate — edit those, not this.
          <span className="block px-2 py-1 text-right tabular-nums">
            {isPriced ? (
              formatAmount(amount, 0)
            ) : (
              <span className="text-slate-300">—</span>
            )}
          </span>
        ) : (
          <InlineNumberCell
            value={item.lumpSum ?? null}
            display={(v) => (v === null ? "" : formatAmount(v, 2))}
            active={isActive}
            autoFocus
            currency
            ariaLabel={`Total for item ${item.ref}`}
            className="font-semibold"
            onCommit={(next) => onUpdateItem({ ...item, lumpSum: next ?? 0 })}
          />
        )}
      </td>

      <td className="px-2 py-2.5 text-right print:hidden">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit item ${item.ref}`}
          className={`rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
            isActive
              ? "bg-amber-100 text-amber-700"
              : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
          }`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}
