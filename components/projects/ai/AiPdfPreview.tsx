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
  onPageSize,
  className = "",
}: {
  url: string;
  page: number;
  scale: number;
  onLoadSuccess?: (numPages: number) => void;
  /** Natural page dimensions at scale 1, used to fit the page to its panel. */
  onPageSize?: (size: { width: number; height: number }) => void;
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
        <div className="px-6 py-16 text-center">
          <p className="text-xs font-medium text-red-500">
            This drawing could not be opened.
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">
            Your local copy may have been cleared. Go back to Drawing References
            and upload the file again to carry on.
          </p>
        </div>
      }
      className={className}
    >
      <Page
        pageNumber={page}
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        onLoadSuccess={(loaded) => {
          const viewport = loaded.getViewport({ scale: 1 });
          onPageSize?.({ width: viewport.width, height: viewport.height });
        }}
        className="shadow-lg"
      />
    </Document>
  );
}
