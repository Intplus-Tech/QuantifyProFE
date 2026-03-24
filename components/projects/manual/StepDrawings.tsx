"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UploadedFile } from "./types";
import { DRAWING_CATEGORIES } from "./constants";

interface StepDrawingsProps {
  drawings: UploadedFile[];
  onChange: (drawings: UploadedFile[]) => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function StepDrawings({ drawings, onChange, onNext, onSaveDraft }: StepDrawingsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    drawings[0]?.id ?? null
  );
  const [zoom, setZoom] = useState(1);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        category: "Architectural",
        id: crypto.randomUUID(),
      }));
      const updated = [...drawings, ...newFiles];
      onChange(updated);
      if (!selectedId && newFiles.length > 0) {
        setSelectedId(newFiles[0].id);
      }
    },
    [drawings, onChange, selectedId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  function removeFile(id: string) {
    const updated = drawings.filter((d) => d.id !== id);
    onChange(updated);
    if (selectedId === id) {
      setSelectedId(updated[0]?.id ?? null);
    }
  }

  function clearAll() {
    onChange([]);
    setSelectedId(null);
  }

  function setCategory(id: string, category: string) {
    onChange(drawings.map((d) => (d.id === id ? { ...d, category } : d)));
  }

  const selectedFile = drawings.find((d) => d.id === selectedId);

  function zoomIn()  { setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)); }
  function zoomOut() { setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)); }
  function openFullscreen() {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile.file);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Upload Drawings</h2>
        <p className="text-sm text-muted-foreground">
          Upload your project drawings. PDF, JPG, or PNG up to 50MB each.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Drop zone + file list ── */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload or drag files
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF, JPG, PNG — max 50MB per file
                </p>
              </div>
            </div>
          </div>

          {/* File list */}
          {drawings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  Uploaded Files ({drawings.length})
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2">
                {drawings.map((item, idx) => {
                  const isSelected = item.id === selectedId;
                  const isLoading = idx === 2; // simulated loading state for 3rd file
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/50 hover:bg-muted/20"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-1.5 py-0"
                          >
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {DRAWING_CATEGORIES.map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              onClick={() => setCategory(item.id, cat)}
                            >
                              Set as {cat}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeFile(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div className="border border-border/50 rounded-xl overflow-hidden bg-muted/5 flex flex-col min-h-[320px]">
          {selectedFile ? (
            <>
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background">
                <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                  Preview: {selectedFile.file.name}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => removeFile(selectedFile.id)}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={openFullscreen}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Preview image area */}
              <div className="flex-1 flex items-center justify-center p-4 bg-muted/10 overflow-hidden">
                {selectedFile.file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(selectedFile.file)}
                    alt={selectedFile.file.name}
                    style={{ transform: `scale(${zoom})`, transition: "transform 0.15s ease" }}
                    className="max-h-64 max-w-full object-contain rounded-md origin-center"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FileText className="w-16 h-16 opacity-30" />
                    <p className="text-sm">{selectedFile.file.name}</p>
                  </div>
                )}
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-2 py-3 border-t border-border/40 bg-background">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={openFullscreen}>
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <FileText className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select a file to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onSaveDraft}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Save, Continue later
        </button>
        <Button
          onClick={onNext}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
        >
          Save &amp; Proceed →
        </Button>
      </div>
    </div>
  );
}
