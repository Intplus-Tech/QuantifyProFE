"use client";

import { MoreVertical, Trash2, FileText, Image, Box, PenLine } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

// ── Per-category icon ────────────────────────────────────────────────────────

function FileIcon({ category }: { category: DrawingFile["category"] }) {
  if (category === "image") return <Image className="w-4 h-4 text-blue-500" />;
  if (category === "bim-3d") return <Box className="w-4 h-4 text-violet-500" />;
  if (category === "cad-2d") return <PenLine className="w-4 h-4 text-cyan-500" />;
  return <FileText className="w-4 h-4 text-orange-500" />;
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ file }: { file: DrawingFile }) {
  if (file.status === "complete") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        Render Complete
      </span>
    );
  }

  if (file.status === "uploading") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        {file.progress}% Uploading
      </span>
    );
  }

  if (file.status === "processing") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Processing
      </span>
    );
  }

  if (file.status === "error") {
    return (
      <span className="text-[11px] font-medium text-destructive">
        {file.error ?? "Upload failed"}
      </span>
    );
  }

  // queued
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="6" width="18" height="4" rx="1" />
        <rect x="3" y="14" width="12" height="4" rx="1" />
      </svg>
      Queued
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface DrawingFileListProps {
  files: DrawingFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function DrawingFileList({
  files,
  selectedId,
  onSelect,
  onRemove,
  onClearAll,
}: DrawingFileListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">
          Uploaded Files ({files.length})
        </p>
        {files.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
              selectedId === file.id
                ? "border-primary/60 bg-primary/5"
                : "border-border/50 bg-card hover:bg-muted/40"
            }`}
          >
            <div className="shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
              <FileIcon category={file.category} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge file={file} />
                <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
