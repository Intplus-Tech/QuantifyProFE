"use client";

import { formatAmount } from "./format";
import { summaryRowAmount } from "./totals";
import type { BOQBill, SummaryRow } from "./types";

interface GrandSummaryCardProps {
  rows: SummaryRow[];
  bills: BOQBill[];
  mainBuildingSubTotal: number;
  pageLabel: string;
}

export function GrandSummaryCard({
  rows,
  bills,
  mainBuildingSubTotal,
  pageLabel,
}: GrandSummaryCardProps) {
  return (
    <section className="border-t border-slate-200">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-800">
          Grand Summary ({pageLabel})
        </h2>
        <span className="shrink-0 text-[9px] text-slate-400">
          Master Summary Page
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-slate-100 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="w-20 px-4 py-2">Bill No.</th>
              <th className="px-4 py-2">Element Description</th>
              <th className="w-48 px-4 py-2 text-right">Total Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.billNo}
                className="border-b border-slate-50 transition-colors hover:bg-slate-50/40"
              >
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
                  {row.billNo}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-slate-700">
                  {row.description}
                </td>
                <td className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-900 tabular-nums">
                  {formatAmount(summaryRowAmount(row, bills), 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-[11px] font-bold text-slate-900">
          Main Building Sub-Total
        </span>
        <span className="text-[12px] font-bold text-amber-600 tabular-nums">
          {formatAmount(mainBuildingSubTotal, 2)}
        </span>
      </footer>
    </section>
  );
}
