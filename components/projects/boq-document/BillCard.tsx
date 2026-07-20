"use client";

import { SubsectionTable } from "./SubsectionTable";
import type { BOQBill, BOQItem } from "./types";

interface BillCardProps {
  bill: BOQBill;
  activeItemId: string | null;
  onEditItem: (itemId: string) => void;
  onUpdateItem: (updated: BOQItem) => void;
  onAddItem: (subsectionId: string) => void;
  onImportCsv: (subsectionId: string) => void;
}

/** A bill is a section inside the single document card — not a card of its own. */
export function BillCard({
  bill,
  activeItemId,
  onEditItem,
  onUpdateItem,
  onAddItem,
  onImportCsv,
}: BillCardProps) {
  return (
    <section className="border-t border-slate-200 first:border-t-0">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-800">
          {bill.title ? `${bill.code} — ${bill.title}` : bill.code}
        </h2>
        {bill.pageLabel && (
          <span className="shrink-0 text-[9px] text-slate-400">
            {bill.pageLabel}
          </span>
        )}
      </header>

      {bill.subsections.map((subsection) => (
        <SubsectionTable
          key={subsection.id}
          subsection={subsection}
          activeItemId={activeItemId}
          onEditItem={onEditItem}
          onUpdateItem={onUpdateItem}
          onAddItem={onAddItem}
          onImportCsv={onImportCsv}
        />
      ))}
    </section>
  );
}
