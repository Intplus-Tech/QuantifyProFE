"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setActivePage, setGlobalParameter } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { computeElementQuantities, fmt } from "../calc";
import { SOIL_TYPES } from "../mock-data";
import { QuickEditModal } from "../extract/QuickEditModal";
import {
  SectionCard,
  StatusBadge,
  td,
  tdNum,
  th,
  theadCls,
  trCls,
} from "../shared/ReportPrimitives";
import type { ExtractedElement, PageStatus } from "../types";

const PAGE_STATUS_STYLES: Record<PageStatus, string> = {
  processed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  review: "border-amber-300 bg-amber-50 text-amber-700",
  current: "border-slate-800 bg-slate-800 text-white",
  pending: "border-slate-200 bg-white text-slate-400",
};

const PAGE_STATUS_MARK: Record<PageStatus, string> = {
  processed: "✓",
  review: "⚠",
  current: "◉",
  pending: "⧗",
};

const LEGEND: { status: PageStatus; label: string }[] = [
  { status: "processed", label: "Processed" },
  { status: "review", label: "Needs Review" },
  { status: "current", label: "Current" },
  { status: "pending", label: "Pending" },
];

export function OverviewView() {
  const dispatch = useDispatch();
  const { groups, pages, globalParameters, projectMeta, activePage } = useSelector(
    (state: RootState) => state.aiFlow,
  );

  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  const quickEditElement =
    groups.flatMap((g) => g.elements).find((e) => e.id === quickEditId) ?? null;

  const totals = useMemo(() => {
    let concrete = 0;
    let rebar = 0;
    let excavation = 0;

    for (const group of groups) {
      for (const element of group.elements) {
        if (element.status === "rejected") continue;
        const q = computeElementQuantities(element.dimensions, globalParameters);
        concrete += q.concrete;
        rebar += q.rebar;
        excavation += q.excavation;
      }
    }

    return { concrete, rebar, excavation };
  }, [groups, globalParameters]);

  return (
    <>
      <header>
        <h1 className="text-[19px] font-bold text-slate-800">
          All Extractions: {projectMeta.subject}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Review and validate structural element extractions across all blueprint
          pages.
        </p>
      </header>

      {/* Page chips */}
      <section className="rounded-lg border border-[#dbeef1] bg-white px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {pages.map((page) => (
            <button
              key={page.number}
              type="button"
              onClick={() => dispatch(setActivePage(page.number))}
              aria-current={page.number === activePage}
              className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                PAGE_STATUS_STYLES[page.status]
              }`}
            >
              Pg{page.number} {PAGE_STATUS_MARK[page.status]}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
          {LEGEND.map((item) => (
            <span
              key={item.status}
              className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-slate-400"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  item.status === "processed"
                    ? "bg-emerald-500"
                    : item.status === "review"
                      ? "bg-amber-500"
                      : item.status === "current"
                        ? "bg-slate-800"
                        : "bg-slate-300"
                }`}
              />
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Global parameters */}
      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-[#dbeef1] bg-white px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
          Global Parameters
        </span>

        <div className="ml-auto flex flex-wrap items-end gap-4">
          <ParamField
            label="Working Space"
            value={globalParameters.workingSpace}
            onCommit={(workingSpace) => dispatch(setGlobalParameter({ workingSpace }))}
          />
          <ParamField
            label="Blinding"
            value={globalParameters.blinding}
            onCommit={(blinding) => dispatch(setGlobalParameter({ blinding }))}
          />
          <ParamField
            label="Concrete Cover"
            value={globalParameters.concreteCover}
            onCommit={(concreteCover) => dispatch(setGlobalParameter({ concreteCover }))}
          />

          <div className="space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
              Soil Type
            </p>
            <Select
              value={globalParameters.soilType}
              onValueChange={(soilType) => dispatch(setGlobalParameter({ soilType }))}
            >
              <SelectTrigger className="h-8 w-[140px] border-[#bfe3e8] bg-[#f2fbfc] text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOIL_TYPES.map((soil) => (
                  <SelectItem key={soil} value={soil} className="text-xs">
                    {soil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Element groups */}
      {groups.map((group) => (
        <SectionCard
          key={group.measureTypeId}
          title={group.title}
          count={`(${group.elements.length} DETECTED ACROSS ${group.pageRange})`}
        >
          <table className="w-full min-w-[820px]">
            <thead className={theadCls}>
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Grid</th>
                <th className={th}>Dimensions (L×W×D)</th>
                <th className={th}>Page/Source</th>
                <th className={th}>Confidence</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Concrete Vol (m³)</th>
              </tr>
            </thead>
            <tbody>
              {group.elements.map((element) => (
                <ElementRow
                  key={element.id}
                  element={element}
                  onOpen={() => setQuickEditId(element.id)}
                />
              ))}
            </tbody>
          </table>
        </SectionCard>
      ))}

      {/* Totals */}
      <footer className="sticky bottom-0 flex flex-wrap justify-center gap-x-10 gap-y-1.5 rounded-lg border border-[#dbeef1] bg-white/95 px-4 py-2.5 backdrop-blur">
        <TotalStat label="Total Concrete" value={`${fmt(totals.concrete)} m³`} />
        <TotalStat label="Total Rebar" value={`${fmt(totals.rebar / 1000)} Tons`} />
        <TotalStat label="Total Excavation" value={`${fmt(totals.excavation)} m³`} />
      </footer>

      <QuickEditModal element={quickEditElement} onClose={() => setQuickEditId(null)} />
    </>
  );
}

function ElementRow({
  element,
  onOpen,
}: {
  element: ExtractedElement;
  onOpen: () => void;
}) {
  const globalParameters = useSelector(
    (state: RootState) => state.aiFlow.globalParameters,
  );

  const { length, width, depth } = element.dimensions;
  const dims = [length, width, depth]
    .map((v) => (v === null ? "?" : String(v)))
    .join(" × ");

  const complete = length !== null && width !== null && depth !== null;
  const quantities = computeElementQuantities(element.dimensions, globalParameters);

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`${trCls} cursor-pointer ${
        element.status === "review"
          ? "bg-amber-50/50"
          : element.status === "rejected"
            ? "opacity-50"
            : ""
      }`}
    >
      <td className={`${td} font-mono font-semibold`}>{element.id}</td>
      <td className={td}>{element.grid}</td>
      <td className={`${td} tabular-nums`}>{dims}</td>
      <td className={td}>
        <span className="text-sky-600 underline decoration-dotted underline-offset-2">
          {element.source}
        </span>
      </td>
      <td className={`${td} tabular-nums`}>
        <span
          className={
            element.confidence >= 90
              ? "text-slate-700"
              : element.confidence >= 80
                ? "text-amber-600"
                : "text-red-500"
          }
        >
          {element.confidence}%
        </span>
      </td>
      <td className={td}>
        <StatusBadge status={element.status} />
      </td>
      <td className={tdNum}>
        {complete ? (
          fmt(quantities.concrete)
        ) : (
          <span className="text-[10px] text-amber-600">
            {element.note ?? "Pending"}
          </span>
        )}
      </td>
    </tr>
  );
}

function ParamField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (next: number) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <div className="inline-flex h-8 items-center gap-1 rounded-md border border-[#bfe3e8] bg-[#f2fbfc] px-2 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100">
        <input
          inputMode="numeric"
          aria-label={label}
          defaultValue={value}
          key={value}
          onBlur={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next) && next !== value) onCommit(next);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-14 bg-transparent text-[11px] tabular-nums outline-none"
        />
        <span className="text-[10px] text-slate-400">mm</span>
      </div>
    </div>
  );
}

function TotalStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
      {label}:{" "}
      <span className="font-semibold tabular-nums text-slate-800">{value}</span>
    </span>
  );
}
