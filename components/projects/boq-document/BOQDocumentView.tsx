"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Printer, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { useGetBoqDocumentQuery } from "@/store/api/boqDocumentApi";
import { BOQTopBar } from "./BOQTopBar";
import { BOQDocumentHeader } from "./BOQDocumentHeader";
import { ProjectInfoPanel } from "./ProjectInfoPanel";
import { ElementGroupCard } from "./ElementGroupCard";
import { GrandSummaryBlock } from "./GrandSummaryBlock";
import { RowEditPanel } from "./RowEditPanel";
import { BoqDeleteDialog, BoqSectionRenameDialog } from "./BoqDeleteDialogs";
import { useBoqDocumentActions } from "./useBoqDocumentActions";
import { BOQDocumentLoading } from "./BOQDocumentLoading";
import { BOQDocumentEmpty } from "./BOQDocumentEmpty";

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
  const actions = useBoqDocumentActions(projectId);

  const workspaceHref = `${basePath}/${projectId}`;
  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";

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

  // The edit panel shows the row's section (SMM code + title) as its subtitle.
  // useBoqDocumentActions only tracks the row, so resolve the section from the
  // document here rather than threading it through every table prop.
  const editingSection = actions.editingRow
    ? elementGroups
        .flatMap((group) => group.sections)
        .find((section) =>
          section.rows.some(
            (row) => row.rowId === actions.editingRow?.rowId,
          ),
        )
    : undefined;

  return (
    <div className="flex h-screen flex-col bg-white">
      <BOQTopBar
        workspaceHref={workspaceHref}
        dashboardHref={dashboardHref}
        saveStatus={actions.saveStatus}
        onExport={notImplemented("Export")}
      />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 print:px-0">
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
                  savingRowId={actions.savingRowId}
                  onEditRow={actions.onEditRow}
                  onDeleteRow={actions.onDeleteRow}
                  onRateCommit={actions.onRateCommit}
                  onAddItem={notImplemented("Add item")}
                  onImportCsv={notImplemented("CSV import")}
                  onEditSection={actions.onEditSection}
                  onDeleteSection={actions.onDeleteSection}
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

      <RowEditPanel
        row={actions.editingRow}
        open={actions.sheetOpen}
        saving={actions.saving}
        currency={meta.currency}
        sectionCode={editingSection?.sectionCode}
        sectionTitle={editingSection?.title}
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
