"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { LayoutList, X } from "lucide-react";
import {
  advanceExtraction,
  completeExtraction,
  cancelExtraction,
  resetExtraction,
  setActivePage,
  setAiDrawingPageCount,
  startExtraction,
  toggleMeasureType,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { ExtractTopBar } from "./ExtractTopBar";
import { ExtractCanvas } from "./ExtractCanvas";
import { MeasureSelectPanel } from "./MeasureSelectPanel";
import { ExtractionProgressPanel } from "./ExtractionProgressPanel";
import { QuickEditModal } from "./QuickEditModal";
import { isValidObjectId } from "@/utils/apiError";
import { StatusBadge } from "../shared/ReportPrimitives";
import { useAiTakeoff } from "../useAiTakeoff";
import { PageScaleControl } from "./PageScaleControl";
import type { ExtractedElement } from "../types";

const STEP_DURATION_MS = 1800;
const TICK_MS = 80;

export function ExtractWorkspaceView({
  projectId,
  basePath = "/projects",
}: {
  projectId: string;
  basePath?: string;
}) {
  const dispatch = useDispatch();

  const {
    drawings,
    activeDrawingId,
    activePage,
    pages,
    selectionsByPage,
    extractionPhase,
    extractionSteps,
    hasExtracted,
    groups,
    projectMeta,
    session,
  } = useSelector((state: RootState) => state.aiFlow);


  const { analyseCurrentPage, ensureSession, reviewDetections, isAnalysing } =
    useAiTakeoff();
  /** With a server session the job drives progress; otherwise the mock ticker does. */
  const live = !!session.sessionId;

  const [stepProgress, setStepProgress] = useState(0);
  const [showElements, setShowElements] = useState(false);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  const activeDrawing = drawings.find((d) => d.id === activeDrawingId) ?? null;
  const pageCount = activeDrawing?.pageCount ?? pages.length;
  const selected = selectionsByPage[activePage] ?? [];

  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";
  const reportHref = `${basePath}/ai/${projectId}/report`;

  useEffect(() => {
    if (extractionPhase !== "running" || live) return;

    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += TICK_MS;
      if (elapsed >= STEP_DURATION_MS) {
        elapsed = 0;
        setStepProgress(0);
        dispatch(advanceExtraction());
      } else {
        setStepProgress((elapsed / STEP_DURATION_MS) * 100);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [extractionPhase, dispatch, live]);

  // A live run ends when the polled job clears itself (completed or failed).
  useEffect(() => {
    if (!live || extractionPhase !== "running" || session.activeJobId) return;
    dispatch(completeExtraction());
  }, [live, extractionPhase, session.activeJobId, dispatch]);

  const pageElements: ExtractedElement[] = useMemo(
    () =>
      groups
        .flatMap((group) => group.elements)
        .filter((element) => element.page === activePage),
    [groups, activePage],
  );

  const quickEditElement =
    groups.flatMap((g) => g.elements).find((e) => e.id === quickEditId) ?? null;

  const running = extractionPhase === "running";
  const complete = extractionPhase === "complete";

  const handleExtract = async () => {
    if (selected.length === 0) return;
    setStepProgress(0);

    // A reload loses the in-memory session, so try to resume before deciding
    // this is a demo run. Never silently fall back to the mock when the route
    // carries a real project — that looks like success and calls nothing.
    const sessionId = live ? session.sessionId : await ensureSession(projectId);

    if (!sessionId) {
      if (isValidObjectId(projectId)) {
        toast.error("No AI takeoff session", {
          description:
            "The session for this drawing could not be resumed. Go back to Drawing References and press Start Processing.",
        });
        return;
      }
      // No server project at all — this is the mock walkthrough.
      dispatch(startExtraction());
      return;
    }

    // POST /ai-takeoff/sessions/:id/pages, then poll the returned job.
    const jobId = await analyseCurrentPage(activePage);
    if (!jobId) return;

    dispatch(startExtraction());
  };

  const handleCancel = () => {
    setStepProgress(0);
    dispatch(cancelExtraction());
    dispatch(resetExtraction());
    toast.warning("Extraction cancelled", {
      description: "No data from this run was saved.",
    });
  };

  // "Review Results" drops back to the drawing with the element list open and
  // the first row needing attention already in Quick Edit.
  const handleReview = () => {
    const all = groups.flatMap((g) => g.elements);
    const target =
      all.find((e) => e.page === activePage && e.status === "review") ??
      all.find((e) => e.status === "review") ??
      pageElements[0] ??
      all[0];

    setStepProgress(0);
    dispatch(resetExtraction());
    setShowElements(true);
    if (target) setQuickEditId(target.id);
  };

  const title = `${projectMeta.projectTitle}, ${projectMeta.clientName} ...`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <ExtractTopBar
        title={title}
        dashboardHref={dashboardHref}
        reportHref={reportHref}
        continueLaterHref={basePath}
        reportLabel={hasExtracted ? "View Reports" : "View Reports"}
      />

      <div className="flex min-h-0 flex-1">
        <ExtractCanvas
          drawing={activeDrawing}
          page={activePage}
          pageCount={pageCount}
          onPageChange={(page) => dispatch(setActivePage(page))}
          onPageCountResolved={(numPages) =>
            activeDrawing &&
            dispatch(
              setAiDrawingPageCount({ id: activeDrawing.id, pageCount: numPages }),
            )
          }
          dimmed={running}
          topLeftSlot={
            hasExtracted ? (
              <button
                type="button"
                onClick={() => setShowElements((v) => !v)}
                className={`mr-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  showElements
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
                }`}
              >
                <LayoutList className="mr-1 inline h-3 w-3" />
                View Elements
              </button>
            ) : null
          }
          overlay={
            showElements && hasExtracted ? (
              <ElementsOverlay
                elements={pageElements}
                onSelect={(id) => setQuickEditId(id)}
                onClose={() => setShowElements(false)}
              />
            ) : null
          }
        />

        <aside className="w-[400px] shrink-0 border-l border-[#d9eef1]">
          {extractionPhase === "idle" || extractionPhase === "cancelled" ? (
            <MeasureSelectPanel
              selected={selected}
              onToggle={(measureTypeId) =>
                dispatch(toggleMeasureType({ page: activePage, measureTypeId }))
              }
              onExtract={handleExtract}
              busy={isAnalysing}
              error={session.lastError}
            />
          ) : (
            <ExtractionProgressPanel
              steps={extractionSteps}
              complete={complete}
              stepProgress={stepProgress}
              onCancel={handleCancel}
              onReview={handleReview}
              onBackToDrawing={() => {
                setStepProgress(0);
                dispatch(resetExtraction());
                setShowElements(false);
              }}
            />
          )}
        </aside>
      </div>

      <QuickEditModal element={quickEditElement} onClose={() => setQuickEditId(null)} />
    </div>
  );
}

function ElementsOverlay({
  elements,
  onSelect,
  onClose,
}: {
  elements: ExtractedElement[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white/98 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Elements on this page
        </p>
        <button
          type="button"
          aria-label="Close element list"
          onClick={onClose}
          className="rounded p-0.5 text-slate-400 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="max-h-72 overflow-y-auto">
        {elements.length === 0 && (
          <li className="px-3 py-4 text-[11px] text-slate-400">
            Nothing detected on this page yet.
          </li>
        )}
        {elements.map((element) => (
          <li key={element.id}>
            <button
              type="button"
              onClick={() => onSelect(element.id)}
              className="flex w-full items-center gap-2 border-b border-slate-50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-amber-50/50"
            >
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                {element.id}
              </span>
              <span className="text-[10px] text-slate-400">{element.grid}</span>
              <span className="ml-auto">
                <StatusBadge status={element.status} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
