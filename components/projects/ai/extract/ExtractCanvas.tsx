"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
  Hand,
  Loader2,
  MousePointer2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { AiDrawing } from "@/store/slices/aiFlowSlice";

const AiPdfPreview = dynamic(
  () => import("../AiPdfPreview").then((m) => ({ default: m.AiPdfPreview })),
  { ssr: false },
);

type Tool = "select" | "pan";

export function ExtractCanvas({
  drawing,
  page,
  pageCount,
  onPageChange,
  onPageCountResolved,
  dimmed,
  overlay,
  topLeftSlot,
}: {
  drawing: AiDrawing | null;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageCountResolved: (numPages: number) => void;
  dimmed?: boolean;
  overlay?: React.ReactNode;
  topLeftSlot?: React.ReactNode;
}) {
  // blob: preview URLs die on reload, so fall back to the uploaded server copy.
  const source = drawing?.previewUrl ?? drawing?.uploadedUrl ?? null;

  const [tool, setTool] = useState<Tool>("pan");
  const [scale, setScale] = useState(0.9);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const startDrag = (e: React.MouseEvent) => {
    if (tool !== "pan") return;
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-[#eef1f5]">
      {/* Page strip */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#d9eef1] bg-[#eefafb] px-3">
        {topLeftSlot}

        <span className="text-[11px] font-medium text-slate-500">Page</span>
        <div className="flex items-center gap-1">
          <PageStepButton
            label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </PageStepButton>
          <PageStepButton
            label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </PageStepButton>
        </div>

        <div className="ml-auto rounded-md border border-[#cfe8ec] bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
          Page {page} of {pageCount}
        </div>
      </div>

      {/* Canvas surface */}
      <div
        className={`relative flex-1 overflow-hidden ${
          tool === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
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
            {!drawing && (
              <p className="mt-32 text-xs text-slate-400">No drawing selected</p>
            )}

            {source && drawing?.extension === ".pdf" && (
              <AiPdfPreview
                url={source}
                page={page}
                scale={scale}
                onLoadSuccess={onPageCountResolved}
              />
            )}

            {source && drawing && drawing.extension !== ".pdf" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={source}
                alt={drawing.name}
                style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                className="max-w-full shadow-lg"
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Tool rail */}
        <div className="absolute left-3 top-3 flex flex-col gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
          <ToolButton
            label="Select"
            active={tool === "select"}
            onClick={() => setTool("select")}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton label="Pan" active={tool === "pan"} onClick={() => setTool("pan")}>
            <Hand className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton
            label="Zoom in"
            onClick={() => setScale((s) => Math.min(4, s + 0.15))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton
            label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.2, s - 0.15))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolButton>
        </div>

        {dimmed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-slate-500" strokeWidth={1.5} />
          </div>
        )}

        {overlay}
      </div>
    </div>
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
      className="rounded-md border border-[#cfe8ec] bg-white p-1 text-slate-500 transition-colors hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`rounded-md p-1.5 transition-colors ${
        active
          ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
