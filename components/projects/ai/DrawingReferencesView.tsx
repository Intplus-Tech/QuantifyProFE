"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Eye,
  FileImage,
  FileText,
  Hourglass,
  Loader2,
  Maximize2,
  Minus,
  MoreVertical,
  Plus,
  SquareArrowOutUpRight,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addAiDrawing,
  clearAiDrawings,
  removeAiDrawing,
  setActiveAiDrawing,
  setAiDrawingPageCount,
  updateAiDrawing,
  type AiDrawing,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { AiFlowCard, AiFlowShell } from "./AiFlowShell";

const AiPdfPreview = dynamic(
  () => import("./AiPdfPreview").then((m) => ({ default: m.AiPdfPreview })),
  { ssr: false },
);

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const truncate = (name: string, head = 16) => {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot) : "";
  const stem = dot > -1 ? name.slice(0, dot) : name;
  return stem.length <= head ? name : `${stem.slice(0, head)}... ${ext}`;
};

/**
 * TODO: Replace with the real upload endpoint when it is available:
 *   const { url } = await uploadDrawingFile(file, { onProgress });
 * Everything downstream (Redux state, progress, status badges, preview) is
 * already wired and needs no change.
 */
async function simulateUpload(
  file: File,
  onProgress: (progress: number) => void,
): Promise<{ url: string }> {
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 90 + Math.random() * 110));
    onProgress(Math.round((i / steps) * 100));
  }
  return { url: URL.createObjectURL(file) };
}

export function DrawingReferencesView({
  basePath = "/projects",
  projectId,
}: {
  basePath?: string;
  projectId: string;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { drawings, activeDrawingId } = useSelector((state: RootState) => state.aiFlow);

  // `zoom` is a multiplier on top of the fit-to-panel scale, so the default
  // view (zoom = 1) always fits exactly and never produces a scrollbar.
  const [zoom, setZoom] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const [panel, setPanel] = useState({ width: 0, height: 0 });
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const active = drawings.find((d) => d.id === activeDrawingId) ?? null;

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    // ResizeObserver fires once on observe, so the initial size arrives here
    // rather than needing a synchronous measure.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setPanel({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    if (!pageSize || panel.width === 0 || panel.height === 0) return 0.3;
    const padding = 24;
    return Math.min(
      (panel.width - padding) / pageSize.width,
      (panel.height - padding) / pageSize.height,
    );
  }, [pageSize, panel]);

  const scale = Math.max(0.05, fitScale * zoom);

  const onDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

        const entry: AiDrawing = {
          id,
          name: file.name,
          size: file.size,
          extension,
          status: "queued",
          progress: 0,
          previewUrl: URL.createObjectURL(file),
        };
        dispatch(addAiDrawing(entry));

        try {
          dispatch(updateAiDrawing({ id, changes: { status: "uploading" } }));
          const { url } = await simulateUpload(file, (progress) =>
            dispatch(updateAiDrawing({ id, changes: { progress } })),
          );
          dispatch(updateAiDrawing({ id, changes: { status: "processing", progress: 100 } }));
          await new Promise((r) => setTimeout(r, 600));
          dispatch(
            updateAiDrawing({
              id,
              changes: { status: "complete", uploadedUrl: url },
            }),
          );
        } catch {
          dispatch(
            updateAiDrawing({
              id,
              changes: { status: "error", error: "Upload failed" },
            }),
          );
          toast.error(`Could not upload ${file.name}`);
        }
      }
    },
    [dispatch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    onDropRejected: (rejections) => {
      rejections.forEach((r) =>
        toast.error(`${r.file.name}: ${r.errors[0]?.message ?? "rejected"}`),
      );
    },
  });

  const readyToProcess =
    drawings.length > 0 && drawings.every((d) => d.status === "complete");

  const handleStart = () => {
    if (!readyToProcess) {
      toast.warning("Wait for every drawing to finish uploading.");
      return;
    }
    router.push(`${basePath}/ai/${projectId}/extract`);
  };

  return (
    <AiFlowShell backHref={basePath} fitToScreen>
      <AiFlowCard
        fill
        title="Drawing References"
        description="Upload PDF or image files to serve as the source of truth for your estimates. These drawings will be available for quantity take-off in later steps."
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-[11px]"
            onClick={() =>
              toast.info("Upload Guide", {
                description:
                  "Use vector PDFs where possible — scanned rasters reduce OCR confidence. Include the title block, grid references and any bar bending schedule pages.",
              })
            }
          >
            <CircleHelp className="h-3.5 w-3.5" />
            Upload Guide
          </Button>
        }
        footer={
          <Button
            className="h-10 gap-2"
            onClick={handleStart}
            disabled={!readyToProcess}
          >
            Start Processing
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      >
        {/* Fills the viewport-locked card, so adding files never changes the
            page height — the file list absorbs the overflow inside its column. */}
        <div className="grid h-full min-h-0 gap-6 lg:grid-cols-2">
          {/* ── Upload column ─────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-col gap-3">
            <div
              {...getRootProps()}
              className={`flex h-[190px] min-h-[120px] shrink cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragActive
                  ? "border-amber-400 bg-amber-50/60"
                  : "border-slate-200 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <UploadCloud className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Click to upload or drag files
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Support for PDF, JPG, PNG
              </p>
              <p className="text-[11px] text-slate-400">Up to 50MB per file</p>
            </div>

            {drawings.length > 0 && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between pb-2">
                  <p className="text-xs font-medium text-slate-600">
                    Uploaded Files ({drawings.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(clearAiDrawings())}
                    className="text-[11px] text-slate-400 transition-colors hover:text-red-500"
                  >
                    Clear all
                  </button>
                </div>

                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {drawings.map((drawing) => (
                    <FileRow
                      key={drawing.id}
                      drawing={drawing}
                      active={drawing.id === activeDrawingId}
                      onSelect={() => {
                        dispatch(setActiveAiDrawing(drawing.id));
                        setPreviewPage(1);
                        setZoom(1);
                      }}
                      onRemove={() => dispatch(removeAiDrawing(drawing.id))}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Preview column ────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 py-2">
              <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-600">
                {active ? `Preview: ${active.name}` : "No drawing selected"}
              </p>
              {active?.previewUrl && (
                <button
                  type="button"
                  aria-label="Open in new tab"
                  onClick={() => window.open(active.previewUrl, "_blank")}
                  className="rounded border border-slate-200 p-1 text-slate-400 transition-colors hover:text-amber-600"
                >
                  <SquareArrowOutUpRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div
              ref={panelRef}
              className={`relative flex-1 bg-[#eef1f5] ${
                zoom > 1 ? "overflow-auto" : "overflow-hidden"
              }`}
            >
              <div className="flex h-full w-full items-center justify-center">
                {!active && (
                  <p className="text-xs text-slate-400">
                    Upload a drawing to preview it here
                  </p>
                )}

                {active?.previewUrl && active.extension === ".pdf" && (
                  <AiPdfPreview
                    url={active.previewUrl}
                    page={previewPage}
                    scale={scale}
                    onPageSize={setPageSize}
                    onLoadSuccess={(numPages) =>
                      dispatch(
                        setAiDrawingPageCount({ id: active.id, pageCount: numPages }),
                      )
                    }
                  />
                )}

                {active?.previewUrl && active.extension !== ".pdf" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.previewUrl}
                    alt={active.name}
                    style={{ transform: `scale(${zoom})` }}
                    className="max-h-full max-w-full object-contain shadow-lg"
                  />
                )}
              </div>

              {active && (
                <>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur">
                    <ZoomButton
                      label="Zoom out"
                      onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </ZoomButton>
                    <ZoomButton
                      label="Zoom in"
                      onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </ZoomButton>
                    <ZoomButton label="Fit to panel" onClick={() => setZoom(1)}>
                      <Maximize2 className="h-3.5 w-3.5" />
                    </ZoomButton>
                  </div>

                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
                    <FileText className="h-3 w-3 text-amber-500" />
                    Page {previewPage}
                    {active.pageCount ? ` of ${active.pageCount}` : ""}
                  </div>
                </>
              )}
            </div>

            {active?.pageCount && active.pageCount > 1 && (
              <div className="flex shrink-0 items-center justify-center gap-2 border-t border-slate-100 bg-white px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={previewPage <= 1}
                  onClick={() => setPreviewPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-[11px] tabular-nums text-slate-500">
                  {previewPage} / {active.pageCount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={previewPage >= active.pageCount}
                  onClick={() => setPreviewPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </AiFlowCard>
    </AiFlowShell>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-amber-600"
    >
      {children}
    </button>
  );
}

function FileRow({
  drawing,
  active,
  onSelect,
  onRemove,
}: {
  drawing: AiDrawing;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const isImage = [".jpg", ".jpeg", ".png"].includes(drawing.extension);

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          active
            ? "border-amber-400 bg-amber-50/40"
            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white ring-1 ring-slate-200">
          {isImage ? (
            <FileImage className="h-4 w-4 text-amber-500" />
          ) : (
            <FileText className="h-4 w-4 text-amber-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-700">
            {truncate(drawing.name)}
          </p>
          <StatusLine drawing={drawing} />
        </div>

        <span className="shrink-0 text-[11px] text-slate-400">
          {formatSize(drawing.size)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${drawing.name}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function StatusLine({ drawing }: { drawing: AiDrawing }) {
  if (drawing.status === "complete") {
    return (
      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Render Complete
      </span>
    );
  }

  if (drawing.status === "error") {
    return (
      <span className="mt-0.5 text-[11px] text-red-500">
        {drawing.error ?? "Upload failed"}
      </span>
    );
  }

  if (drawing.status === "queued") {
    return (
      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
        <Hourglass className="h-3 w-3" />
        Queued
      </span>
    );
  }

  return (
    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-sky-600">
      <Loader2 className="h-3 w-3 animate-spin" />
      {drawing.progress}% {drawing.status === "processing" ? "Rendering" : "Processing"}
    </span>
  );
}
