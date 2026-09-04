"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import {
  useGetBoqDocumentQuery,
  usePatchBoqDocumentRowMutation,
} from "@/store/api/boqDocumentApi";
import { BOQTopBar } from "./BOQTopBar";
import { BOQDocumentHeader } from "./BOQDocumentHeader";
import { ProjectInfoPanel } from "./ProjectInfoPanel";
import { ElementGroupCard } from "./ElementGroupCard";
import { GrandSummaryBlock } from "./GrandSummaryBlock";
import { RowEditSheet } from "./RowEditSheet";
import { BOQDocumentLoading } from "./BOQDocumentLoading";
import { BOQDocumentEmpty } from "./BOQDocumentEmpty";
import type { BoqDocumentRow, PatchBoqRowRequest } from "@/types/boqDocument";

interface BOQDocumentViewProps {
  projectId: string;
  basePath?: string;
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BOQDocumentView({
  projectId,
  basePath = "/projects",
}: BOQDocumentViewProps) {
  const { data, isLoading, isFetching, error, refetch } = useGetBoqDocumentQuery(
    projectId,
    { skip: !projectId },
  );
  // Only needed to route AI projects to their own BOQ (Project Audit report).
  const { data: projectRes } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const project = projectRes?.data;
  const [patchRow, { isLoading: patching }] = usePatchBoqDocumentRowMutation();

  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<BoqDocumentRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  useEffect(() => {
    if (patching) setSaveStatus("saving");
  }, [patching]);

  const flashSaved = useCallback(() => {
    setSaveStatus("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2500);
  }, []);

  const workspaceHref = `${basePath}/${projectId}`;
  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";

  const runPatch = useCallback(
    async (rowId: string, body: PatchBoqRowRequest) => {
      setSavingRowId(rowId);
      try {
        await patchRow({ projectId, rowId, body }).unwrap();
        flashSaved();
        return true;
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        const message =
          status === 403
            ? "You don't have permission to edit this BOQ."
            : status === 404
              ? "This row no longer exists — refresh the BOQ."
              : status === 400
                ? "That value was rejected — check the limits and try again."
                : "Couldn't save the change. Try again.";
        toast.error(message);
        setSaveStatus("idle");
        return false;
      } finally {
        setSavingRowId(null);
      }
    },
    [patchRow, projectId, flashSaved],
  );

  const handleRateCommit = useCallback(
    (row: BoqDocumentRow, rate: number) => {
      void runPatch(row.rowId, { rate });
    },
    [runPatch],
  );

  const handleEditRow = useCallback((row: BoqDocumentRow) => {
    setEditingRow(row);
    setSheetOpen(true);
  }, []);

  const handleRowSubmit = useCallback(
    async (patch: PatchBoqRowRequest) => {
      if (!editingRow) return;
      const ok = await runPatch(editingRow.rowId, patch);
      if (ok) {
        toast.success("Row updated");
        setSheetOpen(false);
      }
    },
    [editingRow, runPatch],
  );

  const notImplemented = (label: string) => () =>
    toast.info(`${label} — coming soon`);

  if (isLoading) return <BOQDocumentLoading />;

  if (error) {
    const status = (error as { status?: number }).status;
    return (
      <BOQDocumentEmpty
        variant={status === 404 ? "no-boq" : "error"}
        workspaceHref={workspaceHref}
        projectId={projectId}
      />
    );
  }

  const doc = data?.data;
  if (!doc || doc.elementGroups.length === 0) {
    // An AI project keeps its Bill of Quantity under the Project Audit report;
    // forward there rather than showing the manual empty state.
    if (project?.processingMode === "ai") {
      return <AiBoqRedirect basePath={basePath} projectId={projectId} />;
    }
    return (
      <BOQDocumentEmpty variant="no-boq" workspaceHref={workspaceHref} />
    );
  }

  const { meta, elementGroups, summary } = doc;

  return (
    <div className="flex h-screen flex-col bg-white">
      <BOQTopBar
        workspaceHref={workspaceHref}
        dashboardHref={dashboardHref}
        saveStatus={saveStatus}
        onExport={notImplemented("Export")}
      />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-6 print:max-w-none print:px-0">
          <BOQDocumentHeader
            title={`Bill of Quantities — ${meta.projectTitle}`}
            subtitle={meta.location}
          />

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
                  savingRowId={savingRowId}
                  onEditRow={handleEditRow}
                  onRateCommit={handleRateCommit}
                  onAddItem={notImplemented("Add item")}
                  onImportCsv={notImplemented("CSV import")}
                />
              ))}

              <GrandSummaryBlock summary={summary} currency={meta.currency} />

              <div className="mt-1 flex justify-end gap-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200 text-[11px] text-slate-600 hover:bg-white"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-1.5 h-3 w-3" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200 text-[11px] text-slate-600 hover:bg-white"
                  onClick={notImplemented("Excel export")}
                >
                  <Table2 className="mr-1.5 h-3 w-3" />
                  Export Excel
                </Button>
              </div>

              <p className="mt-6 border-t border-slate-200 pt-3 text-[10px] text-slate-400 print:hidden">
                Prepared by {meta.preparedBy || "—"} · Generated{" "}
                {formatDateTime(doc.generatedAt)} · {doc.templateVersion}
              </p>
            </div>
          </div>
        </div>
      </main>

      <RowEditSheet
        row={editingRow}
        open={sheetOpen}
        saving={patching}
        onOpenChange={setSheetOpen}
        onSubmit={handleRowSubmit}
      />
    </div>
  );
}

/**
 * AI projects keep their Bill of Quantity inside the Project Audit report, so
 * /projects/:id/boq forwards there rather than rendering the manual flow's
 * "No BOQ generated yet" state.
 */
function AiBoqRedirect({
  basePath,
  projectId,
}: {
  basePath: string;
  projectId: string;
}) {
  const router = useRouter();
  const target = `${basePath}/ai/${projectId}/report/boq`;

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return <BOQDocumentLoading />;
}
