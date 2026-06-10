"use client";

import { useState, useCallback, useRef } from "react";
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
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Image,
  Box,
  Loader2,
  Save,
  FolderOpen,
  FolderPlus,
  Upload,
  Home,
  ChevronRight,
  MousePointer2,
  Hand,
  LayoutDashboard,
  FileUp,
  Wrench,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addDrawing,
  addFolder,
  setDrawingPages,
  type DrawingFile,
  type DrawingFolder,
  type DrawingPage,
  type DrawingCategory,
} from "@/store/slices/manualWizardSlice";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Constants ────────────────────────────────────────────────────────────────

type ToolId = "select" | "grab" | "markup" | "polygon" | "count" | "text" | "undo" | "redo";

const PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b",
];

const TOOLS: { id: ToolId; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "select",  icon: MousePointer2, label: "Select" },
  { id: "grab",    icon: Hand,          label: "Pan" },
  { id: "markup",  icon: PenLine,       label: "Markup" },
  { id: "polygon", icon: Pentagon,      label: "Polygon" },
  { id: "count",   icon: Hash,          label: "Count" },
  { id: "text",    icon: Type,          label: "Text" },
  { id: "undo",    icon: Undo2,         label: "Undo" },
  { id: "redo",    icon: Redo2,         label: "Redo" },
];

const ACCEPTED_EXTENSIONS = [
  ".pdf", ".jpg", ".jpeg", ".png",
  ".rvt", ".ifc", ".nwd", ".skp", ".fbx", ".obj",
  ".dwg", ".dxf", ".dgn",
];

const EXT_CATEGORY: Record<string, DrawingCategory> = {
  ".pdf": "pdf",
  ".jpg": "image", ".jpeg": "image", ".png": "image",
  ".rvt": "bim-3d", ".ifc": "bim-3d", ".nwd": "bim-3d",
  ".skp": "bim-3d", ".fbx": "bim-3d", ".obj": "bim-3d",
  ".dwg": "cad-2d", ".dxf": "cad-2d", ".dgn": "cad-2d",
};

function getExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

// ── Simulated upload (same pattern as StepDrawings — swap body for real API) ──
async function simulateUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  // TODO: Replace with real API call: const { url } = await uploadDrawingFile(file, { onProgress });
  console.log("[WorkspaceUpload]", { name: file.name, size: file.size });
  for (let p = 10; p <= 90; p += 20) {
    await new Promise((r) => setTimeout(r, 180));
    onProgress(p);
  }
  await new Promise((r) => setTimeout(r, 400));
  return `https://cdn.placeholder.example/drawings/${encodeURIComponent(file.name)}`;
}

// ── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ category }: { category: DrawingFile["category"] }) {
  if (category === "image")  return <Image   className="w-3 h-3 shrink-0 text-blue-400" />;
  if (category === "bim-3d") return <Box     className="w-3 h-3 shrink-0 text-violet-400" />;
  if (category === "cad-2d") return <PenLine className="w-3 h-3 shrink-0 text-cyan-400" />;
  return <FileText className="w-3 h-3 shrink-0 text-orange-400" />;
}

// ── Drawing canvas ───────────────────────────────────────────────────────────

function DrawingCanvas({
  drawing,
  page,
  scale,
  onPageCountResolved,
}: {
  drawing: DrawingFile | null;
  page: number;
  scale: number;
  onPageCountResolved: (id: string, numPages: number) => void;
}) {
  if (!drawing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
        <p className="text-sm text-slate-500 font-medium">Viewing No Drawing...</p>
        <p className="text-xs text-slate-400">Select a drawing from the panel on the left</p>
      </div>
    );
  }

  if (drawing.category === "pdf" && drawing.previewUrl) {
    return (
      <div className="flex items-start justify-center h-full overflow-auto p-6">
        <Document
          file={drawing.previewUrl}
          onLoadSuccess={({ numPages }) => onPageCountResolved(drawing.id, numPages)}
          loading={
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-16">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          }
          error={
            <p className="text-sm text-destructive mt-16">Failed to load drawing.</p>
          }
        >
          <Page
            pageNumber={page}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-2xl"
          />
        </Document>
      </div>
    );
  }

  if (drawing.category === "image") {
    const src = drawing.previewUrl ?? drawing.uploadedUrl;
    if (src) {
      return (
        <div className="flex items-center justify-center h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={drawing.name}
            style={{ transform: `scale(${scale})`, transformOrigin: "center", transition: "transform 0.15s ease" }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      );
    }
  }

  /* SWAP POINT — replace this block with <ApsViewer urn={drawing.urn} getToken={...} /> when APS subscription is active */
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        {drawing.category === "bim-3d"
          ? <Box className="w-10 h-10 text-slate-300" />
          : <PenLine className="w-10 h-10 text-slate-300" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">{drawing.name}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {drawing.category === "bim-3d"
            ? "3D BIM preview requires Autodesk APS subscription."
            : "CAD preview requires viewer subscription."}
        </p>
      </div>
    </div>
  );
}

// ── File row (with expandable pages) ────────────────────────────────────────

function FileRow({
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
  const hasMultiplePages = file.pages.length > 1;
  const displayName = file.name.replace(/\.[^.]+$/, "");

  return (
    <div>
      {/* File row */}
      <button
        onClick={onSelectFile}
        title={displayName}
        className={`w-full flex items-center gap-2.5 pl-6 pr-3 py-2 text-left transition-colors ${
          isActive
            ? "bg-amber-50 text-amber-700"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <FileText
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-500" : "text-slate-400"}`}
        />
        <span
          className={`text-[11px] truncate flex-1 ${
            isActive ? "font-semibold text-amber-700" : "font-medium text-slate-600"
          }`}
        >
          {displayName}
        </span>
      </button>

      {/* Pages sub-list — only when active and PDF has multiple pages */}
      {isActive && hasMultiplePages && (
        <div className="ml-6 border-l-2 border-amber-200">
          {file.pages.map((pg) => (
            <button
              key={pg.number}
              onClick={() => onSelectPage(pg.number)}
              className={`w-full text-left flex items-center gap-2 pl-4 pr-3 py-1.5 transition-colors ${
                activePage === pg.number
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

// ── New Folder dialog ────────────────────────────────────────────────────────

function NewFolderDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;
    onConfirm(trimmed);
    setName("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">New Drawing Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. STRUCTURAL DRAWINGS"
            className="text-sm"
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface ProjectWorkspaceViewProps {
  projectId: string;
  basePath: string;
  mode?: string;
}

export function ProjectWorkspaceView({ projectId, basePath }: ProjectWorkspaceViewProps) {
  const dispatch = useAppDispatch();
  const { data: projectResponse, isLoading } = useGetProjectByIdQuery(projectId);
  const backendProject = projectResponse?.data;

  const drawings = useAppSelector((state) => state.manualWizard.drawings);
  const folders  = useAppSelector((state) => state.manualWizard.folders);

  const projectName = backendProject?.name ?? `Project ${projectId.slice(0, 8)}`;

  // ── Local UI state ────────────────────────────────────────────────────────
  const [activeTool,        setActiveTool]        = useState<ToolId>("select");
  const [activeColor,       setActiveColor]        = useState(PALETTE[0]);
  const [search,            setSearch]             = useState("");
  const [selectedDrawingId, setSelectedDrawingId]  = useState<string | null>(null);
  const [selectedPage,      setSelectedPage]       = useState(1);
  const [scale,             setScale]              = useState(1.0);
  const [newFolderOpen,     setNewFolderOpen]      = useState(false);
  // Tracks which folder ids are open in the accordion
  const [openFolders, setOpenFolders] = useState<string[]>(() => folders.map((f) => f.id));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId) ?? null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const zoomIn  = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3));
  const zoomOut = () => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.25));
  const resetZoom = () => setScale(1.0);

  function handleSelectFile(fileId: string) {
    if (selectedDrawingId === fileId) return;
    setSelectedDrawingId(fileId);
    setSelectedPage(1);
    setScale(1.0);
  }

  function handleSelectPage(fileId: string, pageNum: number) {
    if (selectedDrawingId !== fileId) {
      setSelectedDrawingId(fileId);
      setScale(1.0);
    }
    setSelectedPage(pageNum);
  }

  // Called by react-pdf when a document finishes loading
  const handlePageCountResolved = useCallback(
    (id: string, numPages: number) => {
      const drawing = drawings.find((d) => d.id === id);
      if (!drawing || drawing.pageCount === numPages) return;
      dispatch(
        setDrawingPages({
          id,
          pages: Array.from({ length: numPages }, (_, i) => ({
            number: i + 1,
            label: `Page ${i + 1}`,
          })),
        }),
      );
    },
    [dispatch, drawings],
  );

  // ── New folder ────────────────────────────────────────────────────────────

  function handleCreateFolder(name: string) {
    const id = crypto.randomUUID();
    dispatch(addFolder({ id, name }));
    setOpenFolders((prev) => [...prev, id]);
    toast.success(`Folder "${name}" created`);
  }

  // ── Upload from workspace ─────────────────────────────────────────────────

  async function handleWorkspaceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    const targetFolderId = folders[0]?.id ?? "default";

    for (const file of files) {
      const ext = getExt(file.name);
      const category = EXT_CATEGORY[ext] ?? "pdf";
      const id = crypto.randomUUID();
      const previewUrl =
        category === "pdf" || category === "image" ? URL.createObjectURL(file) : undefined;

      dispatch(
        addDrawing({
          id, name: file.name, size: file.size, extension: ext,
          category, status: "uploading", progress: 0, previewUrl,
          folderId: targetFolderId,
        }),
      );

      try {
        const url = await simulateUpload(file, (progress) => {
          dispatch({ type: "manualWizard/updateDrawing", payload: { id, progress, status: "uploading" } });
        });
        dispatch({ type: "manualWizard/updateDrawing", payload: { id, status: "processing", progress: 100 } });
        await new Promise((r) => setTimeout(r, 500));
        dispatch({ type: "manualWizard/updateDrawing", payload: { id, status: "complete", uploadedUrl: url } });
        toast.success(`"${file.name}" uploaded`);
      } catch {
        dispatch({ type: "manualWizard/updateDrawing", payload: { id, status: "error", error: "Upload failed" } });
        toast.error(`Failed to upload "${file.name}"`);
      }
    }
  }

  // ── Filter drawings by search ─────────────────────────────────────────────

  function getFilesForFolder(folder: DrawingFolder) {
    return folder.fileIds
      .map((id) => drawings.find((d) => d.id === id))
      .filter((d): d is DrawingFile => !!d && d.name.toLowerCase().includes(search.toLowerCase()));
  }

  // ── Breadcrumb segments ───────────────────────────────────────────────────

  const breadcrumb = [
    { label: "Workspace" },
    ...(selectedDrawing ? [{ label: selectedDrawing.name.replace(/\.[^.]+$/, "") }] : []),
    ...(selectedDrawing && selectedPage > 0
      ? [{ label: `Page ${selectedPage}${selectedDrawing.pageCount ? ` of ${selectedDrawing.pageCount}` : ""}` }]
      : []),
  ];

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading && !backendProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8edf2]">
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-[248px] shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-3 py-3 bg-[#fdf8f0] border-b border-amber-100/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <LayoutGrid className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 leading-snug">QSCalc Pro Workspace</p>
            <p className="text-[10px] text-slate-500 truncate">{projectName}</p>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        <div className="px-3 py-1 border-b border-slate-100">
          <a
            href={basePath.startsWith("/enterprise") ? "/enterprise/dashboard" : "/dashboard"}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Dashboard</span>
          </a>
        </div>

        {/* ── TOOLS ── */}
        <div className="px-3 pt-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tools</span>
          </div>
          <div className="flex gap-1.5">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                title={tool.label}
                onClick={() => setActiveTool(tool.id)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                  activeTool === tool.id
                    ? "bg-slate-700 border-slate-700 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          {/* Colour palette — keep as-is per user instruction */}
          <div className="mt-2.5 h-7 rounded-lg flex overflow-hidden border border-slate-200">
            {PALETTE.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => setActiveColor(c)}
                style={{ backgroundColor: c, flex: 1 }}
                className={`h-full transition-opacity ${
                  activeColor === c ? "ring-2 ring-inset ring-white/70 opacity-100" : "opacity-85 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── ASSEMBLIES ── */}
        <div className="px-3 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assemblies</span>
          </div>
        </div>

        {/* ── DRAWINGS card — flex-1, white rounded card with shadow ── */}
        <div className="flex-1 min-h-0 p-2 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">

            {/* Card header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[12px] font-bold text-slate-800 tracking-wide">DRAWINGS</span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-2 py-2 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search drawings..."
                  className="h-7 pl-7 text-[11px] border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Folder accordion — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {folders.length === 0 || drawings.filter(d => d.status === "complete" || d.previewUrl).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                  <FolderOpen className="w-8 h-8 text-slate-200" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No drawings uploaded yet.<br />Use Upload below to add files.
                  </p>
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  value={openFolders}
                  onValueChange={setOpenFolders}
                  className="border-0 rounded-none shadow-none overflow-visible"
                >
                  {folders.map((folder) => {
                    const files = getFilesForFolder(folder);
                    if (files.length === 0 && search) return null;
                    return (
                      <AccordionItem
                        key={folder.id}
                        value={folder.id}
                        className="border-0"
                      >
                        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-50 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:text-slate-400 [&>svg]:shrink-0 gap-2 border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700 truncate uppercase tracking-wide">
                              {folder.name}
                            </span>
                            <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                              [{folder.fileIds.length}]
                            </span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-0 pb-1 pt-0">
                          {files.length === 0 ? (
                            <p className="text-[10px] text-slate-400 px-5 py-1.5 italic">No files</p>
                          ) : (
                            <div className="flex flex-col">
                              {files.map((file) => (
                                <FileRow
                                  key={file.id}
                                  file={file}
                                  isActive={selectedDrawingId === file.id}
                                  activePage={selectedPage}
                                  onSelectFile={() => handleSelectFile(file.id)}
                                  onSelectPage={(pg) => handleSelectPage(file.id, pg)}
                                />
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>

            {/* New Folder + Upload — inside card at bottom */}
            <div className="shrink-0 border-t border-slate-100 flex items-center gap-2 p-2">
              <button
                onClick={() => setNewFolderOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Folder
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleWorkspaceUpload}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT: BREADCRUMB + CANVAS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Top breadcrumb bar */}
        <header className="h-10 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <nav className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0">
            <Home className="w-3 h-3 shrink-0 text-slate-400" />
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                <span
                  className={`truncate max-w-[140px] ${
                    i === breadcrumb.length - 1 ? "text-slate-700 font-semibold" : ""
                  }`}
                >
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Save className="w-3 h-3" />
              Auto-saved just now
            </span>
          </div>
        </header>

        {/* Canvas area */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-[#e8edf2]">
          <DrawingCanvas
            drawing={selectedDrawing}
            page={selectedPage}
            scale={scale}
            onPageCountResolved={handlePageCountResolved}
          />

          {/* Floating zoom controls — bottom-left of canvas */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-1">
            <button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={zoomOut}
              disabled={scale <= 0.25}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
              title="Reset zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page indicator — bottom-right of canvas */}
          {selectedDrawing && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white rounded-lg shadow-md border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 font-medium">
              <FileUp className="w-3.5 h-3.5 text-amber-500" />
              Page {selectedPage}
              {selectedDrawing.name && (
                <span className="text-slate-400">
                  — {selectedDrawing.name.replace(/\.[^.]+$/, "")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={handleCreateFolder}
      />
    </div>
  );
}
