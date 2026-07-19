"use client";

import { formatNaira } from "./format";
import type { DocumentTotals } from "./totals";

interface GrandTotalCardProps {
  totals: DocumentTotals;
  contingencyRate: number;
  vatRate: number;
}

function Line({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "subtotal" | "grand";
}) {
  const isRule = variant === "subtotal" || variant === "grand";

  return (
    <div
      className={`flex items-baseline justify-between gap-6 ${
        isRule ? "mt-2 border-t border-slate-200 pt-2.5" : ""
      }`}
    >
      <dt
        className={`text-[11px] ${
          isRule ? "font-bold text-slate-900" : "text-slate-600"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`text-[11px] tabular-nums ${
          isRule ? "font-bold text-amber-600" : "font-medium text-slate-900"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function GrandTotalCard({
  totals,
  contingencyRate,
  vatRate,
}: GrandTotalCardProps) {
  const pct = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;

  return (
    <section className="border-t border-slate-200 p-4">
      <div className="overflow-hidden rounded-xl border border-blue-200/70 bg-[#eef1fb]">
        <header className="border-b border-blue-200/60 bg-[#dde6f7] px-5 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
            Grand Total Summary
          </h2>
        </header>

        <div className="flex justify-end px-5 py-5">
          <dl className="w-full max-w-md">
            <Line
              label="Main Building"
              value={formatNaira(totals.mainBuilding, 0)}
            />
            <Line
              label="Preliminaries (Bill 1)"
              value={formatNaira(totals.preliminaries, 0)}
            />
            <Line
              label="External Works"
              value={`${formatNaira(totals.externalWorks, 0)} (Provisional)`}
            />
            <Line
              label="Sub-Total"
              value={formatNaira(totals.subTotal, 0)}
              variant="subtotal"
            />
            <Line
              label={`Contingency (${pct(contingencyRate)})`}
              value={formatNaira(totals.contingency, 0)}
            />
            <Line
              label={`VAT (${pct(vatRate)})`}
              value={formatNaira(totals.vat, 0)}
            />
            <Line
              label="GRAND TOTAL"
              value={formatNaira(totals.grandTotal, 0)}
              variant="grand"
            />
          </dl>
        </div>
      </div>
    </section>
  );
}
