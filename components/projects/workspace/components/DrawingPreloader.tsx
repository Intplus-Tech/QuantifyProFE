"use client";

import { useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

// Mirror the same worker the canvas uses
if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export function DrawingPreloader({
  drawings,
  onPageCountResolved,
}: {
  drawings: DrawingFile[];
  onPageCountResolved: (id: string, numPages: number) => void;
}) {
  // Track IDs already in-flight so we never double-count
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const drawing of drawings) {
      if (
        drawing.category === "pdf" &&
        drawing.previewUrl &&
        drawing.pages.length === 0 &&
        !inFlight.current.has(drawing.id)
      ) {
        inFlight.current.add(drawing.id);

        pdfjs
          .getDocument({ url: drawing.previewUrl })
          .promise.then((pdf) => {
            onPageCountResolved(drawing.id, pdf.numPages);
            pdf.destroy();
          })
          .catch((err) => {
            console.error("[DrawingPreloader]", drawing.name, err);
          })
          .finally(() => {
            inFlight.current.delete(drawing.id);
          });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings]);

  return null;
}
