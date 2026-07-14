"use client";

import { FileText } from "lucide-react";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

export function FileRow({
  file,
  isActive,
  activePage,
  onSelectFile,
  onSelectPage,
}: {
  file: DrawingFile;
  isActive: boolean;
  activePage: number;
  onSelectFile: () => void;
  onSelectPage: (pageNum: number) => void;
}) {
  const hasPages = file.pages.length > 0;
  const displayName = file.name.replace(/\.[^.]+$/, "");

  return (
    <div>
      <button
        onClick={onSelectFile}
        title={displayName}
        className={`w-full flex items-center gap-2.5 pl-6 pr-3 py-2 text-left transition-colors ${isActive ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"}`}
      >
        <FileText
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-500" : "text-slate-400"}`}
        />
        <span
          className={`text-[11px] truncate flex-1 ${isActive ? "font-semibold text-amber-700" : "font-medium text-slate-600"}`}
        >
          {displayName}
        </span>
      </button>
      {hasPages && (
        <div className="ml-6 border-l-2 border-amber-200">
          {file.pages.map((pg) => (
            <button
              key={pg.number}
              onClick={() => onSelectPage(pg.number)}
              className={`w-full text-left flex items-center gap-2 pl-4 pr-3 py-1.5 transition-colors ${
                isActive && activePage === pg.number
                  ? "text-amber-700 font-semibold bg-amber-50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-amber-600"
              }`}
            >
              <FileText className="w-2.5 h-2.5 shrink-0 text-amber-300" />
              <span className="text-[10px] truncate">{pg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
