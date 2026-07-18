"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Folder, FileText, ChevronDown, Loader2 } from "lucide-react";
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
  const displayName = file.name.replace(/\.[^.]+$/, "");
  const isMultiPage = file.pages.length > 1;
  // True for any format still waiting on page count (only PDFs start with pages:[])
  const isCountingPages =
    file.pages.length === 0 &&
    file.status !== "error" &&
    file.status !== "queued";

  const [expanded, setExpanded] = useState(isActive && isMultiPage);

  // Auto-expand when this file becomes active
  useEffect(() => {
    if (isActive && isMultiPage) setExpanded(true);
  }, [isActive, isMultiPage]);

  return (
    <div>
      {/* ── File row — rendered as a folder (it contains pages) ── */}
      <div
        className={`flex items-center gap-2 px-3 py-2 transition-colors ${
          isActive ? "bg-amber-50" : "hover:bg-slate-50"
        }`}
      >
        {/* Folder icon + name: clicking selects the file */}
        <button
          onClick={onSelectFile}
          title={file.name}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {isCountingPages ? (
            <Loader2 className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-spin" />
          ) : expanded || isActive ? (
            <FolderOpen
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive ? "text-amber-500" : "text-slate-400"
              }`}
            />
          ) : (
            <Folder
              className="w-3.5 h-3.5 shrink-0 text-slate-400"
            />
          )}

          <span
            className={`text-[11px] font-semibold truncate leading-snug ${
              isActive ? "text-amber-700" : "text-slate-700"
            }`}
          >
            {displayName}
          </span>
        </button>

        {/* Right side: page count + chevron toggle */}
        {isMultiPage && (
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <span
              className={`text-[9px] font-semibold tabular-nums ${
                isActive ? "text-amber-500" : "text-slate-400"
              }`}
            >
              {file.pages.length}p
            </span>
            <button
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? "Collapse pages" : "Show pages"}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isActive ? "text-amber-500" : "text-slate-400"
                } ${expanded ? "" : "-rotate-90"}`}
              />
            </button>
          </div>
        )}

        {/* Loading indicator while page count resolves */}
        {isCountingPages && (
          <span className="text-[9px] text-slate-300 shrink-0">…</span>
        )}
      </div>

      {/* ── Page list — each page is a "file" inside the folder ── */}
      {isMultiPage && expanded && (
        <div className="ml-5 border-l-2 border-amber-100">
          {file.pages.map((pg) => {
            const isActivePage = isActive && activePage === pg.number;
            return (
              <button
                key={pg.number}
                onClick={() => onSelectPage(pg.number)}
                className={`w-full text-left flex items-center gap-2 pl-3 pr-2.5 py-1.5 transition-colors ${
                  isActivePage
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <FileText
                  className={`w-3 h-3 shrink-0 ${
                    isActivePage ? "text-amber-400" : "text-slate-300"
                  }`}
                />
                <span
                  className={`text-[10px] truncate flex-1 ${
                    isActivePage ? "font-semibold text-amber-700" : "text-slate-500"
                  }`}
                >
                  {pg.label}
                </span>
                {isActivePage && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
