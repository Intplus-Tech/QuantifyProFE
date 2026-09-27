"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, ExternalLink, X, Box, PenLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";
import { isApsExtension } from "@/lib/aps/config";

// Set PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Same component the workspace canvas uses post-creation (DrawingCanvas.tsx)
// — loaded lazily so the Autodesk Viewer SDK/CDN script never touches a
// session that never opens a file routed through Autodesk.
const ApsViewer = dynamic(
  () => import("../workspace/viewers/ApsViewer").then((m) => ({ default: m.ApsViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Connecting to Autodesk…
      </div>
    ),
  },
);

// ── Placeholder for formats with no viewer in THIS panel specifically — IFC,
// FBX, OBJ, STL, PLY, DAE have free viewers in the workspace (DrawingCanvas.tsx)
// but not here yet. Every other format either previews inline above or now
// routes through Autodesk (isApsExtension check below), so the "cad-2d"
// label here is currently unreachable — left in for whichever future format
// lands without a viewer of its own. ──
function BimViewerPlaceholder({ file }: { file: DrawingFile }) {
  const labels: Record<string, { label: string; hint: string }> = {
    "bim-3d": {
      label: "3D BIM File",
      hint: "No preview here yet — open the project workspace once it's created to view this file.",
    },
    "cad-2d": {
      label: "2D CAD File",
      hint: "DWG preview isn't supported yet — export to DXF for a measurable preview, or open the project workspace once it's created.",
    },
  };
  const info = labels[file.category] ?? { label: "File Preview", hint: "" };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        {file.category === "bim-3d" ? (
          <Box className="w-10 h-10 text-slate-400" />
        ) : (
          <PenLine className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{info.label}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-52">{info.hint}</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-2 text-[10px] text-slate-400 font-mono">
        {file.name}
      </div>
    </div>
  );
}

// ── PDF viewer ────────────────────────────────────────────────────────────────

interface PdfViewerProps {
  file: DrawingFile;
  scale: number;
  page: number;
  onPageCount: (n: number) => void;
}

function PdfViewer({ file, scale, page, onPageCount }: PdfViewerProps) {
  if (!file.previewUrl) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No preview available yet.
      </div>
    );
  }

  return (
    <Document
      file={file.previewUrl}
      onLoadSuccess={({ numPages }) => onPageCount(numPages)}
      loading={
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground animate-pulse">
          Loading PDF…
        </div>
      }
      error={
        <div className="flex items-center justify-center h-full text-sm text-destructive">
          Failed to load PDF preview.
        </div>
      }
      className="flex items-start justify-center"
    >
      <Page
        pageNumber={page}
        scale={scale}
        className="shadow-lg"
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}

// ── Image viewer ──────────────────────────────────────────────────────────────

function ImageViewer({ file, scale }: { file: DrawingFile; scale: number }) {
  const src = file.previewUrl ?? file.uploadedUrl;
  if (!src) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No preview available.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full min-h-0 w-full overflow-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={file.name}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform 0.15s ease" }}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DrawingPreviewPanelProps {
  file: DrawingFile | null;
  onClose?: () => void;
  onPageCountChange?: (count: number) => void;
  /** Caches the Autodesk translation so the workspace doesn't pay for it twice. */
  onApsUrnResolved?: (urn: string) => void;
}

export function DrawingPreviewPanel({
  file,
  onClose,
  onPageCountChange,
  onApsUrnResolved,
}: DrawingPreviewPanelProps) {
  const [scale, setScale] = useState(1.0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handlePageCount = useCallback(
    (n: number) => {
      setTotalPages(n);
      onPageCountChange?.(n);
    },
    [onPageCountChange],
  );

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const resetZoom = () => setScale(1.0);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center">
          <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
          </svg>
        </div>
        <p className="text-sm font-medium">No drawing selected</p>
        <p className="text-xs text-muted-foreground/70">Click a file from the list to preview it here</p>
      </div>
    );
  }

  const canPreviewInline = file.category === "pdf" || file.category === "image";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 shrink-0 bg-muted/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground truncate max-w-48">
            Preview: {file.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {file.uploadedUrl && (
            <a
              href={file.uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50 relative">
        {file.category === "pdf" ? (
          <PdfViewer file={file} scale={scale} page={page} onPageCount={handlePageCount} />
        ) : file.category === "image" ? (
          <ImageViewer file={file} scale={scale} />
        ) : isApsExtension(file.extension) && (file.previewUrl ?? file.uploadedUrl) ? (
          <ApsViewer
            url={(file.previewUrl ?? file.uploadedUrl) as string}
            fileName={file.name}
            urn={file.apsUrn}
            onUrnResolved={onApsUrnResolved}
            preview
          />
        ) : isApsExtension(file.extension) ? (
          <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Waiting for the upload to finish…
          </div>
        ) : (
          <BimViewerPlaceholder file={file} />
        )}
      </div>

      {/* Bottom controls */}
      {canPreviewInline && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 shrink-0 bg-background">
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
              disabled={scale <= 0.25}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
              disabled={scale >= 3}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetZoom} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {file.category === "pdf" && totalPages > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[56px] text-center">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {file.category === "image" && (
            <span className="text-[11px] text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
