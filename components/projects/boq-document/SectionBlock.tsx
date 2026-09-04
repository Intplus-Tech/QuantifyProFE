"use client";

import { Pencil, Plus, Upload } from "lucide-react";
import { RateCell } from "./RateCell";
import { formatCell, formatMoney } from "./format";
import type { BoqDocumentRow, BoqDocumentSection } from "@/types/boqDocument";

interface SectionBlockProps {
  section: BoqDocumentSection;
  currency: string;
  savingRowId: string | null;
  onEditRow: (row: BoqDocumentRow) => void;
  onRateCommit: (row: BoqDocumentRow, rate: number) => void;
  onAddItem: (section: BoqDocumentSection) => void;
  onImportCsv: (section: BoqDocumentSection) => void;
}

function fmtQty(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const decimals = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Bold lead-in immediately before the description, on the same line. */
function Description({ row }: { row: BoqDocumentRow }) {
  return (
    <>
      {row.descriptionLeadIn && (
        <span className="font-semibold text-slate-800">
          {row.descriptionLeadIn}{" "}
        </span>
      )}
      {row.description}
    </>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Edit row"
      className="rounded p-1 text-slate-300 transition-colors hover:bg-amber-50 hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-amber-500 print:hidden"
    >
      <Pencil className="h-3 w-3" />
    </button>
  );
}

function Row({
  row,
  currency,
  saving,
  onEditRow,
  onRateCommit,
}: {
  row: BoqDocumentRow;
  currency: string;
  saving: boolean;
  onEditRow: (row: BoqDocumentRow) => void;
  onRateCommit: (row: BoqDocumentRow, rate: number) => void;
}) {
  if (row.rowType === "spacer") {
    return (
      <tr>
        <td colSpan={7} className="h-2" />
      </tr>
    );
  }

  if (row.rowType === "header") {
    return (
      <tr className="border-b border-slate-50 last:border-b-0">
        <td className="px-4 py-2" />
        <td colSpan={5} className="px-4 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 underline decoration-slate-300 underline-offset-4">
            <Description row={row} />
          </span>
        </td>
        <td className="px-2 py-2 text-right">
          <EditButton onClick={() => onEditRow(row)} />
        </td>
      </tr>
    );
  }

  if (row.rowType === "note") {
    return (
      <tr className="border-b border-slate-50 last:border-b-0">
        <td className="px-4 py-2" />
        <td
          colSpan={5}
          className="px-4 py-2 text-[10px] leading-relaxed text-slate-600"
        >
          <Description row={row} />
        </td>
        <td className="px-2 py-2 text-right">
          <EditButton onClick={() => onEditRow(row)} />
        </td>
      </tr>
    );
  }

  // item
  const priced = row.rate !== null && row.rate !== undefined;

  return (
    <tr
      className={`border-b border-slate-50 align-top transition-colors last:border-b-0 ${
        saving ? "bg-amber-50/40" : "hover:bg-slate-50/40"
      }`}
    >
      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
        {row.itemCode || ""}
      </td>

      <td className="px-4 py-2.5 text-[11px] leading-snug text-slate-700">
        <Description row={row} />
      </td>

      <td className="px-3 py-2.5 text-right text-[10px] text-slate-500 tabular-nums">
        {fmtQty(row.quantity)}
      </td>

      <td className="px-3 py-2.5 text-center text-[10px] text-slate-400">
        {row.unit || "—"}
      </td>

      <td className="w-32 px-3 py-2">
        <RateCell
          value={row.rate}
          currency={currency}
          saving={saving}
          onCommit={(next) => onRateCommit(row, next)}
          ariaLabel={`Rate for item ${row.itemCode ?? row.description}`}
        />
      </td>

      <td className="px-4 py-2.5 text-right text-[11px] font-semibold tabular-nums">
        {priced ? (
          <span className="text-slate-900">{formatCell(row.amount, 0)}</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      <td className="px-2 py-2.5 text-right">
        <EditButton onClick={() => onEditRow(row)} />
      </td>
    </tr>
  );
}

export function SectionBlock({
  section,
  currency,
  savingRowId,
  onEditRow,
  onRateCommit,
  onAddItem,
  onImportCsv,
}: SectionBlockProps) {
  return (
    <section className="border-t border-slate-100 first:border-t-0">
      {section.sectionCode ? (
        <header className="flex items-center gap-2 bg-amber-50/70 px-4 py-2">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-700">
            {section.sectionCode}
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
            {section.title}
          </h3>
        </header>
      ) : (
        section.title && (
          <header className="px-4 py-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
              {section.title}
            </h3>
          </header>
        )
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="w-14 px-4 py-2">Item</th>
              <th className="px-4 py-2">Description</th>
              <th className="w-20 px-3 py-2 text-right">Qty</th>
              <th className="w-16 px-3 py-2 text-center">Unit</th>
              <th className="w-32 px-3 py-2 text-right">Rate</th>
              <th className="w-28 px-4 py-2 text-right">Amount</th>
              <th className="w-9 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <Row
                key={row.rowId}
                row={row}
                currency={currency}
                saving={savingRowId === row.rowId}
                onEditRow={onEditRow}
                onRateCommit={onRateCommit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-4 print:hidden">
          <button
            type="button"
            onClick={() => onAddItem(section)}
            className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            <Plus className="h-3 w-3" />
            Add item
          </button>
          <button
            type="button"
            onClick={() => onImportCsv(section)}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <Upload className="h-3 w-3" />
            Import CSV
          </button>
        </div>

        <p className="text-[10px] text-slate-500">
          Section Total:{" "}
          <span className="font-bold text-amber-600 tabular-nums">
            {formatMoney(section.total, currency)}
          </span>
        </p>
      </footer>
    </section>
  );
}
