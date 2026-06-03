"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addDrawing,
  updateDrawing,
  removeDrawing,
  type DrawingFile,
  type DrawingCategory,
} from "@/store/slices/manualWizardSlice";
import { DrawingFileList } from "./DrawingFileList";
import { DrawingPreviewPanel } from "./DrawingPreviewPanel";
import { useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  // BIM — browsers don't know these MIME types, so we accept via extension only
  "application/octet-stream": [".rvt", ".ifc", ".nwd", ".skp", ".fbx", ".obj", ".dwg", ".dxf", ".dgn"],
};

const EXT_TO_CATEGORY: Record<string, DrawingCategory> = {
  ".pdf": "pdf",
  ".jpg": "image", ".jpeg": "image", ".png": "image",
  ".rvt": "bim-3d", ".ifc": "bim-3d", ".nwd": "bim-3d",
  ".skp": "bim-3d", ".fbx": "bim-3d", ".obj": "bim-3d",
  ".dwg": "cad-2d", ".dxf": "cad-2d", ".dgn": "cad-2d",
};

function getExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

// ── Simulated upload (plug-and-play when real API is ready) ──────────────────
//
// TODO: Replace the body of this function with a real API call:
//   const { url } = await uploadDrawingFile(file, { onProgress });
//   return url;
//
async function simulateUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<{ url: string }> {
  console.log("[DrawingUpload] Starting upload →", { name: file.name, size: file.size, type: file.type });

  for (let p = 10; p <= 90; p += 20) {
    await new Promise((r) => setTimeout(r, 200));
    onProgress(p);
  }
  await new Promise((r) => setTimeout(r, 500)); // simulate processing
  onProgress(100);

  const url = `https://cdn.placeholder.example/drawings/${encodeURIComponent(file.name)}`;
  console.log("[DrawingUpload] Complete →", { name: file.name, url });
  return { url };
}

// ── Component ────────────────────────────────────────────────────────────────

interface StepDrawingsProps {
  onBack: () => void;
  onSaveAndProceed: () => void;
  isSaving: boolean;
}

export function StepDrawings({ onBack, onSaveAndProceed, isSaving }: StepDrawingsProps) {
  const dispatch = useAppDispatch();
  const drawings = useAppSelector((state) => state.manualWizard.drawings);
  const [selectedId, setSelectedId] = useState<string | null>(drawings[0]?.id ?? null);

  const selectedFile = drawings.find((d) => d.id === selectedId) ?? null;

  const processFile = useCallback(
    async (file: File) => {
      const ext = getExt(file.name);
      const category = EXT_TO_CATEGORY[ext] ?? "pdf";
      const id = crypto.randomUUID();

      // Create blob URL for image/PDF immediate preview
      const previewUrl =
        category === "pdf" || category === "image"
          ? URL.createObjectURL(file)
          : undefined;

      const entry: DrawingFile = {
        id,
        name: file.name,
        size: file.size,
        extension: ext,
        category,
        status: "uploading",
        progress: 0,
        previewUrl,
      };

      dispatch(addDrawing(entry));
      setSelectedId(id);

      try {
        const { url } = await simulateUpload(file, (progress) => {
          dispatch(updateDrawing({ id, progress, status: "uploading" }));
        });

        dispatch(updateDrawing({ id, status: "processing", progress: 100 }));
        await new Promise((r) => setTimeout(r, 600));
        dispatch(updateDrawing({ id, status: "complete", uploadedUrl: url }));
      } catch {
        dispatch(updateDrawing({ id, status: "error", error: "Upload failed. Please retry." }));
        toast.error(`Failed to upload "${file.name}"`);
      }
    },
    [dispatch],
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
      const remaining = MAX_FILES - drawings.length;

      if (rejected.length > 0) {
        rejected.forEach(({ file, errors }) => {
          const reason = errors[0]?.message ?? "Invalid file";
          toast.error(`"${file.name}" rejected — ${reason}`);
        });
      }

      const toUpload = accepted.slice(0, remaining);
      if (accepted.length > remaining) {
        toast.warning(`Max ${MAX_FILES} files allowed. Only first ${remaining} added.`);
      }

      toUpload.forEach(processFile);
    },
    [drawings.length, processFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    disabled: drawings.length >= MAX_FILES,
    multiple: true,
  });

  function handleClearAll() {
    drawings.forEach((d) => dispatch(removeDrawing(d.id)));
    setSelectedId(null);
  }

  function handleRemove(id: string) {
    dispatch(removeDrawing(id));
    if (selectedId === id) {
      const next = drawings.find((d) => d.id !== id);
      setSelectedId(next?.id ?? null);
    }
  }

  const allComplete = drawings.length > 0 && drawings.every((d) => d.status === "complete");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Drawing References</h2>
        <p className="text-sm text-muted-foreground">
          Upload PDF or image files to serve as the source of truth for your estimates. These
          drawings will be available for quantity take-off in later steps.
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4">
        {/* Left: upload + list */}
        <div className="flex flex-col gap-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-12 px-6 cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : drawings.length >= MAX_FILES
                  ? "border-border/30 bg-muted/20 cursor-not-allowed opacity-60"
                  : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CloudUpload className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {drawings.length >= MAX_FILES ? "Maximum files reached" : "Click to upload or drag files"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, DWG, DXF, RVT, IFC, NWD, SKP…
              </p>
              <p className="text-xs text-muted-foreground">Up to {MAX_FILES} files · 20 MB each</p>
            </div>
          </div>

          {/* Format hint */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">BIM files</span> (.rvt, .ifc, .nwd, .skp) and{" "}
              <span className="font-semibold text-foreground">CAD files</span> (.dwg, .dxf, .dgn) will be
              uploaded and processed. 3D interactive preview unlocks with an Autodesk APS subscription.
            </p>
          </div>

          {/* File list */}
          {drawings.length > 0 && (
            <DrawingFileList
              files={drawings}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          )}
        </div>

        {/* Right: preview panel */}
        <div className="hidden lg:flex border border-border/40 rounded-xl overflow-hidden bg-card min-h-[460px] flex-col">
          <DrawingPreviewPanel file={selectedFile} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack} className="gap-2">
          ← Back to Details
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onSaveAndProceed}
            disabled={isSaving}
            className="text-primary hover:text-primary/80"
          >
            Save, Continue later
          </Button>
          <Button
            onClick={onSaveAndProceed}
            disabled={isSaving || drawings.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {isSaving ? "Saving…" : "Save & Proceed →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
