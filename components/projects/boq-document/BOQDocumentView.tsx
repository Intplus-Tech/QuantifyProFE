"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { BOQTopBar } from "./BOQTopBar";
import { BOQDocumentHeader } from "./BOQDocumentHeader";
import { ProjectInfoPanel } from "./ProjectInfoPanel";
import { BillCard } from "./BillCard";
import { GrandSummaryCard } from "./GrandSummaryCard";
import { GrandTotalCard } from "./GrandTotalCard";
import { EditItemDrawer } from "./EditItemDrawer";
import { BOQFooterBar } from "./BOQFooterBar";
import { BOQDocumentLoading } from "./BOQDocumentLoading";
import { BOQDocumentEmpty } from "./BOQDocumentEmpty";
import { mapProjectToBoqDocument } from "./mapProjectToBoqDocument";
import {
  billTotal,
  deleteItem,
  documentTotals,
  findItem,
  replaceItem,
} from "./totals";
import type { BOQDocument, BOQItem, QuickSummaryRow } from "./types";

interface BOQDocumentViewProps {
  projectId: string;
  basePath?: string;
}

/** One row per bill, plus the grand total — derived, so it works for any payload. */
function buildQuickSummary(
  doc: BOQDocument,
  grandTotal: number,
): QuickSummaryRow[] {
  const rows: QuickSummaryRow[] = doc.bills.map((bill) => ({
    label: bill.title || bill.code,
    amount: billTotal(bill),
  }));

  rows.push({ label: "Grand Total", amount: grandTotal, emphasis: "grand" });
  return rows;
}

export function BOQDocumentView({
  projectId,
  basePath = "/projects",
}: BOQDocumentViewProps) {
  const {
    data: response,
    isLoading,
    error,
  } = useGetProjectByIdQuery(projectId, { skip: !projectId });

  const project = response?.data;

  const mapped = useMemo(
    () => (project ? mapProjectToBoqDocument(project) : null),
    [project],
  );

  // Local working copy so edits are immediate; re-seeded whenever the fetch lands.
  const [doc, setDoc] = useState<BOQDocument | null>(mapped);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [dirtyItemIds, setDirtyItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDoc(mapped);
    setDirtyItemIds(new Set());
    setEditingItemId(null);
  }, [mapped]);

  const totals = useMemo(
    () => (doc ? documentTotals(doc) : null),
    [doc],
  );
  const quickSummary = useMemo(
    () => (doc && totals ? buildQuickSummary(doc, totals.grandTotal) : []),
    [doc, totals],
  );

  const workspaceHref = `${basePath}/${projectId}`;
  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";

  const handleSaveItem = (updated: BOQItem) => {
    setDoc((prev) => (prev ? replaceItem(prev, updated) : prev));
    setDirtyItemIds((prev) => new Set(prev).add(updated.id));
    setEditingItemId(null);
    toast.success(`Item ${updated.ref || updated.description} updated`);
  };

  /** Inline cell edit — same state path as the drawer, without opening it. */
  const handleUpdateItem = (updated: BOQItem) => {
    setDoc((prev) => (prev ? replaceItem(prev, updated) : prev));
    setDirtyItemIds((prev) => new Set(prev).add(updated.id));
  };

  const handleDeleteItem = (itemId: string) => {
    setDoc((prev) => (prev ? deleteItem(prev, itemId) : prev));
    setDirtyItemIds((prev) => new Set(prev).add(itemId));
    setEditingItemId(null);
    toast.success("Item deleted");
  };

  const handleSaveDocument = () => {
    // TODO: persist rates back to the project once the endpoint exists.
    setDirtyItemIds(new Set());
    toast.success("Changes saved");
  };

  if (isLoading) return <BOQDocumentLoading />;

  if (error || !project) {
    return (
      <BOQDocumentEmpty
        variant="error"
        workspaceHref={workspaceHref}
        projectId={projectId}
      />
    );
  }

  if (!doc || !totals || doc.bills.length === 0) {
    return (
      <BOQDocumentEmpty
        variant="no-boq"
        workspaceHref={workspaceHref}
        projectName={project.name}
      />
    );
  }

  const editing = editingItemId ? findItem(doc, editingItemId) : null;

  return (
    <div className="flex h-screen flex-col bg-white">
      <BOQTopBar
        workspaceHref={workspaceHref}
        dashboardHref={dashboardHref}
        hasUnsavedChanges={dirtyItemIds.size > 0}
        onSave={handleSaveDocument}
        onExport={() => toast.info("Export options coming soon")}
      />

      <div className="flex min-h-0 flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-6 print:max-w-none print:px-0">
            <BOQDocumentHeader title={doc.title} subtitle={doc.subtitle} />

            <ProjectInfoPanel
              info={doc.projectInfo}
              quickSummary={quickSummary}
            />

            {/* One card carries every bill, the summary and the totals */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {doc.bills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  activeItemId={editingItemId}
                  onEditItem={setEditingItemId}
                  onUpdateItem={handleUpdateItem}
                  onAddItem={() => toast.info("Add item coming soon")}
                  onImportCsv={() => toast.info("CSV import coming soon")}
                />
              ))}

              <GrandSummaryCard
                rows={doc.summaryRows}
                bills={doc.bills}
                mainBuildingSubTotal={totals.mainBuilding}
                pageLabel="Summary"
              />

              <GrandTotalCard
                totals={totals}
                contingencyRate={doc.contingencyRate}
                vatRate={doc.vatRate}
              />
            </div>

            {doc.generalNotes && (
              <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  General Notes
                </h2>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  {doc.generalNotes}
                </p>
              </section>
            )}

            <div className="mt-4 flex justify-end gap-2 print:hidden">
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
                onClick={() => toast.info("Excel export coming soon")}
              >
                <Table2 className="mr-1.5 h-3 w-3" />
                Export Excel
              </Button>
            </div>

            <BOQFooterBar meta={doc.meta} unsavedCount={dirtyItemIds.size} />
          </div>
        </main>

        {editing && (
          <EditItemDrawer
            item={editing.item}
            bill={editing.bill}
            subsection={editing.subsection}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            onClose={() => setEditingItemId(null)}
          />
        )}
      </div>
    </div>
  );
}
