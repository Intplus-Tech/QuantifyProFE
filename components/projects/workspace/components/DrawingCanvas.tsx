"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2, Box, PenLine } from "lucide-react";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DrawingCanvas({
  drawing,
  page,
  scale,
  onPageCountResolved,
}: {
  drawing: DrawingFile | null;
  page: number;
  scale: number;
  onPageCountResolved: (id: string, numPages: number) => void;
}) {
  if (!drawing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
        <p className="text-sm text-slate-500 font-medium">Viewing No Drawing...</p>
        <p className="text-xs text-slate-400">Select a drawing from the panel on the left</p>
      </div>
    );
  }

  if (drawing.category === "pdf" && drawing.previewUrl) {
    return (
      <div className="flex items-start justify-center h-full overflow-auto p-6">
        <Document
          file={drawing.previewUrl}
          onLoadSuccess={({ numPages }) => onPageCountResolved(drawing.id, numPages)}
          loading={
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-16">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          }
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
      </div>
    );
  }

  if (drawing.category === "image") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="flex items-center justify-center h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={drawing.name}
            style={{ transform: `scale(${scale})`, transformOrigin: "center", transition: "transform 0.15s ease" }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      );
    }
  }

  // SWAP POINT — replace this block with the real viewer when subscription is active:
  //
  // BIM/3D (.rvt, .ifc, .nwd, .skp, .fbx, .obj):
  //   <ApsViewer urn={drawing.urn} getToken={fetchApsToken} onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)} />
  //   — or for free IFC-only option —
  //   <IfcViewer url={drawing.previewUrl} onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)} />
  //
  // CAD (.dwg, .dxf, .dgn):
  //   <ApsViewer ... onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)} />
  //
  // Calling onPageCountResolved populates pages in Redux so the sidebar shows all sheets.
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
        <p className="text-sm font-semibold text-slate-500">{drawing.name}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {drawing.category === "bim-3d"
            ? "3D BIM preview requires Autodesk APS subscription."
            : "CAD preview requires viewer subscription."}
        </p>
      </div>
    </div>
  );
}
