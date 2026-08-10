"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportPageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta: { icon: ReactNode; label: string }[];
  action?: ReactNode;
}) {
  return (
    <header className="rounded-lg border border-[#dbeef1] bg-white px-5 py-4">
      <div className="flex items-start gap-4">
        <h1 className="min-w-0 flex-1 font-mono text-[15px] font-bold uppercase tracking-wide text-slate-800">
          {title}
        </h1>
        {action}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1.5">
        {meta.map((m) => (
          <span
            key={m.label}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500"
          >
            {m.icon}
            {m.label}
          </span>
        ))}
      </div>
    </header>
  );
}

export interface SummaryTileData {
  label: string;
  value: string;
  hint?: string;
}

export function SummaryTiles({
  title,
  tiles,
}: {
  title?: string;
  tiles: SummaryTileData[];
}) {
  return (
    <section>
      {title && (
        <h2 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {title}
        </h2>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}
      >
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-lg border border-[#dbeef1] bg-white px-4 py-3"
          >
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              {tile.label}
            </p>
            <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-slate-800">
              {tile.value}
              {tile.hint && (
                <span className="ml-1 text-[11px] font-medium text-slate-400">
                  {tile.hint}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionCard({
  title,
  count,
  badges,
  defaultOpen = true,
  collapsible = true,
  children,
}: {
  title: string;
  count?: string;
  badges?: string[];
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-lg border border-[#dbeef1] bg-white">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!collapsible}
        className="flex w-full items-center gap-3 border-l-4 border-amber-500 bg-[#f7fcfd] px-4 py-2.5 text-left transition-colors hover:bg-[#eef8fa] disabled:cursor-default"
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-slate-700">
          {title}
          {count && <span className="ml-1.5 font-normal text-slate-400">{count}</span>}
        </span>
        {badges?.length ? (
          <span className="flex gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500"
              >
                {b}
              </span>
            ))}
          </span>
        ) : null}
        {collapsible && (
          <span className="ml-auto text-slate-400">
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>
      {open && <div className="overflow-x-auto">{children}</div>}
    </section>
  );
}

export function StatusBadge({
  status,
}: {
  status: "valid" | "review" | "rejected";
}) {
  const map = {
    valid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    review: "bg-amber-50 text-amber-700 ring-amber-200",
    rejected: "bg-red-50 text-red-600 ring-red-200",
  } as const;
  const label = { valid: "VALID", review: "REVIEW", rejected: "REJECTED" }[status];

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide ring-1 ${map[status]}`}
    >
      {status === "review" && "⚠ "}
      {label}
    </span>
  );
}

export function ExportButtons({
  onExportPdf,
  onExportExcel,
}: {
  onExportPdf: () => void;
  onExportExcel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPdf}
        className="h-8 gap-1.5 border-[#dbeef1] text-[11px] text-slate-600"
      >
        <FileText className="h-3.5 w-3.5 text-red-500" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportExcel}
        className="h-8 gap-1.5 border-[#dbeef1] text-[11px] text-slate-600"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
        Export Excel
      </Button>
    </div>
  );
}

export const th =
  "px-3 py-2 text-left font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-500 whitespace-nowrap";
export const td = "px-3 py-2 text-[11px] text-slate-700 whitespace-nowrap";
export const tdNum = `${td} text-right tabular-nums`;
export const theadCls = "border-b border-[#dbeef1] bg-[#fbfeff]";
export const trCls = "border-b border-[#eef7f9] last:border-0 hover:bg-[#fafdfe]";
export const totalRowCls = "bg-[#f7fcfd] font-semibold";
