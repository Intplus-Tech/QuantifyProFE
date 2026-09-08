"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileSpreadsheet, Loader2, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetBoqDocumentQuery } from "@/store/api/boqDocumentApi";
import { ElementGroupCard } from "@/components/projects/boq-document/ElementGroupCard";
import { GrandSummaryBlock } from "@/components/projects/boq-document/GrandSummaryBlock";
import { ProjectInfoPanel } from "@/components/projects/boq-document/ProjectInfoPanel";
import { RowEditSheet } from "@/components/projects/boq-document/RowEditSheet";
import {
  BoqDeleteDialog,
  BoqSectionRenameDialog,
} from "@/components/projects/boq-document/BoqDeleteDialogs";
import {
  useBoqDocumentActions,
  type PendingDelete,
} from "@/components/projects/boq-document/useBoqDocumentActions";
import { formatMoney } from "@/components/projects/boq-document/format";
import {
  removeBoqRow,
  removeBoqSection,
  setBoqRowEdit,
  setBoqRowRate,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import type {
  BoqDocument,
  BoqDocumentRow,
  BoqDocumentSection,
  PatchBoqRowRequest,
} from "@/types/boqDocument";
import { useAiTakeoff } from "../useAiTakeoff";
import { deriveBoqDocument } from "./deriveBoqDocument";
import { ReportHeading } from "./ReportHeading";

/**
 * The AI flow's Bill of Quantity, in the elemental boq_v2 layout.
 *
 * Two sources, one rendering. If the server has committed a document for this
 * project it is used, and edits go through the real PATCH. Otherwise the bill
 * is derived from the extraction on screen — the AI takeoff's finish call does
 * not write a server document, and a 404 there used to leave this tab empty
 * after a perfectly good extraction.
 */
export function BillOfQuantityView({ projectId }: { projectId: string }) {
  const { data, isLoading, isFetching, error, refetch } = useGetBoqDocumentQuery(
    projectId,
    { skip: !projectId },
  );

  const {
    groups,
    globalParameters,
    projectMeta,
    details,
    boqRowRates,
    boqRowEdits,
    boqRemovedRows,
    boqRemovedSections,
  } = useSelector((state: RootState) => state.aiFlow);

  // A 404 just means the server has no committed document — expected for an
  // AI takeoff. Anything else is worth mentioning.
  const serverError =
    !!error && (error as { status?: number }).status !== 404;

  const serverDoc = data?.data;
  const hasServerDoc = !!serverDoc && serverDoc.elementGroups.length > 0;

  // Derived locally, then the QS's own rates and wording folded back over it.
  const derivedDoc = useMemo(
    () =>
      applyLocalEdits(
        deriveBoqDocument({
          groups,
          globalParameters,
          projectMeta,
          currency: details.currency || "NGN",
          location: details.location,
          rates: boqRowRates,
        }),
        { edits: boqRowEdits, removedRows: boqRemovedRows, removedSections: boqRemovedSections },
      ),
    [
      groups,
      globalParameters,
      projectMeta,
      details.currency,
      details.location,
      boqRowRates,
      boqRowEdits,
      boqRemovedRows,
      boqRemovedSections,
    ],
  );

  const doc = hasServerDoc ? serverDoc : derivedDoc;

  const serverActions = useBoqDocumentActions(projectId);
  const localActions = useLocalBoqActions();
  const actions = hasServerDoc ? serverActions : localActions;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#dbeef1] bg-white px-5 py-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        Loading the bill of quantities…
      </div>
    );
  }

  // Nothing measured yet is the only genuinely empty case — not a 404, which
  // just means the server has no document and the local bill is standing in.
  if (doc.elementGroups.length === 0) {
    return <NothingMeasuredYet />;
  }

  const { meta, elementGroups, summary } = doc;

  return (
    <>
      <ReportHeading
        prefix="Bill of Quantity"
        action={
          <div className="flex items-center gap-2">
            <SaveStatus status={actions.saveStatus} />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw
                className={`mr-1.5 h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => window.print()}
            >
              <Printer className="mr-1.5 h-3 w-3" />
              Print
            </Button>
          </div>
        }
      />

      {!hasServerDoc && (
        <p className="rounded-lg border border-[#dbeef1] bg-white px-4 py-2.5 text-[11px] leading-relaxed text-slate-600 print:hidden">
          Measured from your extraction. Rates you enter are held on this device
          until the takeoff is committed on the server.
          {serverError && (
            <span className="text-amber-700">
              {" "}
              The server copy couldn&apos;t be reached just now.
            </span>
          )}
        </p>
      )}

      {summary.grandTotal === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] leading-relaxed text-amber-800 print:hidden">
          The quantities are measured, but nothing is priced yet — every rate
          reads as a dash rather than zero. Type a rate straight into the Rate
          column and the totals fill in.
        </p>
      )}

      {/* Project info and the running summary stay beside the bill, as on the
          manual BOQ page — the QS reads the element totals while pricing. */}
      <div className="sm:flex sm:gap-6">
        <ProjectInfoPanel
          meta={meta}
          summary={summary}
          onRefresh={() => void refetch()}
          refreshing={isFetching}
        />

        <div className="min-w-0 flex-1">
          {elementGroups.map((group) => (
            <ElementGroupCard
              key={group.groupId}
              group={group}
              currency={meta.currency}
              savingRowId={actions.savingRowId}
              onEditRow={actions.onEditRow}
              onDeleteRow={actions.onDeleteRow}
              onRateCommit={actions.onRateCommit}
              onAddItem={() => toast.info("Add item — coming soon")}
              onImportCsv={() => toast.info("CSV import — coming soon")}
              onEditSection={actions.onEditSection}
              onDeleteSection={actions.onDeleteSection}
            />
          ))}

          <GrandSummaryBlock summary={summary} currency={meta.currency} />

          <p className="mt-4 border-t border-[#dbeef1] pt-3 text-[10px] text-slate-400 print:hidden">
            Grand total {formatMoney(summary.grandTotal, meta.currency)} ·{" "}
            {hasServerDoc
              ? "committed on the server"
              : "measured from this takeoff"}
          </p>
        </div>
      </div>

      <RowEditSheet
        row={actions.editingRow}
        open={actions.sheetOpen}
        saving={actions.saving}
        onOpenChange={actions.setSheetOpen}
        onSubmit={actions.onRowSubmit}
        onDelete={actions.onDeleteRow}
      />

      <BoqSectionRenameDialog
        section={actions.renamingSection}
        saving={actions.saving}
        onCancel={() => actions.setRenamingSection(null)}
        onSubmit={actions.onSectionRenameSubmit}
      />

      <BoqDeleteDialog
        pending={actions.pendingDelete}
        deleting={actions.deleting}
        onCancel={() => actions.setPendingDelete(null)}
        onConfirm={actions.confirmDelete}
      />
    </>
  );
}

/**
 * Edit and delete against the derived bill.
 *
 * Same shape as useBoqDocumentActions so the view can hold either, but every
 * change lands in Redux rather than a PATCH — there is no server document to
 * address, and firing one would 404.
 */
function useLocalBoqActions() {
  const dispatch = useDispatch();
  const [editingRow, setEditingRow] = useState<BoqDocumentRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [renamingSection, setRenamingSection] =
    useState<BoqDocumentSection | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const flash = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return {
    savingRowId: null as string | null,
    editingRow,
    sheetOpen,
    setSheetOpen,
    renamingSection,
    setRenamingSection,
    pendingDelete,
    setPendingDelete,
    saving: false,
    deleting: false,
    saveStatus,

    onEditRow: (row: BoqDocumentRow) => {
      setEditingRow(row);
      setSheetOpen(true);
    },
    onDeleteRow: (row: BoqDocumentRow) =>
      setPendingDelete({ kind: "row", row }),
    onRateCommit: (row: BoqDocumentRow, rate: number) => {
      dispatch(setBoqRowRate({ rowId: row.rowId, rate }));
      flash();
    },
    onEditSection: setRenamingSection,
    onDeleteSection: (section: BoqDocumentSection) =>
      setPendingDelete({ kind: "section", section }),

    onRowSubmit: (patch: PatchBoqRowRequest) => {
      if (!editingRow) return;
      dispatch(setBoqRowEdit({ rowId: editingRow.rowId, changes: patch }));
      toast.success("Item updated");
      setSheetOpen(false);
      flash();
    },

    onSectionRenameSubmit: (title: string) => {
      const heading = renamingSection?.rows[0];
      if (heading) {
        dispatch(
          setBoqRowEdit({ rowId: heading.rowId, changes: { descriptionLeadIn: title } }),
        );
      }
      setRenamingSection(null);
      flash();
    },

    confirmDelete: () => {
      if (!pendingDelete) return;
      if (pendingDelete.kind === "row") {
        dispatch(removeBoqRow(pendingDelete.row.rowId));
        toast.success("Item removed");
        setSheetOpen(false);
      } else {
        dispatch(removeBoqSection(pendingDelete.section.sectionId));
        toast.success("Section removed");
      }
      setPendingDelete(null);
      flash();
    },
  };
}

/** Fold the QS's own wording and removals over a freshly derived document. */
function applyLocalEdits(
  doc: BoqDocument,
  {
    edits,
    removedRows,
    removedSections,
  }: {
    edits: Record<string, Partial<BoqDocumentRow>>;
    removedRows: string[];
    removedSections: string[];
  },
): BoqDocument {
  const goneRows = new Set(removedRows);
  const goneSections = new Set(removedSections);

  const elementGroups = doc.elementGroups
    .map((group) => {
      const sections = group.sections
        .filter((section) => !goneSections.has(section.sectionId))
        .map((section) => {
          const rows = section.rows
            .filter((row) => !goneRows.has(row.rowId))
            .map((row) => {
              const edit = edits[row.rowId];
              if (!edit) return row;
              const merged = { ...row, ...edit };
              // Amount is always quantity x rate, never taken from an edit.
              merged.amount =
                merged.rate == null || merged.quantity == null
                  ? null
                  : Number((merged.rate * merged.quantity).toFixed(2));
              return merged;
            });
          const total = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
          return { ...section, rows, total };
        })
        .filter((section) => section.rows.length > 0);

      const total = sections.reduce((sum, section) => sum + section.total, 0);
      return { ...group, sections, total };
    })
    .filter((group) => group.sections.length > 0)
    // elementNo renumbers whenever a group drops out.
    .map((group, index) => ({ ...group, elementNo: index + 1 }));

  const subTotal = elementGroups.reduce((sum, group) => sum + group.total, 0);

  return {
    ...doc,
    elementGroups,
    summary: {
      entries: elementGroups.map((group) => ({
        groupId: group.groupId,
        elementNo: group.elementNo,
        title: group.title,
        amount: group.total,
      })),
      subTotal,
      adjustments: doc.summary.adjustments,
      grandTotal: subTotal,
    },
  };
}

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] ${
        status === "saving" ? "text-amber-600" : "text-emerald-600"
      }`}
    >
      {status === "saving" ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </>
      ) : (
        "Saved"
      )}
    </span>
  );
}

/** No elements have been extracted and accepted, so there is nothing to bill. */
function NothingMeasuredYet() {
  const { session } = useAiTakeoff();

  return (
    <div className="rounded-lg border border-[#dbeef1] bg-white px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
        <FileSpreadsheet className="h-6 w-6 text-amber-500" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        Nothing to bill yet
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
        {session.sessionId
          ? "The elements extracted so far have no dimensions to price. Open the Overview, fill in what the drawing shows, and the bill builds itself."
          : "Extract some elements on the drawing first — the bill is measured from them."}
      </p>
    </div>
  );
}
