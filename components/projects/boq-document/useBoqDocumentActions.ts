"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteBoqDocumentRowMutation,
  useDeleteBoqDocumentSectionMutation,
  usePatchBoqDocumentRowMutation,
} from "@/store/api/boqDocumentApi";
import type {
  BoqDocumentRow,
  BoqDocumentSection,
  PatchBoqRowRequest,
} from "@/types/boqDocument";

export type BoqSaveStatus = "idle" | "saving" | "saved";

/** What the confirm dialog is being asked to remove. */
export type PendingDelete =
  | { kind: "row"; row: BoqDocumentRow }
  | { kind: "section"; section: BoqDocumentSection };

/**
 * Editing and deleting BOQ rows and sections, shared by the manual document
 * page and the AI report's Bill of Quantity tab so the two behave identically.
 *
 * A PATCH or DELETE answers with the whole retotalled document — every total
 * above the row has moved — and the API layer swaps the cache for it, so
 * nothing here patches a row in place.
 */
export function useBoqDocumentActions(projectId: string) {
  const [patchRow, { isLoading: patching }] = usePatchBoqDocumentRowMutation();
  const [deleteRow, { isLoading: deletingRow }] = useDeleteBoqDocumentRowMutation();
  const [deleteSection, { isLoading: deletingSection }] =
    useDeleteBoqDocumentSectionMutation();

  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<BoqDocumentRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [renamingSection, setRenamingSection] =
    useState<BoqDocumentSection | null>(null);
  const [saveStatus, setSaveStatus] = useState<BoqSaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (patching || deletingRow || deletingSection) setSaveStatus("saving");
  }, [patching, deletingRow, deletingSection]);

  const flashSaved = useCallback(() => {
    setSaveStatus("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2500);
  }, []);

  /** One place to turn an HTTP status into something a QS can act on. */
  const explain = (status: number | undefined, action: string) => {
    if (status === 403) return "You don't have permission to change this BOQ.";
    if (status === 404) return `This ${action} no longer exists — refresh the BOQ.`;
    if (status === 400)
      return "That value was rejected — check the limits and try again.";
    // The boq_v2 contract documents GET, PATCH row and GET materials only, so
    // a delete can legitimately reach a server that has no route for it.
    if (status === 405 || status === 501)
      return `Deleting a ${action} isn't supported by the server yet.`;
    return `Couldn't save the change. Try again.`;
  };

  const runPatch = useCallback(
    async (rowId: string, body: PatchBoqRowRequest) => {
      setSavingRowId(rowId);
      try {
        await patchRow({ projectId, rowId, body }).unwrap();
        flashSaved();
        return true;
      } catch (err: unknown) {
        toast.error(explain((err as { status?: number })?.status, "row"));
        setSaveStatus("idle");
        return false;
      } finally {
        setSavingRowId(null);
      }
    },
    [patchRow, projectId, flashSaved],
  );

  const handleRateCommit = useCallback(
    (row: BoqDocumentRow, rate: number) => void runPatch(row.rowId, { rate }),
    [runPatch],
  );

  const handleEditRow = useCallback((row: BoqDocumentRow) => {
    setEditingRow(row);
    setSheetOpen(true);
  }, []);

  const handleRowSubmit = useCallback(
    async (patch: PatchBoqRowRequest) => {
      if (!editingRow) return;
      if (await runPatch(editingRow.rowId, patch)) {
        toast.success("Item updated");
        setSheetOpen(false);
      }
    },
    [editingRow, runPatch],
  );

  /** Renaming a section is a PATCH of its first row's lead-in heading. */
  const handleSectionRenameSubmit = useCallback(
    async (title: string) => {
      const section = renamingSection;
      const heading = section?.rows.find(
        (row) => row.rowType === "header" || row.rowType === "item",
      );
      if (!section || !heading) {
        setRenamingSection(null);
        return;
      }
      if (await runPatch(heading.rowId, { descriptionLeadIn: title })) {
        toast.success("Section updated");
        setRenamingSection(null);
      }
    },
    [renamingSection, runPatch],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    try {
      if (pendingDelete.kind === "row") {
        await deleteRow({ projectId, rowId: pendingDelete.row.rowId }).unwrap();
        toast.success("Item deleted");
        setSheetOpen(false);
      } else {
        await deleteSection({
          projectId,
          sectionId: pendingDelete.section.sectionId,
        }).unwrap();
        toast.success("Section deleted");
      }
      flashSaved();
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(
        explain(
          (err as { status?: number })?.status,
          pendingDelete.kind === "row" ? "item" : "section",
        ),
      );
      setSaveStatus("idle");
    }
  }, [pendingDelete, deleteRow, deleteSection, projectId, flashSaved]);

  return {
    // table wiring
    savingRowId,
    onEditRow: handleEditRow,
    onDeleteRow: (row: BoqDocumentRow) => setPendingDelete({ kind: "row", row }),
    onRateCommit: handleRateCommit,
    onEditSection: setRenamingSection,
    onDeleteSection: (section: BoqDocumentSection) =>
      setPendingDelete({ kind: "section", section }),

    // edit sheet
    editingRow,
    sheetOpen,
    setSheetOpen,
    onRowSubmit: handleRowSubmit,

    // rename dialog
    renamingSection,
    setRenamingSection,
    onSectionRenameSubmit: handleSectionRenameSubmit,

    // delete confirmation
    pendingDelete,
    setPendingDelete,
    confirmDelete,

    saving: patching || deletingRow || deletingSection,
    deleting: deletingRow || deletingSection,
    saveStatus,
  };
}
