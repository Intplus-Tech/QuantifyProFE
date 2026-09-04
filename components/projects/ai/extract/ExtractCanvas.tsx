"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
  Hand,
  Loader2,
  MousePointer2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { AiDrawing } from "@/store/slices/aiFlowSlice";

const AiPdfPreview = dynamic(
  () => import("../AiPdfPreview").then((m) => ({ default: m.AiPdfPreview })),
  { ssr: false },
);

type Tool = "select" | "pan";

export interface CanvasPoint {
  x: number;
  y: number;
}

export type CanvasTool = Tool;

export function ExtractCanvas({
  drawing,
  page,
  pageCount,
  onPageChange,
  onPageCountResolved,
  onNaturalSize,
  dimmed,
  overlay,
  topLeftSlot,
  footer,
  restoring,
  failed,
  onRetry,
  calibrating,
  calibrationPoints,
  onCalibrationPoint,
  tool,
  onToolChange,
}: {
  drawing: AiDrawing | null;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageCountResolved: (numPages: number) => void;
  /** page size at 100%, needed to convert clicks into uploaded-image pixels */
  onNaturalSize?: (size: { width: number; height: number }) => void;
  dimmed?: boolean;
  overlay?: React.ReactNode;
  topLeftSlot?: React.ReactNode;
  footer?: React.ReactNode;
  /** true while the local copy of the drawing is being restored after a reload */
  restoring?: boolean;
  /** every source for this drawing has been tried and none worked */
  failed?: boolean;
  onRetry?: () => void;
  calibrating?: boolean;
  calibrationPoints?: CanvasPoint[];
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  /**
   * A click on the page, already converted out of the current zoom and back
   * into the page's own pixel space, so the calibration survives zooming.
   */
  onCalibrationPoint?: (point: CanvasPoint) => void;
}) {
  // blob: preview URLs die on reload. The server copy is only used once the
  // recovery ladder in useDrawingPreviews has given up on producing a local
  // one — handing react-pdf a cross-origin URL it may not be allowed to fetch
  // is what produced "This drawing could not be opened" mid-restore.
  const source =
    drawing?.previewUrl ?? (restoring ? null : (drawing?.uploadedUrl ?? null));

  const [scale, setScale] = useState(0.9);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; movedBy: number } | null>(null);
  // A pan that ends over the page would otherwise fire a click and drop a
  // stray calibration point where the drag happened to stop.
  const suppressClick = useRef(false);
  const pageRef = useRef<HTMLDivElement>(null);
  // Kept locally as well as reported upward: the image is sized from it, which
  // is what keeps the rendered box the same shape as the clickable area.
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(
    null,
  );

  const reportNatural = (size: { width: number; height: number }) => {
    setNatural(size);
    onNaturalSize?.(size);
  };

  // The hand and the pointer are the whole interaction, calibrating or not:
  // finding a known distance means panning the sheet around first, so pan is
  // never taken away — the pointer tool is what places the points.
  const panning = tool === "pan";
  const armed = !!calibrating && tool === "select";

  const startDrag = (e: React.MouseEvent) => {
    if (!panning || dimmed) return;
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y, movedBy: 0 };
  };

  const onDrag = (e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const next = { x: e.clientX - drag.x, y: e.clientY - drag.y };
    drag.movedBy += Math.abs(next.x - offset.x) + Math.abs(next.y - offset.y);
    setOffset(next);
  };

  const endDrag = () => {
    if (dragRef.current && dragRef.current.movedBy > 3) suppressClick.current = true;
    dragRef.current = null;
  };

  // Clicks are recorded against the rendered page box rather than the viewport,
  // so panning and scrolling between the two points cannot skew the distance,
  // and divided back out of the zoom so the pair means the same thing however
  // far in the user was when they placed them.
  const handleCalibrationClick = (event: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!armed || !onCalibrationPoint || !pageRef.current) return;
    const box = pageRef.current.getBoundingClientRect();
    onCalibrationPoint({
      x: (event.clientX - box.left) / scale,
      y: (event.clientY - box.top) / scale,
    });
  };

  const points = calibrationPoints ?? [];

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-[#eef1f5]">
      {/* Page strip */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#d9eef1] bg-[#eefafb] px-3">
        {topLeftSlot}

        <div className="rounded-md border border-[#cfe8ec] bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
          Page {page} of {pageCount}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">Page</span>
          <PageStepButton
            label="Previous page"
            disabled={page <= 1 || !!dimmed}
            onClick={() => onPageChange(page - 1)}
          >
            Up
            <ChevronUp className="h-3.5 w-3.5" />
          </PageStepButton>
          <PageStepButton
            label="Next page"
            disabled={page >= pageCount || !!dimmed}
            onClick={() => onPageChange(page + 1)}
          >
            Down
            <ChevronDown className="h-3.5 w-3.5" />
          </PageStepButton>
        </div>
      </div>

      {/* Canvas surface */}
      <div
        className={`relative flex-1 overflow-hidden ${
          panning
            ? "cursor-grab active:cursor-grabbing"
            : armed
              ? "cursor-crosshair"
              : "cursor-default"
        }`}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <div
          className={`flex h-full items-start justify-center overflow-auto p-6 transition-all duration-300 ${
            dimmed ? "opacity-35 blur-[2px]" : ""
          }`}
        >
          <div
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            className="inline-block"
          >
            {!drawing && !restoring && (
              <p className="mt-32 text-xs text-slate-400">No drawing selected</p>
            )}

            {restoring && !source && (
              <p className="mt-32 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                Reopening your drawing…
              </p>
            )}

            {failed && !restoring && drawing && (
              <div className="mt-32 max-w-xs text-center">
                <p className="text-xs font-medium text-slate-700">
                  {drawing.name} could not be reopened
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  The file could not be reached just now. This is usually a
                  connection hiccup rather than a lost drawing.
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-amber-600"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try again
                  </button>
                )}
              </div>
            )}

            <div
              ref={pageRef}
              className="relative inline-block"
              onClick={handleCalibrationClick}
            >
              {source && drawing?.extension === ".pdf" && (
                <AiPdfPreview
                  url={source}
                  page={page}
                  scale={scale}
                  onLoadSuccess={onPageCountResolved}
                  onPageSize={reportNatural}
                />
              )}

              {source && drawing && drawing.extension !== ".pdf" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={source}
                  alt={drawing.name}
                  // Sized rather than transformed: a CSS transform leaves the
                  // layout box at 100%, which would put every calibration
                  // click in the wrong place once zoomed.
                  style={{ width: natural ? natural.width * scale : undefined }}
                  className="block shadow-lg"
                  draggable={false}
                  onLoad={(event) =>
                    reportNatural({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }
                />
              )}

              <CalibrationOverlay points={points} scale={scale} />
            </div>
          </div>
        </div>

        {/* Tool rail */}
        <div className="absolute left-3 top-3 flex flex-col gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
          <ToolButton
            label={armed ? "Point tool — place calibration points" : "Point tool"}
            active={tool === "select"}
            disabled={dimmed}
            onClick={() => onToolChange("select")}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
          </ToolButton>
          {/* Toggling the hand off returns to the pointer, so the two are a
              single switch rather than two buttons to remember. */}
          <ToolButton
            label={panning ? "Hand tool — click to go back to pointing" : "Hand tool"}
            active={panning}
            disabled={dimmed}
            onClick={() => onToolChange(panning ? "select" : "pan")}
          >
            <Hand className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton
            label="Zoom in"
            disabled={dimmed}
            onClick={() => setScale((s) => Math.min(4, s + 0.15))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton
            label="Zoom out"
            disabled={dimmed}
            onClick={() => setScale((s) => Math.max(0.2, s - 0.15))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolButton>
        </div>

        {calibrating && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-slate-900/85 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg">
            {panning
              ? "Hand tool — drag to find your known distance, then switch to the pointer"
              : points.length === 0
                ? "Click the first point of a known distance"
                : points.length === 1
                  ? "Click the second point"
                  : "Both points set — enter the real distance below"}
          </div>
        )}

        {dimmed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-slate-500" strokeWidth={1.5} />
          </div>
        )}

        {overlay}
      </div>

      {footer}
    </div>
  );
}

/** The two clicked points and the line between them, drawn over the page. */
function CalibrationOverlay({
  points,
  scale,
}: {
  points: CanvasPoint[];
  scale: number;
}) {
  if (points.length === 0) return null;

  const at = (point: CanvasPoint) => ({ x: point.x * scale, y: point.y * scale });
  const marks = points.map(at);

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {marks.length === 2 && (
        <line
          x1={marks[0].x}
          y1={marks[0].y}
          x2={marks[1].x}
          y2={marks[1].y}
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}
      {marks.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle cx={point.x} cy={point.y} r={6} fill="#f59e0b" fillOpacity={0.25} />
          <circle
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill="#fff"
            stroke="#f59e0b"
            strokeWidth={2}
          />
        </g>
      ))}
    </svg>
  );
}

function PageStepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-[#cfe8ec] bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
