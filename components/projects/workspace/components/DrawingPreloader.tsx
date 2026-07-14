"use client";

import { Document } from "react-pdf";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

export function DrawingPreloader({
  drawings,
  onPageCountResolved,
}: {
  drawings: DrawingFile[];
  onPageCountResolved: (id: string, numPages: number) => void;
}) {
  const pdfsNeedingCount = drawings.filter(
    (d) => d.category === "pdf" && d.previewUrl && d.pages.length === 0,
  );

  if (pdfsNeedingCount.length === 0) return null;

  return (
    <div className="hidden" aria-hidden>
      {pdfsNeedingCount.map((d) => (
        <Document
          key={`preload-${d.id}`}
          file={d.previewUrl!}
          onLoadSuccess={({ numPages }) => onPageCountResolved(d.id, numPages)}
        />
      ))}
    </div>
  );
}
