"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export function AiPdfPreview({
  url,
  page,
  scale,
  onLoadSuccess,
  className = "",
}: {
  url: string;
  page: number;
  scale: number;
  onLoadSuccess?: (numPages: number) => void;
  className?: string;
}) {
  return (
    <Document
      file={url}
      onLoadSuccess={({ numPages }) => onLoadSuccess?.(numPages)}
      loading={
        <div className="flex items-center gap-2 py-16 text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          Loading drawing…
        </div>
      }
      error={
        <p className="py-16 text-xs text-red-500">Failed to load this drawing.</p>
      }
      className={className}
    >
      <Page
        pageNumber={page}
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="shadow-lg"
      />
    </Document>
  );
}
