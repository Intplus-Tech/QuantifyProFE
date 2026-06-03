"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  PenLine,
  Pentagon,
  Hash,
  Type,
  Undo2,
  Redo2,
  FolderOpen,
  Search,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Image,
  Box,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { useAppSelector } from "@/store/hooks";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Types ────────────────────────────────────────────────────────────────────

type ToolId = "markup" | "polygon" | "count" | "text" | "undo" | "redo";

interface DrawingEntry {
  id: string;
  name: string;
  category: "pdf" | "image" | "bim-3d" | "cad-2d";
  previewUrl?: string;
  uploadedUrl?: string;
}

// ── Colour palette for the tool bar ─────────────────────────────────────────

const PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b",
];

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: { id: ToolId; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "markup", icon: PenLine, label: "Markup" },
  { id: "polygon", icon: Pentagon, label: "Polygon" },
  { id: "count", icon: Hash, label: "Count" },
  { id: "text", icon: Type, label: "Text" },
  { id: "undo", icon: Undo2, label: "Undo" },
  { id: "redo", icon: Redo2, label: "Redo" },
];

// ── Drawing canvas area ──────────────────────────────────────────────────────

function DrawingCanvas({
  drawing,
  scale,
  page,
  onPageCount,
}: {
  drawing: DrawingEntry | null;
  scale: number;
  page: number;
  onPageCount: (n: number) => void;
}) {
  if (!drawing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
        <p className="text-sm text-slate-500 font-medium">Viewing No Drawing...</p>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2">
          Open Drawing
        </button>
      </div>
    );
  }

  if (drawing.category === "pdf" && drawing.previewUrl) {
    return (
      <div className="flex items-start justify-center h-full overflow-auto p-4">
        <Document
          file={drawing.previewUrl}
          onLoadSuccess={({ numPages }) => onPageCount(numPages)}
          loading={
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-12">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading drawing…
            </div>
          }
        >
          <Page
            pageNumber={page}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    );
  }

  if (drawing.category === "image") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={drawing.name}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease",
            }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      );
    }
  }

  // BIM / CAD placeholder
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        {drawing.category === "bim-3d" ? (
          <Box className="w-10 h-10 text-slate-400" />
        ) : (
          <PenLine className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">{drawing.name}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-52">
          {drawing.category === "bim-3d"
            ? "3D BIM preview requires Autodesk APS subscription."
            : "CAD preview requires viewer subscription."}
        </p>
      </div>
    </div>
  );
}

// ── Drawing entry icon ───────────────────────────────────────────────────────

function DrawingIcon({ category }: { category: DrawingEntry["category"] }) {
  if (category === "image") return <Image className="w-4 h-4 text-blue-500 shrink-0" />;
  if (category === "bim-3d") return <Box className="w-4 h-4 text-violet-500 shrink-0" />;
  return <FileText className="w-4 h-4 text-orange-500 shrink-0" />;
}

// ── Main workspace component ─────────────────────────────────────────────────

interface ProjectWorkspaceViewProps {
  projectId: string;
  basePath: string;
  mode?: string; // kept for compatibility, not used in new canvas view
}

export function ProjectWorkspaceView({ projectId, basePath }: ProjectWorkspaceViewProps) {
  const { data: projectResponse, isLoading } = useGetProjectByIdQuery(projectId);
  const backendProject = projectResponse?.data;

  // Pull drawings stored in Redux from the setup wizard
  const wizardDrawings = useAppSelector((state) => state.manualWizard.drawings);

  // Build drawing entries: prefer backend drawings, fall back to wizard state
  const drawings: DrawingEntry[] = wizardDrawings
    .filter((d) => d.status === "complete" || d.previewUrl)
    .map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      previewUrl: d.previewUrl,
      uploadedUrl: d.uploadedUrl,
    }));

  const projectName =
    backendProject?.name ?? `Project ${projectId.slice(0, 8)}`;

  // UI state
  const [activeTool, setActiveTool] = useState<ToolId>("markup");
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [elementSearch, setElementSearch] = useState("");
  const [drawingsOpen, setDrawingsOpen] = useState(true);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(
    drawings[0]?.id ?? null,
  );
  const [scale, setScale] = useState(1.0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [autoSaveLabel] = useState("Auto-saved just now");

  const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId) ?? null;

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const resetZoom = () => setScale(1.0);

  const handlePageCount = useCallback((n: number) => setTotalPages(n), []);

  if (isLoading && !backendProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* ── Top bar ── */}
      <header className="h-12 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{projectName}</span>
          <span className="text-slate-300">›</span>
          <span>Workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Save className="w-3 h-3" />
            {autoSaveLabel}
          </div>
          <Button
            size="sm"
            className="h-7 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium"
            variant="outline"
            onClick={() => (window.location.href = `${basePath}/${projectId}/boq`)}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            View BOQ
          </Button>
        </div>
      </header>

      {/* ── Body: left panel + canvas ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left panel ── */}
        <aside className="w-[220px] shrink-0 bg-[#f8fafc] border-r border-slate-200 flex flex-col">
          {/* Tools */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-200">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2 px-1">
              Tools
            </p>
            <div className="flex flex-wrap gap-1">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  title={tool.label}
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                    activeTool === tool.id
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <tool.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            {/* Colour swatch row */}
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setActiveColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-4 h-4 rounded-sm transition-transform ${
                    activeColor === c ? "ring-2 ring-offset-1 ring-slate-500 scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Elements */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-3 pt-3 pb-2 shrink-0">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2 px-1">
                Elements
              </p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <Input
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-7 pl-7 text-xs border-slate-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-2">
              {/* Empty state — elements populated in a later phase */}
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-[11px] text-slate-400">No elements yet</p>
              </div>
            </div>

            <div className="px-3 pb-3 shrink-0">
              <button className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 border border-dashed border-slate-300 rounded-md py-2 hover:bg-slate-50 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Create Elements
              </button>
            </div>
          </div>

          {/* Drawings drawer (bottom of left panel) */}
          <div className="border-t border-slate-200 shrink-0">
            <button
              onClick={() => setDrawingsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-3 bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Drawings</span>
                {drawings.length > 0 && (
                  <span className="bg-white/20 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                    {drawings.length}
                  </span>
                )}
              </div>
              <ChevronUp
                className={`w-3.5 h-3.5 transition-transform ${drawingsOpen ? "" : "rotate-180"}`}
              />
            </button>

            {drawingsOpen && (
              <div className="bg-white border-t border-slate-200 max-h-52 overflow-y-auto">
                {drawings.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[11px] text-slate-400">No drawings uploaded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {drawings.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDrawingId(d.id);
                          setPage(1);
                          setScale(1.0);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-left w-full transition-colors ${
                          selectedDrawingId === d.id
                            ? "bg-amber-50 text-amber-700"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <DrawingIcon category={d.category} />
                        <span className="text-[11px] font-medium truncate flex-1">{d.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Canvas area ── */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Zoom + page controls */}
          {selectedDrawing && (
            <div className="shrink-0 flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-200">
              <div className="flex items-center gap-1">
                <button
                  onClick={zoomOut}
                  disabled={scale <= 0.25}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-500 w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  disabled={scale >= 3}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                  title="Reset zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedDrawing.category === "pdf" && totalPages > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400 truncate max-w-xs hidden md:block">
                {selectedDrawing.name}
              </p>
            </div>
          )}

          {/* Drawing surface */}
          <div className="flex-1 overflow-hidden bg-[#e8edf2] relative">
            <DrawingCanvas
              drawing={selectedDrawing}
              scale={scale}
              page={page}
              onPageCount={handlePageCount}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
