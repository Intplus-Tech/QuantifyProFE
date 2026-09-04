"use client";

import { formatMoney } from "./format";
import type { BoqDocumentSummary } from "@/types/boqDocument";

interface GrandSummaryBlockProps {
  summary: BoqDocumentSummary;
  currency: string;
}

export function GrandSummaryBlock({ summary, currency }: GrandSummaryBlockProps) {
  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <header className="border-b border-slate-200 bg-[#dde6f7] px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
          Grand Summary
        </h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="w-16 px-4 py-2">No.</th>
              <th className="px-4 py-2">Element</th>
              <th className="w-48 px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.entries.map((entry) => (
              <tr
                key={entry.groupId}
                className="border-b border-slate-50 transition-colors hover:bg-slate-50/40"
              >
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
                  {entry.elementNo}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-slate-700">
                  {entry.title}
                </td>
                <td className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-900 tabular-nums">
                  {formatMoney(entry.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end px-4 py-4">
        <dl className="w-full max-w-sm space-y-1.5">
          <div className="flex items-baseline justify-between gap-6 border-t border-slate-200 pt-2">
            <dt className="text-[11px] font-semibold text-slate-700">
              Sub-Total
            </dt>
            <dd className="text-[11px] font-semibold text-slate-900 tabular-nums">
              {formatMoney(summary.subTotal, currency)}
            </dd>
          </div>

          {summary.adjustments.map((adj) => (
            <div
              key={adj.label}
              className="flex items-baseline justify-between gap-6"
            >
              <dt className="text-[11px] text-slate-600">
                {adj.label}
                {adj.percentage ? ` (${adj.percentage}%)` : ""}
              </dt>
              <dd className="text-[11px] font-medium text-slate-900 tabular-nums">
                {formatMoney(adj.amount, currency)}
              </dd>
            </div>
          ))}

          <div className="flex items-baseline justify-between gap-6 border-t border-slate-200 pt-2.5">
            <dt className="text-[11px] font-bold text-slate-900">GRAND TOTAL</dt>
            <dd className="text-[12px] font-bold text-amber-600 tabular-nums">
              {formatMoney(summary.grandTotal, currency)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
