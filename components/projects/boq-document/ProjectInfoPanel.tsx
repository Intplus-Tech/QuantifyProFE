"use client";

import { formatNaira } from "./format";
import type { ProjectInfo, QuickSummaryRow } from "./types";

interface ProjectInfoPanelProps {
  info: ProjectInfo;
  quickSummary: QuickSummaryRow[];
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

export function ProjectInfoPanel({ info, quickSummary }: ProjectInfoPanelProps) {
  return (
    <aside className="mb-5 w-full shrink-0 sm:float-left sm:mr-6 sm:w-[190px]">
      <section>
        <h2 className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Project Info
        </h2>
        <div className="space-y-3">
          <InfoField label="Client" value={info.client} />
          <InfoField label="Location" value={info.location} />
          <InfoField label="Prepared by" value={info.preparedBy} />
          <InfoField label="Date" value={info.date} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Quick Summary
        </h2>
        <dl className="space-y-1.5">
          {quickSummary.map((row) => (
            <div
              key={row.label}
              className={`flex items-baseline justify-between gap-2 ${
                row.emphasis === "grand"
                  ? "mt-2 border-t border-slate-200 pt-2"
                  : ""
              }`}
            >
              <dt
                className={`text-[10px] ${
                  row.emphasis === "grand"
                    ? "font-bold text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {row.label}
              </dt>
              <dd
                className={`shrink-0 text-right tabular-nums ${
                  row.emphasis === "grand"
                    ? "text-[10px] font-bold text-amber-600"
                    : "text-[10px] font-semibold text-slate-700"
                }`}
              >
                {formatNaira(row.amount, 0)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
}
