"use client";

import { RotateCcw } from "lucide-react";
import type { DocumentMeta } from "./types";

interface BOQFooterBarProps {
  meta: DocumentMeta;
  unsavedCount: number;
}

export function BOQFooterBar({ meta, unsavedCount }: BOQFooterBarProps) {
  return (
    <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-3 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>Last edited: {meta.lastEdited}</span>
        <span>Version: {meta.version}</span>
        <span>
          Ref: {meta.ref} — {meta.firm}
        </span>
      </div>

      {unsavedCount > 0 && (
        <span className="flex items-center gap-1.5 font-semibold text-amber-600">
          <RotateCcw className="h-3 w-3" />
          {unsavedCount} unsaved change{unsavedCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
