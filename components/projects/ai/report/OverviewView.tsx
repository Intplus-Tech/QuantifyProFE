"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ban, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MEASURE_TYPES, SOIL_TYPES } from "../mock-data";
import { summariseNotes } from "../humanise";
import { QuickEditModal } from "../extract/QuickEditModal";
import { useAiTakeoff } from "../useAiTakeoff";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { session, reviewDetections, isReviewing, jobs } = useAiTakeoff();

  // Working space, blinding, cover and soil only feed excavation and blinding,
  // which exist for below-ground elements. No foundations, nothing to set.
  const hasFoundationElements = useMemo(
    () =>
      groups.some((group) =>
        group.elements.some(
          (element) =>
            MEASURE_TYPES.find((m) => m.id === element.measureTypeId)?.group ===
            "foundations",
        ),
      ),
    [groups],
  );

  // Newest completed run's observations about the page as a whole, rewritten
  // out of the pipeline's own vocabulary before a surveyor reads it.
  const lastNotes = summariseNotes(
    [...jobs].reverse().find((job) => job.status === "completed" && job.notes)?.notes,
    400,
  );

  const quickEditElement =
    groups.flatMap((g) => g.elements).find((e) => e.id === quickEditId) ?? null;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (elements: ExtractedElement[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const element of elements) {
        if (checked) next.add(element.id);
        else next.delete(element.id);
      }
      return next;
    });

  /**
   * Step 6 of the takeoff flow — bulk accept/reject.
   * The ids are the elements' clientIds, which is what the review endpoint keys on.
   */
  const submitReview = async (status: "accepted" | "rejected") => {
    const clientIds = [...selected];
    if (clientIds.length === 0) return;
    await reviewDetections(clientIds, status);
    setSelected(new Set());
  };

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

      {/* Global parameters — only meaningful once something below ground has
          been extracted, since they drive excavation and blinding alone. */}
      {hasFoundationElements && (
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
      )}

      {/* Bulk review — only meaningful against a live session */}
      {session.sessionId && selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/95 px-4 py-2.5 backdrop-blur">
          <p className="text-xs font-medium text-amber-900">
            {selected.size} element{selected.size === 1 ? "" : "s"} selected
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-red-200 text-[11px] text-red-600 hover:bg-red-50"
              disabled={isReviewing}
              onClick={() => submitReview("rejected")}
            >
              <Ban className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-[11px]"
              disabled={isReviewing}
              onClick={() => submitReview("accepted")}
            >
              <Check className="h-3.5 w-3.5" />
              {isReviewing ? "Saving…" : "Accept"}
            </Button>
          </div>
        </div>
      )}

      {/* Nothing detected yet — surface what the model actually reported */}
      {session.sessionId && groups.length === 0 && (
        <div className="rounded-lg border border-[#dbeef1] bg-white px-5 py-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            No elements extracted yet
          </p>
          {lastNotes.short ? (
            <p className="mx-auto mt-2 max-w-2xl break-words text-xs leading-relaxed text-slate-500">
              <span className="font-medium text-slate-600">What we saw on this page: </span>
              {lastNotes.short}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Go back to the drawing, pick a page with the relevant plan or
              schedule, choose the element types and run Extract.
            </p>
          )}
        </div>
      )}

      {/* Element groups */}
      {groups.map((group) => (
        <SectionCard
          key={group.measureTypeId}
          title={group.title}
          count={`(${group.elements.length} DETECTED ACROSS ${group.pageRange})`}
        >
          <table className="w-full min-w-[880px]">
            <thead className={theadCls}>
              <tr>
                <th className={`${th} w-8`}>
                  <input
                    type="checkbox"
                    aria-label={`Select all in ${group.title}`}
                    className="h-3.5 w-3.5 accent-amber-500"
                    checked={
                      group.elements.length > 0 &&
                      group.elements.every((e) => selected.has(e.id))
                    }
                    onChange={(event) => toggleGroup(group.elements, event.target.checked)}
                  />
                </th>
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
                  selected={selected.has(element.id)}
                  onSelect={() => toggleOne(element.id)}
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
  selected,
  onSelect,
  onOpen,
}: {
  element: ExtractedElement;
  selected: boolean;
  onSelect: () => void;
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
      <td className={td} onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          aria-label={`Select ${element.id}`}
          className="h-3.5 w-3.5 accent-amber-500"
          checked={selected}
          onChange={onSelect}
        />
      </td>
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
