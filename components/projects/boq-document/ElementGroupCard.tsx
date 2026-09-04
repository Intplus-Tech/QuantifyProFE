"use client";

import { SectionBlock } from "./SectionBlock";
import { formatMoney } from "./format";
import type {
  BoqDocumentRow,
  BoqDocumentSection,
  BoqElementGroup,
} from "@/types/boqDocument";

interface ElementGroupCardProps {
  group: BoqElementGroup;
  currency: string;
  savingRowId: string | null;
  onEditRow: (row: BoqDocumentRow) => void;
  onRateCommit: (row: BoqDocumentRow, rate: number) => void;
  onAddItem: (section: BoqDocumentSection) => void;
  onImportCsv: (section: BoqDocumentSection) => void;
}

export function ElementGroupCard({
  group,
  currency,
  savingRowId,
  onEditRow,
  onRateCommit,
  onAddItem,
  onImportCsv,
}: ElementGroupCardProps) {
  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-[#eef1fb] px-4 py-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Element No. {group.elementNo}
          </p>
          <h2 className="mt-0.5 text-[12px] font-bold uppercase tracking-wide text-slate-800">
            {group.title}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Element Total
          </p>
          <p className="mt-0.5 text-[12px] font-bold text-amber-600 tabular-nums">
            {formatMoney(group.total, currency)}
          </p>
        </div>
      </header>

      {group.sections.map((section) => (
        <SectionBlock
          key={section.sectionId}
          section={section}
          currency={currency}
          savingRowId={savingRowId}
          onEditRow={onEditRow}
          onRateCommit={onRateCommit}
          onAddItem={onAddItem}
          onImportCsv={onImportCsv}
        />
      ))}
    </section>
  );
}
