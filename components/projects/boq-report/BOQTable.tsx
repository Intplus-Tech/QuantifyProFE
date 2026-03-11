"use client";

import type { BOQSection } from "./types";

interface BOQTableProps {
  sections: BOQSection[];
  grandTotal: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function BOQTable({ sections, grandTotal }: BOQTableProps) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left border-collapse">
          {/* Table Header */}
          <thead className="bg-[#fcfdfd] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider w-20">Item</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider w-24">Unit</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider w-24">Qty</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider w-32">Rate ($)</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-800 uppercase tracking-wider w-40">Total ($)</th>
            </tr>
          </thead>

          <tbody>
            {sections.map((section) => (
              <Section key={section.id} section={section} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total Footer */}
      <div className="bg-amber-500 p-5 px-6 flex justify-between items-center text-white">
        <span className="font-bold flex-1 text-right pr-6 uppercase tracking-wider text-xl">Grand Total Project Cost:</span>
        <span className="font-bold text-2xl w-40 text-right">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}

function Section({ section }: { section: BOQSection }) {
  return (
    <>
      {/* Section Title Row */}
      <tr className="bg-amber-50/30 border-y border-amber-100/50">
        <td colSpan={6} className="px-6 py-3">
          <span className="text-sm font-bold text-amber-500 uppercase tracking-wider">
            {section.title.replace(/^\d+\.\d+\s*-\s*/, match => match.replace('-', '').trim() + ' ')}
          </span>
        </td>
      </tr>

      {/* Line Items */}
      {section.items.map((item) => (
        <tr
          key={item.item}
          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
        >
          <td className="px-6 py-4 text-slate-500 font-medium">{item.item}</td>
          <td className="px-6 py-4 text-slate-700">{item.description}</td>
          <td className="px-6 py-4 text-center text-slate-700">{item.unit}</td>
          <td className="px-6 py-4 text-center text-slate-700 tabular-nums">
            {formatNumber(item.qty)}
          </td>
          <td className="px-6 py-4 text-center text-slate-700 tabular-nums">
            {formatDecimal(item.rate)}
          </td>
          <td className="px-6 py-4 text-right text-slate-900 tabular-nums">
            {formatDecimal(item.total)}
          </td>
        </tr>
      ))}

      {/* Subtotal Row */}
      <tr className="border-b border-slate-200">
        <td colSpan={5} className="px-6 py-4 text-right text-sm font-semibold text-slate-500">
          Sub-total {section.title.split('-')[1]?.trim() || section.title.split(' ')[1]}:
        </td>
        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">
          {formatCurrency(section.subtotal)}
        </td>
      </tr>
    </>
  );
}
