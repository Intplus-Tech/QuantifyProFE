"use client";

import { RotateCcw } from "lucide-react";
import { formatMoney } from "./format";
import type { BoqDocumentMeta, BoqDocumentSummary } from "@/types/boqDocument";

interface ProjectInfoPanelProps {
  meta: BoqDocumentMeta;
  summary: BoqDocumentSummary;
  onRefresh: () => void;
  refreshing?: boolean;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-[10px] leading-snug text-slate-700">{value}</p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "grand" | "subtotal" | "muted";
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-2 ${
        emphasis === "grand" || emphasis === "subtotal"
          ? "mt-1.5 border-t border-slate-200 pt-1.5"
          : ""
      }`}
    >
      <dt
        className={`text-[10px] ${
          emphasis === "grand"
            ? "font-bold text-slate-900"
            : emphasis === "subtotal"
              ? "font-semibold text-slate-700"
              : emphasis === "muted"
                ? "text-slate-400"
                : "text-slate-500"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`shrink-0 text-right tabular-nums ${
          emphasis === "grand"
            ? "text-[10px] font-bold text-amber-600"
            : "text-[10px] font-semibold text-slate-700"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function ProjectInfoPanel({
  meta,
  summary,
  onRefresh,
  refreshing,
}: ProjectInfoPanelProps) {
  return (
    <aside className="mb-5 w-full shrink-0 sm:mb-0 sm:w-[200px]">
      <section>
        <h2 className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Project Info
        </h2>
        <div className="space-y-3">
          <InfoField label="Client" value={meta.clientName || "—"} />
          <InfoField label="Location" value={meta.location || "—"} />
          <InfoField label="Prepared by" value={meta.preparedBy || "—"} />
          <InfoField label="Date" value={formatDate(meta.preparedAt)} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Quick Summary
        </h2>
        <dl className="space-y-1.5">
          {summary.entries.map((entry) => (
            <SummaryLine
              key={entry.groupId}
              label={entry.title}
              value={formatMoney(entry.amount, meta.currency)}
            />
          ))}

          <SummaryLine
            label="Sub-Total"
            value={formatMoney(summary.subTotal, meta.currency)}
            emphasis="subtotal"
          />

          {summary.adjustments.map((adj) => (
            <SummaryLine
              key={adj.label}
              label={`${adj.label}${
                adj.percentage ? ` (${adj.percentage}%)` : ""
              }`}
              value={formatMoney(adj.amount, meta.currency)}
              emphasis="muted"
            />
          ))}

          <SummaryLine
            label="Grand Total"
            value={formatMoney(summary.grandTotal, meta.currency)}
            emphasis="grand"
          />
        </dl>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50 print:hidden"
        >
          <RotateCcw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </section>
    </aside>
  );
}
