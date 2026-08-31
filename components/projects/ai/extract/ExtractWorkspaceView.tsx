"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { LayoutList, X } from "lucide-react";
import {
  advanceExtraction,
  completeExtraction,
  cancelExtraction,
  clearAiPageCalibration,
  resetExtraction,
  setActivePage,
  setAiDrawingPageCount,
  setAiPageCalibration,
  startExtraction,
  toggleMeasureType,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { ExtractTopBar } from "./ExtractTopBar";
import { ExtractCanvas, type CanvasPoint, type CanvasTool } from "./ExtractCanvas";
import { MeasureSelectPanel } from "./MeasureSelectPanel";
import { ExtractionProgressPanel } from "./ExtractionProgressPanel";
import { QuickEditModal } from "./QuickEditModal";
import {
  GroundScaleBar,
  METRES_PER_UNIT,
  type ScaleUnit,
} from "./GroundScaleBar";
import { isValidObjectId } from "@/utils/apiError";
import { StatusBadge } from "../shared/ReportPrimitives";
import { useAiTakeoff } from "../useAiTakeoff";
import { useDrawingPreviews } from "../useDrawingPreviews";
import { useAiProjectSession } from "../useAiProjectSession";
import { rasterScaleFor } from "../pageRaster";
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

  const { analyseCurrentPage, ensureSession, isAnalysingPage, job } = useAiTakeoff();
  // Restores this project's takeoff when the page is reached cold — from the
  // dashboard, or after a reload — then re-previews the drawing locally.
  const { recovering } = useAiProjectSession(projectId);
  const { restoring, failedIds, retry: retryPreview } = useDrawingPreviews();
  /** With a server session the job drives progress; otherwise the mock ticker does. */
  const live = !!session.sessionId;

  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const extractInFlight = useRef(false);
  // The ref closes the double-click window synchronously; this is the same
  // fact in state, so the button goes dead on the first click rather than
  // waiting for the request to reach `isLoading`.
  const [submitting, setSubmitting] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);

  // ── Ground scale ──────────────────────────────────────────────────────────
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [picking, setPicking] = useState(false);
  const [tool, setTool] = useState<CanvasTool>("pan");
  const [calibPoints, setCalibPoints] = useState<CanvasPoint[]>([]);
  const [knownDistance, setKnownDistance] = useState("");
  const [scaleUnit, setScaleUnit] = useState<ScaleUnit>("m");

  const activeDrawing = drawings.find((d) => d.id === activeDrawingId) ?? null;
  const pageCount = activeDrawing?.pageCount ?? pages.length;
  const selected = selectionsByPage[activePage] ?? [];
  const calibration = session.pageCalibrations[activePage] ?? null;

  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";
  const reportHref = `${basePath}/ai/${projectId}/report`;

  const running = extractionPhase === "running";
  const complete = extractionPhase === "complete";

  // Moving to another page leaves that page's calibration behind — a drawing
  // set mixes 1:50 details with 1:200 layouts, so the scale never carries over.
  useEffect(() => {
    setPicking(false);
    setCalibPoints([]);
    setKnownDistance("");
    setTool("pan");
  }, [activePage, activeDrawingId]);

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

  /**
   * A live run has no progress figure to read — the job carries a status and a
   * `startedAt`, nothing finer. Rather than leave the bar sitting empty, it is
   * driven off elapsed time on a curve that approaches but never reaches the
   * end of the step, so it always moves and never claims to be finished before
   * the job says it is.
   */
  useEffect(() => {
    if (!live || extractionPhase !== "running") {
      setElapsedMs(0);
      return;
    }

    const startedAt = job?.startedAt ? new Date(job.startedAt).getTime() : null;
    const base = startedAt ?? Date.now();

    const id = setInterval(() => setElapsedMs(Date.now() - base), 500);
    return () => clearInterval(id);
  }, [live, extractionPhase, job?.startedAt, job?._id]);

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

  const handleCalibrationPoint = useCallback((point: CanvasPoint) => {
    setCalibPoints((previous) => (previous.length >= 2 ? [point] : [...previous, point]));
  }, []);

  const resetCalibration = () => {
    setCalibPoints([]);
    setKnownDistance("");
    setPicking(true);
    setTool("select");
    dispatch(clearAiPageCalibration(activePage));
  };

  /**
   * Two clicked points plus a real distance give pixels-per-metre, exactly as
   * the manual canvas does it. The server measures against the *uploaded* page
   * image rather than what is on screen, so the clicked separation is carried
   * into that image's pixel space before being stored.
   */
  const applyGroundScale = () => {
    if (calibPoints.length < 2) {
      toast.warning("Click two points on the drawing first");
      return;
    }
    const entered = parseFloat(knownDistance);
    if (!Number.isFinite(entered) || entered <= 0) {
      toast.warning("Enter a real distance greater than 0");
      return;
    }
    if (!naturalSize) {
      toast.warning("Wait for the page to finish loading");
      return;
    }

    const pagePixels = Math.hypot(
      calibPoints[1].x - calibPoints[0].x,
      calibPoints[1].y - calibPoints[0].y,
    );
    if (pagePixels <= 0) {
      toast.warning("Those two points are in the same place — pick them further apart");
      return;
    }

    const rasterScale = rasterScaleFor(
      naturalSize.width,
      naturalSize.height,
      activeDrawing?.extension === ".pdf",
    );
    const imagePixels = pagePixels * rasterScale;
    const metres = entered * METRES_PER_UNIT[scaleUnit];

    dispatch(
      setAiPageCalibration({
        page: activePage,
        calibration: {
          metresPerPixel: metres / imagePixels,
          knownDistance: entered,
          unit: scaleUnit,
          pixelDistance: imagePixels,
        },
      }),
    );

    setPicking(false);
    setTool("pan");
    toast.success("Ground scale applied", {
      description: `Page ${activePage} · ${entered} ${scaleUnit} across the marked line`,
    });
  };

  // 1 - e^(-t/tau): fast at first, then asymptotic. TYPICAL_STEP_MS is the
  // point the curve is ~63% through, tuned to how long a page usually takes.
  const TYPICAL_STEP_MS = 20000;
  const liveProgress = complete
    ? 100
    : Math.min(96, (1 - Math.exp(-elapsedMs / TYPICAL_STEP_MS)) * 100);

  const scaleInfo = calibration
    ? `1 px ≈ ${calibration.metresPerPixel.toFixed(4)} m · ${(
        1 / calibration.metresPerPixel
      ).toFixed(1)} px/m`
    : null;

  const handleExtract = async () => {
    if (selected.length === 0) return;

    // `busy` only turns on after a re-render, so a fast second click would slip
    // through and fire a duplicate POST — which the server answers 409. A ref
    // closes that window synchronously.
    if (extractInFlight.current) return;
    extractInFlight.current = true;
    setSubmitting(true);
    setStepProgress(0);

    try {
      await runExtract();
    } finally {
      extractInFlight.current = false;
      setSubmitting(false);
    }
  };

  const runExtract = async () => {
    if (!calibration) {
      toast.warning("Set the ground scale first", {
        description:
          "Mark a known distance on the page so the quantities come out in real units.",
      });
      return;
    }

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
        reportLabel="View Reports"
        locked={running}
      />

      <div className="flex min-h-0 flex-1">
        <ExtractCanvas
          drawing={activeDrawing}
          page={activePage}
          pageCount={pageCount}
          restoring={restoring || recovering}
          failed={!!activeDrawing && failedIds.includes(activeDrawing.id)}
          onRetry={retryPreview}
          onPageChange={(page) => dispatch(setActivePage(page))}
          onPageCountResolved={(numPages) =>
            activeDrawing &&
            dispatch(
              setAiDrawingPageCount({ id: activeDrawing.id, pageCount: numPages }),
            )
          }
          onNaturalSize={setNaturalSize}
          dimmed={running}
          calibrating={picking && !running}
          calibrationPoints={calibPoints}
          onCalibrationPoint={handleCalibrationPoint}
          tool={tool}
          onToolChange={setTool}
          footer={
            <GroundScaleBar
              picking={picking}
              pointsPlaced={calibPoints.length}
              knownDistance={knownDistance}
              unit={scaleUnit}
              calibrated={!!calibration}
              scaleInfo={scaleInfo}
              disabled={running || !activeDrawing}
              onStartPicking={() => {
                setPicking(true);
                // Arm the pointer, or the first click would pan instead of
                // dropping a point.
                setTool("select");
              }}
              onKnownDistanceChange={setKnownDistance}
              onUnitChange={setScaleUnit}
              onApply={applyGroundScale}
              onReset={resetCalibration}
            />
          }
          topLeftSlot={
            hasExtracted ? (
              <button
                type="button"
                disabled={running}
                onClick={() => setShowElements((v) => !v)}
                className={`mr-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
            showElements && hasExtracted && !running ? (
              <ElementsOverlay
                elements={pageElements}
                onSelect={(id) => setQuickEditId(id)}
                onClose={() => setShowElements(false)}
              />
            ) : null
          }
        />

        <aside className="flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-[#d9eef1]">
          {extractionPhase === "idle" || extractionPhase === "cancelled" ? (
            <MeasureSelectPanel
              selected={selected}
              onToggle={(measureTypeId) =>
                dispatch(toggleMeasureType({ page: activePage, measureTypeId }))
              }
              onExtract={handleExtract}
              busy={submitting || isAnalysingPage(activePage)}
              error={session.lastError}
              scaleReady={!!calibration}
            />
          ) : (
            <ExtractionProgressPanel
              steps={extractionSteps}
              complete={complete}
              stepProgress={live ? liveProgress : stepProgress}
              elapsedMs={live ? elapsedMs : undefined}
              pageNumber={session.jobPageNumber ?? activePage}
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
