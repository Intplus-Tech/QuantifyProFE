"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2, Box, PenLine, Lock } from "lucide-react";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";
import { VIEWER_MAP } from "./constants";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const IfcViewer = dynamic(
  () => import("../viewers/IfcViewer").then((m) => ({ default: m.IfcViewer })),
  { ssr: false, loading: () => <ViewerSpinner label="Parsing IFC model…" /> }
);

const DxfViewer = dynamic(
  () => import("../viewers/DxfViewer").then((m) => ({ default: m.DxfViewer })),
  { ssr: false, loading: () => <ViewerSpinner label="Parsing DXF drawing…" /> }
);

const ThreeViewer = dynamic(
  () => import("../viewers/ThreeViewer").then((m) => ({ default: m.ThreeViewer })),
  { ssr: false, loading: () => <ViewerSpinner label="Loading 3D model…" /> }
);

function ViewerSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
      <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> {label}
    </div>
  );
}

export function DrawingCanvas({
  drawing,
  page,
  scale,
  rotation = 0,
  panEnabled = false,
  onPageCountResolved,
  measurementOverlay,
}: {
  drawing: DrawingFile | null;
  page: number;
  scale: number;
  /** Visual rotation in degrees — applied to the page and its measurement
   *  overlay together, so drawn marks stay aligned with the rotated page. */
  rotation?: 0 | 90 | 180 | 270;
  /** Click-and-drag panning — only offered when no measurement tool is actively drawing. */
  panEnabled?: boolean;
  onPageCountResolved: (id: string, numPages: number) => void;
  /** Konva measurement canvas — rendered only over PDF pages */
  measurementOverlay?: React.ReactNode;
}) {
  const viewerType = useMemo(
    () => (drawing?.extension ? VIEWER_MAP[drawing.extension.toLowerCase()] ?? "unsupported" : null),
    [drawing?.extension]
  );

  // ── Click-and-drag panning (PDF path scrolls its own overflow-auto container) ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panState = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
    moved: boolean;
  } | null>(null);

  function handlePanPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Middle-mouse-button drag pans regardless of the active tool — browsers
    // never fire a "click" event for the middle button, so this can never be
    // mistaken for a tool placement (count/length/area clicks are left-button
    // "click" events only). Plain left-button drag only pans when no tool is
    // actively drawing (panEnabled), so it never steals a tool's clicks.
    const isMiddleButton = e.button === 1;
    if (!isMiddleButton && !panEnabled) return;
    if (isMiddleButton) e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    panState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: el.scrollLeft,
      startScrollTop: el.scrollTop,
      moved: false,
    };
    setIsPanning(true);
    el.setPointerCapture(e.pointerId);
  }

  function handlePanPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const ps = panState.current;
    const el = scrollRef.current;
    if (!ps || !el) return;
    const dx = e.clientX - ps.startX;
    const dy = e.clientY - ps.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) ps.moved = true;
    el.scrollLeft = ps.startScrollLeft - dx;
    el.scrollTop = ps.startScrollTop - dy;
  }

  function handlePanPointerUp() {
    panState.current = null;
    setIsPanning(false);
  }

  if (!drawing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
        <p className="text-sm text-slate-500 font-medium">Viewing No Drawing...</p>
        <p className="text-xs text-slate-400">Select a drawing from the panel on the left</p>
      </div>
    );
  }

  // ── PDF ──────────────────────────────────────────────────────────────────────
  if (viewerType === "pdf" && drawing.previewUrl) {
    return (
      <div
        ref={scrollRef}
        onPointerDown={handlePanPointerDown}
        onPointerMove={handlePanPointerMove}
        onPointerUp={handlePanPointerUp}
        onPointerCancel={handlePanPointerUp}
        style={panEnabled ? { touchAction: "none" } : undefined}
        className={`flex items-start justify-center h-full overflow-auto p-6 ${
          panEnabled ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        {/* Wrapper is inline so it sizes to the rendered page, not the scroll container.
            The measurement overlay is absolute inset-0 over exactly this element —
            rotating this wrapper (not the scroll container) keeps drawn marks
            aligned with the page, since both rotate together as one unit. */}
        <div
          className="relative inline-block"
          style={
            rotation
              ? { transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }
              : undefined
          }
        >
          <Document
            file={drawing.previewUrl}
            onLoadSuccess={({ numPages }) => onPageCountResolved(drawing.id, numPages)}
            loading={<ViewerSpinner label="Loading PDF…" />}
            error={<p className="text-sm text-destructive mt-16">Failed to load drawing.</p>}
          >
            <Page
              pageNumber={page}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-2xl"
            />
          </Document>
          {measurementOverlay}
        </div>
      </div>
    );
  }

  // ── Image ─────────────────────────────────────────────────────────────────────
  if (viewerType === "image") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="flex items-center justify-center h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={drawing.name}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              transition: "transform 0.15s ease",
            }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      );
    }
  }

  // ── IFC ───────────────────────────────────────────────────────────────────────
  if (viewerType === "ifc") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="w-full h-full">
          <IfcViewer
            url={src}
            onStoreyCount={(count) => onPageCountResolved(drawing.id, count)}
          />
        </div>
      );
    }
  }

  // ── DXF ───────────────────────────────────────────────────────────────────────
  if (viewerType === "dxf") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="w-full h-full">
          <DxfViewer
            url={src}
            onLoaded={() => onPageCountResolved(drawing.id, 1)}
          />
        </div>
      );
    }
  }

  // ── Three.js (FBX, OBJ, STL, PLY, DAE) ──────────────────────────────────────
  if (viewerType === "three") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="w-full h-full">
          <ThreeViewer
            url={src}
            extension={drawing.extension ?? ""}
            onLoaded={() => onPageCountResolved(drawing.id, 1)}
          />
        </div>
      );
    }
  }

  // ── Unsupported / proprietary ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        {drawing.category === "bim-3d" ? (
          <Box className="w-10 h-10 text-slate-300" />
        ) : (
          <PenLine className="w-10 h-10 text-slate-300" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">{drawing.name}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {drawing.extension?.toUpperCase()} format requires a cloud processing subscription.
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Autodesk APS or Speckle required for {drawing.extension} files</span>
        </div>
      </div>
    </div>
  );
}
