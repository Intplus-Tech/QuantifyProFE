"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  Ruler,
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
  Lock,
  Plus,
  FileUp,
  Wrench,
  SlidersHorizontal,
  LayoutGrid,
  CheckCircle2,
  Link2,
  X,
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  loadSession,
  saveSession,
  type WsConcreteMeasurement,
  type WsElementAssignment,
} from "./workspaceSession";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Constants ────────────────────────────────────────────────────────────────

type ToolId = "length" | "area" | "count" | "text" | "undo" | "redo";

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

const TOOLS: {
  id: ToolId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}[] = [
  {
    id: "length",
    icon: Ruler,
    label: "Length",
    description: "Measure linear distances on the drawing",
  },
  {
    id: "area",
    icon: Pentagon,
    label: "Area",
    description: "Measure polygon areas on the drawing",
  },
  {
    id: "count",
    icon: Hash,
    label: "Count",
    description: "Count items and elements on the drawing",
  },
  {
    id: "text",
    icon: Type,
    label: "Text",
    description: "Add text annotations to the drawing",
  },
  {
    id: "undo",
    icon: Undo2,
    label: "Undo",
    description: "Undo the last action",
  },
  {
    id: "redo",
    icon: Redo2,
    label: "Redo",
    description: "Redo the last undone action",
  },
];

interface BBSRow {
  id: string;
  mark: string;
  size: string;
  length: string;
  quantity: string;
}

interface RebarBar {
  id: string;
  size: string;
  count: string;
  depth: string;
}

const BAR_SIZE_OPTIONS = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25", "Y32"];
const SCALE_MEASURE_OPTIONS = [
  "Pile",
  "Column in Foundation",
  "Ground Beam",
  "Strip",
  "Shear Wall",
  "Slabs",
  "Roof Beams",
  "Roof Slab",
  "Roof Upstands / Parapet",
  "Roof Gutter",
];

interface ConcreteFieldDef {
  key: string;
  label: string;
  defaultValue: string;
  type?: "text" | "select";
  options?: string[];
}
interface ConcreteRowDef {
  sectionLabel?: string;
  fields: ConcreteFieldDef[];
}
interface ElementConcreteConfig {
  sectionHeader: string;
  tagLabel: string;
  tagPlaceholder: string;
  measureLabel: string;
  measureUnit: string;
  mockMeasureValue: string;
  rows: ConcreteRowDef[];
}

const ELEMENT_CONFIGS: Record<string, ElementConcreteConfig> = {
  Pile: {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Pile as:",
    tagPlaceholder: "e.g. P1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "18",
    rows: [
      { fields: [
        { key: "shape", label: "Shape", defaultValue: "Circular", type: "select", options: ["Circular", "Square", "Rectangular"] },
        { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
      ]},
      { fields: [
        { key: "diameter", label: "Diameter (m)", defaultValue: "0.6" },
        { key: "plasticizers", label: "Plasticizers", defaultValue: "1.2" },
      ]},
    ],
  },
  "Column in Foundation": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Column as:",
    tagPlaceholder: "e.g. C1",
    measureLabel: "Counts",
    measureUnit: "",
    mockMeasureValue: "12",
    rows: [
      { fields: [
        { key: "shape", label: "Shape", defaultValue: "Square", type: "select", options: ["Circular", "Square", "Rectangular"] },
        { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
      ]},
      { fields: [
        { key: "width", label: "Width (m)", defaultValue: "0.30" },
        { key: "breadth", label: "Breadth (m)", defaultValue: "0.30" },
      ]},
    ],
  },
  "Ground Beam": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this beam as:",
    tagPlaceholder: "e.g. BM1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "0",
    rows: [
      { fields: [
        { key: "width", label: "Width (m)", defaultValue: "0.30" },
        { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
      ]},
      { fields: [
        { key: "quantity", label: "Quantity (identical Beams)", defaultValue: "1" },
      ]},
    ],
  },
  Strip: {
    sectionHeader: "CONCRETE FOOTING (FROM MEASUREMENT)",
    tagLabel: "Tag this Strip as:",
    tagPlaceholder: "e.g. #1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "18",
    rows: [
      { sectionLabel: "EXCAVATION", fields: [
        { key: "excavationDepth", label: "Depth (m)", defaultValue: "18" },
      ]},
      { sectionLabel: "BLOCKWORK", fields: [
        { key: "blockworkHeight", label: "Height (m)", defaultValue: "18" },
      ]},
    ],
  },
  "Shear Wall": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this wall as:",
    tagPlaceholder: "e.g. SW1",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "49.0",
    rows: [
      { fields: [
        { key: "width", label: "Width (m)", defaultValue: "0.30" },
        { key: "height", label: "Height (m)", defaultValue: "1.2" },
      ]},
    ],
  },
  Slabs: {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Slab as:",
    tagPlaceholder: "e.g. SBO1",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "24.5",
    rows: [
      { fields: [
        { key: "thickness", label: "Thickness (m)", defaultValue: "1.2" },
      ]},
    ],
  },
  "Roof Beams": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Beam as:",
    tagPlaceholder: "e.g. RB",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      { fields: [
        { key: "width", label: "Width (m)", defaultValue: "1.2" },
        { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
      ]},
    ],
  },
  "Roof Slab": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Slab as:",
    tagPlaceholder: "e.g. RS",
    measureLabel: "Area",
    measureUnit: "m²",
    mockMeasureValue: "24.5",
    rows: [
      { fields: [
        { key: "thickness", label: "Thickness (m)", defaultValue: "1.2" },
      ]},
    ],
  },
  "Roof Upstands / Parapet": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Upstands / Parapet as:",
    tagPlaceholder: "e.g. RUP",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      { fields: [
        { key: "height", label: "Height (m)", defaultValue: "1.2" },
        { key: "thickness", label: "Thickness (m)", defaultValue: "1.2" },
      ]},
    ],
  },
  "Roof Gutter": {
    sectionHeader: "CONCRETE (FROM MEASUREMENT)",
    tagLabel: "Tag this Roof Gutter as:",
    tagPlaceholder: "e.g. RG",
    measureLabel: "Length",
    measureUnit: "m",
    mockMeasureValue: "24.5",
    rows: [
      { fields: [
        { key: "width", label: "Width (m)", defaultValue: "1.2" },
        { key: "depth", label: "Depth (m)", defaultValue: "1.2" },
      ]},
    ],
  },
};

const MOCK_EXISTING_ELEMENTS = [
  { id: "pile", name: "Pile", path: "Substructure / Piles", count: 15 },
  {
    id: "pilecaps",
    name: "Pile Caps",
    path: "Substructure / Pile Caps",
    count: 16,
  },
];

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".rvt",
  ".ifc",
  ".nwd",
  ".skp",
  ".fbx",
  ".obj",
  ".dwg",
  ".dxf",
  ".dgn",
];

const EXT_CATEGORY: Record<string, DrawingCategory> = {
  ".pdf": "pdf",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".rvt": "bim-3d",
  ".ifc": "bim-3d",
  ".nwd": "bim-3d",
  ".skp": "bim-3d",
  ".fbx": "bim-3d",
  ".obj": "bim-3d",
  ".dwg": "cad-2d",
  ".dxf": "cad-2d",
  ".dgn": "cad-2d",
};

function getExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

// ── Simulated upload ──────────────────────────────────────────────────────────

async function simulateUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  // TODO: Replace with real API call
  console.log("[WorkspaceUpload]", { name: file.name, size: file.size });
  for (let p = 10; p <= 90; p += 20) {
    await new Promise((r) => setTimeout(r, 180));
    onProgress(p);
  }
  await new Promise((r) => setTimeout(r, 400));
  return `https://cdn.placeholder.example/drawings/${encodeURIComponent(file.name)}`;
}

// ── File icon ─────────────────────────────────────────────────────────────────

function FileIcon({ category }: { category: DrawingFile["category"] }) {
  if (category === "image")
    return <Image className="w-3 h-3 shrink-0 text-blue-400" />;
  if (category === "bim-3d")
    return <Box className="w-3 h-3 shrink-0 text-violet-400" />;
  if (category === "cad-2d")
    return <PenLine className="w-3 h-3 shrink-0 text-cyan-400" />;
  return <FileText className="w-3 h-3 shrink-0 text-orange-400" />;
}

// ── Drawing canvas ────────────────────────────────────────────────────────────

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
        <p className="text-sm text-slate-500 font-medium">
          Viewing No Drawing...
        </p>
        <p className="text-xs text-slate-400">
          Select a drawing from the panel on the left
        </p>
      </div>
    );
  }
  if (drawing.category === "pdf" && drawing.previewUrl) {
    return (
      <div className="flex items-start justify-center h-full overflow-auto p-6">
        <Document
          file={drawing.previewUrl}
          onLoadSuccess={({ numPages }) =>
            onPageCountResolved(drawing.id, numPages)
          }
          loading={
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-16">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          }
          error={
            <p className="text-sm text-destructive mt-16">
              Failed to load drawing.
            </p>
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
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
              transition: "transform 0.15s ease",
            }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      );
    }
  }
  // SWAP POINT — replace this block with the real viewer when subscription is active:
  //
  // BIM/3D (.rvt, .ifc, .nwd, .skp, .fbx, .obj):
  //   <ApsViewer
  //     urn={drawing.urn}
  //     getToken={fetchApsToken}
  //     onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)}
  //   />
  //   — or for free IFC-only option —
  //   <IfcViewer
  //     url={drawing.previewUrl}
  //     onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)}
  //   />
  //
  // CAD (.dwg, .dxf, .dgn):
  //   <ApsViewer ... onSheetsLoaded={(count) => onPageCountResolved(drawing.id, count)} />
  //
  // Calling onPageCountResolved populates pages in Redux so the sidebar shows all sheets.
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        {drawing.category === "bim-3d" ? (
          <Box className="w-10 h-10 text-slate-300" />
        ) : (
          <PenLine className="w-10 h-10 text-slate-300" />
        )}
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

// ── File row ──────────────────────────────────────────────────────────────────

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
              className={`w-full text-left flex items-center gap-2 pl-4 pr-3 py-1.5 transition-colors ${isActive && activePage === pg.number ? "text-amber-700 font-semibold bg-amber-50" : "text-slate-500 hover:bg-slate-50 hover:text-amber-600"}`}
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

// ── New Folder dialog ─────────────────────────────────────────────────────────

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
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Create Folder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── BBS Question Modal ────────────────────────────────────────────────────────

function BBSQuestionModal({
  open,
  answer,
  onAnswerChange,
  onClose,
  onSkip,
  onContinue,
}: {
  open: boolean;
  answer: "yes" | "no";
  onAnswerChange: (v: "yes" | "no") => void;
  onClose: () => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Bar Bending Schedule
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-[13px] text-slate-600">
            Does this drawing contain a Bar Bending Schedule (BBS) or
            Reinforcement Table?
          </p>
          <div className="space-y-2">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onAnswerChange(v)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors ${answer === v ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${answer === v ? "border-amber-500" : "border-slate-300"}`}
                >
                  {answer === v && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <span
                  className={`text-[13px] font-semibold ${answer === v ? "text-amber-700" : "text-slate-600"}`}
                >
                  {v === "yes"
                    ? "Yes, this drawing has a Bending Schedule"
                    : "No, I will measure rebar manually"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-3">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          <Button
            onClick={onContinue}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5"
          >
            Continue <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── BBS Entry Modal ───────────────────────────────────────────────────────────

function BBSEntryModal({
  open,
  rows,
  onRowChange,
  onAddRow,
  onCancel,
  onSave,
}: {
  open: boolean;
  rows: BBSRow[];
  onRowChange: (id: string, field: keyof BBSRow, value: string) => void;
  onAddRow: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Bar Bending Schedule
            </DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-[13px] text-slate-600">
          Enter the Bar Bending Schedule as shown on the drawing:
        </p>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
            {["Bar Mark", "Bar Size", "Length (mm)", "Quantity"].map((h) => (
              <div
                key={h}
                className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                {h}
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-4">
                <div className="px-2 py-2">
                  <Input
                    value={row.mark}
                    onChange={(e) =>
                      onRowChange(row.id, "mark", e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="B1"
                  />
                </div>
                <div className="px-2 py-2">
                  <Select
                    value={row.size}
                    onValueChange={(v) => onRowChange(row.id, "size", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BAR_SIZE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-2 py-2">
                  <Input
                    value={row.length}
                    onChange={(e) =>
                      onRowChange(row.id, "length", e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="5,400"
                  />
                </div>
                <div className="px-2 py-2">
                  <Input
                    value={row.quantity}
                    onChange={(e) =>
                      onRowChange(row.id, "quantity", e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="8"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2.5 border-t border-slate-100">
            <button
              onClick={onAddRow}
              className="text-amber-600 hover:text-amber-700 text-[12px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Scale Setup Modal ─────────────────────────────────────────────────────────

function ScaleSetupModal({
  open,
  measure,
  onMeasureChange,
  onCancel,
  onYes,
}: {
  open: boolean;
  measure: string;
  onMeasureChange: (v: string) => void;
  onCancel: () => void;
  onYes: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-5 py-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-600"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="16.5"
                x2="12"
                y2="21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="12"
                x2="7.5"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="16.5"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800">
              Page Scale Setup
            </h3>
            <p className="text-[12px] text-slate-500 mt-1">
              Would you like to scale for this page?
            </p>
          </div>
          <div className="w-full space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              What do you want to measure?
            </p>
            <Select value={measure} onValueChange={onMeasureChange}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALE_MEASURE_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 w-full">
            <Button
              onClick={onYes}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Yes, I want to Scale
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Element Detail Panel (right side) ────────────────────────────────────────

function ElementDetailPanel({
  measure = "Pile",
  showRebarTab = false,
  onClose,
  onAssignElement,
  onApplyAndContinue,
  onSaveMeasurement,
}: {
  measure?: string;
  showRebarTab?: boolean;
  onClose: () => void;
  onAssignElement: () => void;
  onApplyAndContinue: () => void;
  onSaveMeasurement?: (data: Record<string, string>) => void;
}) {
  const cfg = ELEMENT_CONFIGS[measure] ?? ELEMENT_CONFIGS["Pile"];
  const [activeTab, setActiveTab] = useState<"concrete" | "rebar">("concrete");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Dynamic concrete field values
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = { tag: "" };
    cfg.rows.forEach((row) => row.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    return init;
  });
  useEffect(() => {
    const newCfg = ELEMENT_CONFIGS[measure] ?? ELEMENT_CONFIGS["Pile"];
    const init: Record<string, string> = { tag: "" };
    newCfg.rows.forEach((row) => row.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    setFieldValues(init);
  }, [measure]);
  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  // Rebar state
  const [rebarMethod, setRebarMethod] = useState<"read" | "manual">("manual");
  const [mainBars, setMainBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "4", depth: "0.45" },
  ]);
  const [additionBars, setAdditionBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "4", depth: "0.45" },
  ]);
  const [inclStirrupsLocal, setInclStirrupsLocal] = useState(true);
  const [stirrupSize, setStirrupSize] = useState("Y8");
  const [stirrupSpacing, setStirrupSpacing] = useState("150");

  function updateBar(
    arr: RebarBar[],
    setArr: (v: RebarBar[]) => void,
    id: string,
    field: keyof RebarBar,
    value: string,
  ) {
    setArr(arr.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  function handleApply() {
    onSaveMeasurement?.({ ...fieldValues });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    onApplyAndContinue();
  }

  return (
    <div className="w-[290px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {measure}
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-slate-200">
        {(showRebarTab
          ? (["concrete", "rebar"] as const)
          : (["concrete"] as const)
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? "text-amber-600 border-b-2 border-amber-500" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "concrete" ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {cfg.sectionHeader}
            </p>

            {/* Tag */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">{cfg.tagLabel}</label>
              <Input
                value={fieldValues.tag ?? ""}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder={cfg.tagPlaceholder}
                className="h-8 text-sm"
              />
            </div>

            {/* Measurement value */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">{cfg.measureLabel}</label>
              <p className="text-base font-bold text-slate-800">
                {cfg.mockMeasureValue}
                {cfg.measureUnit && (
                  <span className="text-sm font-normal text-slate-500 ml-1">{cfg.measureUnit}</span>
                )}
              </p>
            </div>

            {/* Dynamic field rows */}
            {cfg.rows.map((row, i) => (
              <div key={i} className="space-y-2">
                {row.sectionLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {row.sectionLabel}
                  </p>
                )}
                <div className={row.fields.length === 2 ? "grid grid-cols-2 gap-3" : ""}>
                  {row.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[11px] text-slate-500">{field.label}</label>
                      {field.type === "select" ? (
                        <Select
                          value={fieldValues[field.key] ?? field.defaultValue}
                          onValueChange={(v) => setField(field.key, v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={fieldValues[field.key] ?? ""}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="h-8 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Color */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Color</label>
              <div className="h-8 rounded-lg overflow-hidden border border-slate-200 bg-green-400 cursor-pointer" />
            </div>
          </>
        ) : (
          <>
            {/* Pile meta */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Pile: Bored Pile - 750mm
              </span>
              <span className="text-[11px] text-amber-600 font-semibold">
                Concrete Volume: 0.81 m³
              </span>
            </div>

            {/* Input method */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Rebar Input Method
              </p>
              <p className="text-[11px] text-slate-600">
                How would you like to add rebar details?
              </p>
              <div className="space-y-1.5">
                {(["read", "manual"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setRebarMethod(m)}
                    className="w-full flex items-center gap-2 text-left"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${rebarMethod === m ? "border-amber-500" : "border-slate-300"}`}
                    >
                      {rebarMethod === m && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] ${rebarMethod === m ? "text-amber-600 font-semibold" : "text-slate-500"}`}
                    >
                      {m === "read"
                        ? "Read from drawing (click on rebar details on the page)"
                        : "Enter manually (I know the rebar specifications)"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main bars */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Main Bars
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Rebars:
              </p>
              {mainBars.map((bar) => (
                <div key={bar.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">
                        Bars Size:
                      </label>
                      <Select
                        value={bar.size}
                        onValueChange={(v) =>
                          updateBar(mainBars, setMainBars, bar.id, "size", v)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">
                        Number of bars:
                      </label>
                      <Input
                        value={bar.count}
                        onChange={(e) =>
                          updateBar(
                            mainBars,
                            setMainBars,
                            bar.id,
                            "count",
                            e.target.value,
                          )
                        }
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Rebar Depth (m)
                    </label>
                    <Input
                      value={bar.depth}
                      onChange={(e) =>
                        updateBar(
                          mainBars,
                          setMainBars,
                          bar.id,
                          "depth",
                          e.target.value,
                        )
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Addition bars */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Addition Bars:
              </p>
              {additionBars.map((bar) => (
                <div key={bar.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">
                        Bars Size:
                      </label>
                      <Select
                        value={bar.size}
                        onValueChange={(v) =>
                          updateBar(
                            additionBars,
                            setAdditionBars,
                            bar.id,
                            "size",
                            v,
                          )
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">
                        Number of bars:
                      </label>
                      <Input
                        value={bar.count}
                        onChange={(e) =>
                          updateBar(
                            additionBars,
                            setAdditionBars,
                            bar.id,
                            "count",
                            e.target.value,
                          )
                        }
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Rebar Depth (m)
                    </label>
                    <Input
                      value={bar.depth}
                      onChange={(e) =>
                        updateBar(
                          additionBars,
                          setAdditionBars,
                          bar.id,
                          "depth",
                          e.target.value,
                        )
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
              <button className="text-amber-600 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Bar
              </button>
            </div>

            {/* Stirrups */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Stirrups (Links/Ties)
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inclStirrupsLocal}
                  onChange={(e) => setInclStirrupsLocal(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500"
                />
                <span className="text-[11px] text-slate-600">
                  Include Stirrups
                </span>
              </label>
              {inclStirrupsLocal && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Bar size:
                    </label>
                    <Select value={stirrupSize} onValueChange={setStirrupSize}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAR_SIZE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Spacing (mm c/c):
                    </label>
                    <Input
                      value={stirrupSpacing}
                      onChange={(e) => setStirrupSpacing(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Color</label>
              <div className="h-8 rounded-lg overflow-hidden border border-slate-200 bg-blue-500 cursor-pointer" />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-3 flex gap-2">
        <Button
          onClick={handleApply}
          className={`flex-1 text-xs py-2 transition-colors ${savedFeedback ? "bg-green-500 hover:bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
        >
          {savedFeedback ? "✓ Saved" : "Apply & Continue"}
        </Button>
        <Button
          variant="outline"
          onClick={onAssignElement}
          className="flex-1 text-xs py-2"
        >
          + Assign Element
        </Button>
      </div>
    </div>
  );
}

// ── Assign Items Modal ────────────────────────────────────────────────────────

function AssignItemsModal({
  open,
  onClose,
  onContinue,
}: {
  open: boolean;
  onClose: () => void;
  onContinue: (mode: "new" | "existing", elementId?: string) => void;
}) {
  const [mode, setMode] = useState<"new" | "existing">("existing");
  const [selectedEl, setSelectedEl] = useState<string>("pile");
  const [query, setQuery] = useState("");

  const filtered = MOCK_EXISTING_ELEMENTS.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold">
                Assign Items
              </DialogTitle>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                12 columns selected
              </p>
            </div>
          </div>
        </DialogHeader>

        <p className="text-[13px] text-slate-600">
          How would you like to assign these items?
        </p>

        <div className="space-y-2">
          {/* Create New Element card */}
          <button
            onClick={() => setMode("new")}
            className={`w-full text-left border-2 rounded-xl p-3.5 flex items-start gap-3 transition-colors ${mode === "new" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:bg-slate-50"}`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${mode === "new" ? "border-amber-500" : "border-slate-300"}`}
            >
              {mode === "new" && (
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] font-semibold ${mode === "new" ? "text-amber-700" : "text-slate-700"}`}
              >
                Create New Element
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Define custom parameters and add these items to a brand new
                element in your BOQ.
              </p>
            </div>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${mode === "new" ? "bg-amber-100" : "border border-slate-200"}`}
            >
              <Plus
                className={`w-3.5 h-3.5 ${mode === "new" ? "text-amber-600" : "text-slate-400"}`}
              />
            </div>
          </button>

          {/* Assign to Existing card */}
          <div
            className={`border-2 rounded-xl transition-colors ${mode === "existing" ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
          >
            <button
              onClick={() => setMode("existing")}
              className="w-full text-left p-3.5 flex items-start gap-3"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${mode === "existing" ? "border-amber-500" : "border-slate-300"}`}
              >
                {mode === "existing" && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-semibold ${mode === "existing" ? "text-amber-700" : "text-slate-700"}`}
                >
                  Assign to Existing Element
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add these counts to an element you&apos;ve already created.
                </p>
              </div>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${mode === "existing" ? "bg-amber-100" : "border border-slate-200"}`}
              >
                <Link2
                  className={`w-3.5 h-3.5 ${mode === "existing" ? "text-amber-600" : "text-slate-400"}`}
                />
              </div>
            </button>

            {mode === "existing" && (
              <div
                className="px-3.5 pb-3.5 space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search existing elements..."
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  {filtered.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedEl(el.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${selectedEl === el.id ? "border-amber-200 bg-white" : "border-slate-100 bg-white hover:bg-slate-50"}`}
                    >
                      {selectedEl === el.id ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[12px] font-semibold text-slate-700">
                          {el.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{el.path}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {el.count} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onContinue(mode, mode === "existing" ? selectedEl : undefined)
            }
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Confirm Assignment Modal ──────────────────────────────────────────────────

function ConfirmAssignmentModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            Confirm Assignment
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-slate-600">
          You are about to add 12 columns to the existing element:
        </p>
        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Piles</span>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Current items</span>
              <span className="text-slate-700">15 Piles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adding</span>
              <span className="text-amber-600 font-semibold">+ 2 Piles</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">New total</span>
              <span className="text-slate-800">27 items</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Confirm Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Assignment Complete Modal ─────────────────────────────────────────────────

function AssignmentCompleteModal({
  open,
  onClose,
  onViewElement,
}: {
  open: boolean;
  onClose: () => void;
  onViewElement: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />{" "}
            Assignment Complete
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-slate-600">
          Successfully added 12 Piles to:
        </p>
        <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Piles</span>
          </div>
          <p className="text-[12px] text-slate-500 pl-7">
            Now contains: 15 Piles + 2 Piles = 17 items
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onViewElement}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            View Element
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Create New Element Modal ──────────────────────────────────────────────────

interface PileRow {
  id: string;
  name: string;
  count: string;
  volume: string;
}

function CreateNewElementModal({
  open,
  onClose,
  onUseExisting,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onUseExisting: () => void;
  onCreate: () => void;
}) {
  const [categoryFolder, setCategoryFolder] = useState("Substructure / Pile");
  const [measurementUnit, setMeasurementUnit] = useState("Counts");
  const [pileRows, setPileRows] = useState<PileRow[]>([
    { id: "1", name: "Bored Pile - 750mm", count: "18", volume: "4.50" },
    { id: "2", name: "Bored Pile - 600mm", count: "4", volume: "4.50" },
    { id: "3", name: "Bored Pile - 450mm", count: "4", volume: "4.50" },
  ]);

  function updatePileRow(id: string, field: keyof PileRow, value: string) {
    setPileRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  function handleCreate() {
    console.log("[CreateNewElement]", {
      categoryFolder,
      measurementUnit,
      pileRows,
    });
    toast.success("Element created");
    onCreate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base font-bold">
            Create New Element
          </DialogTitle>
          <p className="text-[12px] text-slate-500">
            Define custom parameters and sub-items
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Basic Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">
                  Category folder
                </label>
                <Select
                  value={categoryFolder}
                  onValueChange={setCategoryFolder}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Substructure / Pile">
                      Substructure / Pile
                    </SelectItem>
                    <SelectItem value="Substructure / Pile Caps">
                      Substructure / Pile Caps
                    </SelectItem>
                    <SelectItem value="Substructure / Ground Beams">
                      Substructure / Ground Beams
                    </SelectItem>
                    <SelectItem value="Superstructure / Columns">
                      Superstructure / Columns
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">
                  Measurement Unit
                </label>
                <Select
                  value={measurementUnit}
                  onValueChange={setMeasurementUnit}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Counts">Counts</SelectItem>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                    <SelectItem value="m">m (linear)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parameters table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Assign Pile Parameters
              </p>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 bg-white">
              {["Pile", "Count", "Volume Per Pile"].map((h) => (
                <div
                  key={h}
                  className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider"
                >
                  {h}
                </div>
              ))}
            </div>
            {pileRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-3 border-b border-slate-50 last:border-0"
              >
                <div className="px-4 py-3 text-[13px] text-slate-600 flex items-center">
                  {row.name}
                </div>
                <div className="px-3 py-2 flex items-center">
                  <Input
                    value={row.count}
                    onChange={(e) =>
                      updatePileRow(row.id, "count", e.target.value)
                    }
                    className="h-8 text-sm w-20"
                  />
                </div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <Input
                    value={row.volume}
                    onChange={(e) =>
                      updatePileRow(row.id, "volume", e.target.value)
                    }
                    className="h-8 text-sm w-24"
                  />
                  <span className="text-[11px] text-slate-500">m³</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onUseExisting}
            className="text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Use Existing Element
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5"
            >
              Create Element <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ProjectWorkspaceViewProps {
  projectId: string;
  basePath: string;
  mode?: string;
}

export function ProjectWorkspaceView({
  projectId,
  basePath,
}: ProjectWorkspaceViewProps) {
  const dispatch = useAppDispatch();
  const { data: projectResponse, isLoading } =
    useGetProjectByIdQuery(projectId);
  const backendProject = projectResponse?.data;

  const drawings = useAppSelector((state) => state.manualWizard.drawings);
  const folders = useAppSelector((state) => state.manualWizard.folders);

  const projectName =
    backendProject?.name ?? `Project ${projectId.slice(0, 8)}`;

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [savedSession] = useState(() => loadSession(projectId));
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [pendingTool, setPendingTool] = useState<ToolId | null>(null);
  const [scaleFlowActive, setScaleFlowActive] = useState(
    () => savedSession.scaleFlowActive ?? false,
  );
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [search, setSearch] = useState("");
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(
    () => drawings[0]?.id ?? null,
  );
  const [selectedPage, setSelectedPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<string[]>(() =>
    folders.map((f) => f.id),
  );

  // Count tool BBS flow
  const [bbsModalStep, setBbsModalStep] = useState<"question" | "entry" | null>(
    null,
  );
  const [bbsAnswer, setBbsAnswer] = useState<"yes" | "no">(
    () => savedSession.bbsAnswer ?? "yes",
  );
  const [bbsRows, setBbsRows] = useState<BBSRow[]>(
    () =>
      savedSession.bbsRows ?? [
        { id: "1", mark: "", size: "Y16", length: "", quantity: "" },
      ],
  );
  const [showScaleSetup, setShowScaleSetup] = useState(false);
  const [scaleWhat, setScaleWhat] = useState(
    () => savedSession.scaleWhat ?? "Pile",
  );
  const [countModeActive, setCountModeActive] = useState(false);
  const [knownDistance, setKnownDistance] = useState(
    () => savedSession.knownDistance ?? "",
  );
  const [distanceUnit, setDistanceUnit] = useState(
    () => savedSession.distanceUnit ?? "Meters",
  );
  const [scaleLocked, setScaleLocked] = useState(
    () => savedSession.scaleLocked ?? false,
  );
  const [scaleInfo, setScaleInfo] = useState<string | null>(
    () => savedSession.scaleInfo ?? null,
  );
  const [showScaleNotification, setShowScaleNotification] = useState(false);
  const scaleNotifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Element detail panel
  const [showElementPanel, setShowElementPanel] = useState(false);
  const [showRebarTab, setShowRebarTab] = useState(
    () => savedSession.showRebarTab ?? false,
  );
  const [concreteMeasurements, setConcreteMeasurements] = useState<
    WsConcreteMeasurement[]
  >(() => savedSession.concreteMeasurements ?? []);

  // Assign element flow
  const [assigningElementId, setAssigningElementId] = useState<string | null>(
    null,
  );
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [assignCompleteOpen, setAssignCompleteOpen] = useState(false);
  const [createNewElOpen, setCreateNewElOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDrawing =
    drawings.find((d) => d.id === selectedDrawingId) ?? null;

  // ── Tool click ───────────────────────────────────────────────────────────────

  function handleToolClick(id: ToolId) {
    if (id === "undo" || id === "redo") return; // TODO: wire undo/redo
    setPendingTool(id);
    setBbsModalStep("question");
  }

  // ── BBS question ─────────────────────────────────────────────────────────────

  function handleBBSClose() {
    setBbsModalStep(null);
    setPendingTool(null);
  }
  function handleBBSSkip() {
    setShowRebarTab(false);
    saveSession(projectId, { bbsAnswer, showRebarTab: false });
    setBbsModalStep(null);
    setShowScaleSetup(true);
  }
  function handleBBSContinue() {
    if (bbsAnswer === "yes") {
      setShowRebarTab(false);
      setBbsModalStep("entry");
    } else {
      // "No, I will measure rebar manually" → unlock the Rebar tab
      setShowRebarTab(true);
      saveSession(projectId, { bbsAnswer, showRebarTab: true });
      setBbsModalStep(null);
      setShowScaleSetup(true);
    }
  }

  // ── BBS entry ────────────────────────────────────────────────────────────────

  function handleBBSEntryCancel() {
    setBbsModalStep(null);
    setPendingTool(null);
  }
  function handleBBSSave() {
    console.log("[CountTool] BBS saved:", bbsRows);
    toast.success("Bar Bending Schedule saved");
    setShowRebarTab(false);
    saveSession(projectId, { bbsAnswer, bbsRows, showRebarTab: false });
    setBbsModalStep(null);
    setShowScaleSetup(true);
  }
  function handleBBSRowChange(id: string, field: keyof BBSRow, value: string) {
    setBbsRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }
  function handleAddBBSRow() {
    setBbsRows((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        mark: "",
        size: "Y16",
        length: "",
        quantity: "",
      },
    ]);
  }

  // ── Scale setup ──────────────────────────────────────────────────────────────

  function handleScaleSetupProceed() {
    // "Yes I want to Scale" — show calibration bar; tool activates only after Apply Scale
    setShowScaleSetup(false);
    setScaleFlowActive(true);
    saveSession(projectId, { scaleWhat, scaleFlowActive: true });
  }

  function handleScaleSetupCancel() {
    // Cancel — abort the entire flow
    setShowScaleSetup(false);
    setPendingTool(null);
  }

  // ── Calibration ──────────────────────────────────────────────────────────────

  function handleApplyScale() {
    if (!knownDistance) {
      toast.warning("Enter a known distance first");
      return;
    }
    const newScaleInfo = "Scale calculated: 1:100 | 10.5 px per cm";
    setScaleInfo(newScaleInfo);
    // Show in-UI notification; auto-dismiss after 5 s
    setShowScaleNotification(true);
    if (scaleNotifTimerRef.current) clearTimeout(scaleNotifTimerRef.current);
    scaleNotifTimerRef.current = setTimeout(
      () => setShowScaleNotification(false),
      5000,
    );
    saveSession(projectId, {
      knownDistance,
      distanceUnit,
      scaleWhat,
      scaleInfo: newScaleInfo,
      scaleFlowActive: true,
    });
    // Activate the pending tool now that scale is successfully applied
    if (pendingTool) {
      setActiveTool(pendingTool);
      if (pendingTool === "count") {
        setCountModeActive(true);
        setShowElementPanel(true);
      }
      setPendingTool(null);
    }
  }
  function handleResetScale() {
    if (scaleNotifTimerRef.current) clearTimeout(scaleNotifTimerRef.current);
    setScaleInfo(null);
    setShowScaleNotification(false);
    setKnownDistance("");
    setScaleLocked(false);
    setActiveTool(null);
    setCountModeActive(false);
    setShowElementPanel(false);
    setPendingTool(null);
    saveSession(projectId, {
      scaleInfo: null,
      knownDistance: "",
      scaleLocked: false,
    });
  }

  function handleSaveMeasurement(data: Record<string, string>) {
    const { tag = "", ...fields } = data;
    const m: WsConcreteMeasurement = {
      id: crypto.randomUUID(),
      measureType: scaleWhat,
      tag,
      fields,
      savedAt: Date.now(),
    };
    setConcreteMeasurements((prev) => {
      const next = [...prev, m];
      saveSession(projectId, { concreteMeasurements: next });
      return next;
    });
  }

  // ── Assign element flow ───────────────────────────────────────────────────────

  function handleAssignContinue(mode: "new" | "existing", elementId?: string) {
    setAssignModalOpen(false);
    setAssigningElementId(elementId ?? null);
    if (mode === "existing") {
      setConfirmAssignOpen(true);
    } else {
      setCreateNewElOpen(true);
    }
  }
  function handleConfirmMerge() {
    setConfirmAssignOpen(false);
    setAssignCompleteOpen(true);
    const el = MOCK_EXISTING_ELEMENTS.find((e) => e.id === assigningElementId);
    const a: WsElementAssignment = {
      id: crypto.randomUUID(),
      elementId: assigningElementId ?? "unknown",
      elementName: el?.name ?? "Unknown Element",
      assignedAt: Date.now(),
    };
    const prev = loadSession(projectId).elementAssignments ?? [];
    saveSession(projectId, { elementAssignments: [...prev, a] });
  }
  function handleCreateNewEl() {
    setCreateNewElOpen(false);
    toast.success("Element created and items assigned");
    const a: WsElementAssignment = {
      id: crypto.randomUUID(),
      elementId: "new-element",
      elementName: "New Element",
      assignedAt: Date.now(),
    };
    const prev = loadSession(projectId).elementAssignments ?? [];
    saveSession(projectId, { elementAssignments: [...prev, a] });
  }

  // ── Canvas helpers ────────────────────────────────────────────────────────────

  const zoomIn = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3));
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

  function handleCreateFolder(name: string) {
    const id = crypto.randomUUID();
    dispatch(addFolder({ id, name }));
    setOpenFolders((prev) => [...prev, id]);
    toast.success(`Folder "${name}" created`);
  }

  async function handleWorkspaceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    const targetFolderId = folders[0]?.id ?? "default";
    let firstNewId: string | null = null;
    for (const file of files) {
      const ext = getExt(file.name);
      const category = EXT_CATEGORY[ext] ?? "pdf";
      const id = crypto.randomUUID();
      if (!firstNewId) firstNewId = id;
      const previewUrl =
        category === "pdf" || category === "image"
          ? URL.createObjectURL(file)
          : undefined;
      dispatch(
        addDrawing({
          id,
          name: file.name,
          size: file.size,
          extension: ext,
          category,
          status: "uploading",
          progress: 0,
          previewUrl,
          folderId: targetFolderId,
        }),
      );
      try {
        const url = await simulateUpload(file, (progress) => {
          dispatch({
            type: "manualWizard/updateDrawing",
            payload: { id, progress, status: "uploading" },
          });
        });
        dispatch({
          type: "manualWizard/updateDrawing",
          payload: { id, status: "processing", progress: 100 },
        });
        await new Promise((r) => setTimeout(r, 500));
        dispatch({
          type: "manualWizard/updateDrawing",
          payload: { id, status: "complete", uploadedUrl: url },
        });
        toast.success(`"${file.name}" uploaded`);
      } catch {
        dispatch({
          type: "manualWizard/updateDrawing",
          payload: { id, status: "error", error: "Upload failed" },
        });
        toast.error(`Failed to upload "${file.name}"`);
      }
    }
    if (firstNewId) {
      setSelectedDrawingId(firstNewId);
      setSelectedPage(1);
      setScale(1.0);
    }
  }

  function getFilesForFolder(folder: DrawingFolder) {
    return folder.fileIds
      .map((id) => drawings.find((d) => d.id === id))
      .filter(
        (d): d is DrawingFile =>
          !!d && d.name.toLowerCase().includes(search.toLowerCase()),
      );
  }

  const breadcrumb = [
    { label: "Workspace" },
    ...(selectedDrawing
      ? [{ label: selectedDrawing.name.replace(/\.[^.]+$/, "") }]
      : []),
    ...(selectedDrawing && selectedPage > 0
      ? [
          {
            label: `Page ${selectedPage}${selectedDrawing.pageCount ? ` of ${selectedDrawing.pageCount}` : ""}`,
          },
        ]
      : []),
  ];

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
        {/* Header */}
        <div className="px-3 py-3 bg-[#fdf8f0] border-b border-amber-100/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <LayoutGrid className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 leading-snug">
              QSCalc Pro Workspace
            </p>
            <p className="text-[10px] text-slate-500 truncate">{projectName}</p>
          </div>
        </div>

        {/* Dashboard */}
        <div className="px-3 py-1 border-b border-slate-100">
          <a
            href={
              basePath.startsWith("/enterprise")
                ? "/enterprise/dashboard"
                : "/dashboard"
            }
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Dashboard
            </span>
          </a>
        </div>

        {/* Tools */}
        <div className="px-3 pt-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tools
            </span>
          </div>
          <TooltipProvider delayDuration={400}>
            <div className="flex gap-1.5">
              {TOOLS.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleToolClick(tool.id)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                        activeTool === tool.id
                          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                          : pendingTool === tool.id
                            ? "bg-amber-100 border-amber-300 text-amber-700"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <tool.icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    <p className="font-semibold text-xs">{tool.label}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">
                      {tool.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          {/* Active tool indicator */}
          {activeTool === "count" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">
                Count
              </span>
              <span className="text-white text-[11px] font-bold"># 0</span>
            </div>
          )}
          {activeTool === "length" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">
                Length
              </span>
              <span className="text-white text-[11px] font-bold">0</span>
            </div>
          )}
          {activeTool === "area" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">Area</span>
              <span className="text-white text-[11px] font-bold">0 m²</span>
            </div>
          )}
          {activeTool === "text" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">Text</span>
            </div>
          )}

          {/* Colour palette */}
          <div className="mt-2.5 h-7 rounded-lg flex overflow-hidden border border-slate-200">
            {PALETTE.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => setActiveColor(c)}
                style={{ backgroundColor: c, flex: 1 }}
                className={`h-full transition-opacity ${activeColor === c ? "ring-2 ring-inset ring-white/70 opacity-100" : "opacity-85 hover:opacity-100"}`}
              />
            ))}
          </div>
        </div>

        {/* Assemblies — hidden when count tool is active */}
        {activeTool !== "count" && (
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Assemblies
              </span>
            </div>
          </div>
        )}

        {/* Elements panel replaces Drawings when count tool is active */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTool === "count" ? (
            /* Count mode: full ELEMENTS panel */
            <div className="flex-1 min-h-0 p-2 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
                <div className="px-3 py-2.5 border-b border-slate-100 shrink-0">
                  <span className="text-[12px] font-bold text-slate-800 tracking-wide">
                    ELEMENTS
                  </span>
                </div>
                <div className="px-2 py-2 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      className="h-7 pl-7 text-[11px] border-slate-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <button
                    onClick={() => setShowElementPanel(true)}
                    className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-[12px] font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Elements
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Normal mode: DRAWINGS card */
            <div className="flex-1 min-h-0 p-2 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[12px] font-bold text-slate-800 tracking-wide">
                      DRAWINGS
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                <div className="flex-1 overflow-y-auto">
                  {folders.length === 0 ||
                  drawings.filter(
                    (d) => d.status === "complete" || d.previewUrl,
                  ).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                      <FolderOpen className="w-8 h-8 text-slate-200" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No drawings uploaded yet.
                        <br />
                        Use Upload below to add files.
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
                                <p className="text-[10px] text-slate-400 px-5 py-1.5 italic">
                                  No files
                                </p>
                              ) : (
                                <div className="flex flex-col">
                                  {files.map((file) => (
                                    <FileRow
                                      key={file.id}
                                      file={file}
                                      isActive={selectedDrawingId === file.id}
                                      activePage={selectedPage}
                                      onSelectFile={() =>
                                        handleSelectFile(file.id)
                                      }
                                      onSelectPage={(pg) =>
                                        handleSelectPage(file.id, pg)
                                      }
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
                <div className="shrink-0 border-t border-slate-100 flex items-center gap-2 p-2">
                  <button
                    onClick={() => setNewFolderOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New Folder
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-600 hover:bg-amber-100 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
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
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-10 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <nav className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0">
            <Home className="w-3 h-3 shrink-0 text-slate-400" />
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                <span
                  className={`truncate max-w-[140px] ${i === breadcrumb.length - 1 ? "text-slate-700 font-semibold" : ""}`}
                >
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Save className="w-3 h-3" /> Auto-saved just now
            </span>
            {scaleLocked && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-lg border border-green-200">
                <Lock className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-700">
                  Scale Locked
                </span>
              </div>
            )}
            {activeTool === "count" && (
              <button
                onClick={() => console.log("[BOQ] View BOQ")}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-[11px] font-semibold transition-colors"
              >
                <FileUp className="w-3 h-3" /> View BOQ
              </button>
            )}
          </div>
        </header>

        {/* Canvas row (canvas + optional element panel) */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 min-w-0 relative overflow-hidden bg-[#e8edf2]">
            <DrawingCanvas
              drawing={selectedDrawing}
              page={selectedPage}
              scale={scale}
              onPageCountResolved={handlePageCountResolved}
            />

            {/* Zoom controls */}
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

            {/* Page indicator */}
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

          {/* Element detail panel */}
          {showElementPanel && (
            <ElementDetailPanel
              measure={scaleWhat}
              showRebarTab={showRebarTab}
              onClose={() => setShowElementPanel(false)}
              onAssignElement={() => setAssignModalOpen(true)}
              onApplyAndContinue={() =>
                console.log("[ElementPanel] Apply & Continue")
              }
              onSaveMeasurement={handleSaveMeasurement}
            />
          )}
        </div>

        {scaleFlowActive && (
          <div className="shrink-0 bg-white border-t border-slate-200">
            {!scaleLocked ? (
              <div
                className="px-6 pt-3 pb-5"
                style={{ backgroundColor: "#FEF2F280" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-[11px] font-bold tracking-wide text-red-600">
                      CALIBRATION REQUIRED
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      Lock Scale:
                    </span>
                    <button
                      disabled={!scaleInfo}
                      onClick={() => {
                        setScaleLocked(true);
                        saveSession(projectId, { scaleLocked: true });
                      }}
                      className={`relative w-9 h-5 rounded-full transition-colors ${scaleInfo ? "bg-slate-200 hover:bg-slate-300 cursor-pointer" : "bg-slate-100 cursor-not-allowed"}`}
                    >
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500">
                      OFF
                    </span>
                  </div>
                </div>

                {/* Row 2: 1/3 steps (left) + 2/3 input (right) */}
                <div className="flex items-start gap-6">
                  {/* Steps — 1 portion */}
                  <div className="w-1/3 space-y-3 shrink-0">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                        1
                      </div>
                      <span className="text-[11px] text-slate-600 leading-snug">
                        Click two points on a known distance on the plan.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                        2
                      </div>
                      <span className="text-[11px] text-slate-600 leading-snug">
                        Enter the real length below.
                      </span>
                    </div>
                  </div>

                  {/* Input section — 2 portions */}
                  <div className="w-2/3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Known Distance on Plan
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        value={knownDistance}
                        onChange={(e) => setKnownDistance(e.target.value)}
                        className="h-9 flex-1 text-sm"
                        placeholder="0"
                      />
                      <Select
                        value={distanceUnit}
                        onValueChange={setDistanceUnit}
                      >
                        <SelectTrigger className="h-9 w-28 text-[11px] shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Meters", "mm", "cm", "ft"].map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleApplyScale}
                        className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold px-5 shrink-0"
                      >
                        Apply Scale
                      </Button>
                    </div>

                    {/* In-UI success notification — shown for 5 s after Apply Scale */}
                    {showScaleNotification && scaleInfo && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-[12px] font-bold text-green-700">
                          Scale calculated: 1:100
                        </span>
                        <span className="text-slate-300 text-sm">|</span>
                        <span className="text-[12px] text-slate-500">
                          10.5 px per cm
                        </span>
                        <button
                          onClick={handleResetScale}
                          className="ml-auto text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Ready to measure panel ── */
              <div>
                <div className="flex items-center justify-between px-6 py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-[12px] font-semibold text-green-600">
                      Ready to measure. Click line tool and trace any wall.
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Lock Scale:
                      </span>
                      <button
                        onClick={() => {
                          setScaleLocked(false);
                          saveSession(projectId, { scaleLocked: false });
                        }}
                        className="relative w-9 h-5 rounded-full bg-green-500 transition-colors"
                      >
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" />
                      </button>
                      <span className="text-[11px] font-bold text-green-600">
                        ON
                      </span>
                    </div>
                    <button
                      onClick={handleResetScale}
                      className="text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Edit Calibration
                    </button>
                  </div>
                </div>

                {/* Quick tips row */}
                <div className="flex items-center gap-3 px-6 py-2 bg-amber-50/60 border-t border-amber-100">
                  <span className="text-[13px] text-amber-500">💡</span>
                  <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                    Quick tips:
                  </span>
                  <span className="text-[10px] text-slate-400">Press</span>
                  {[
                    { key: "L", label: "for line tool" },
                    { key: "A", label: "for area" },
                    { key: "C", label: "for count" },
                  ].map(({ key, label }) => (
                    <span
                      key={key}
                      className="flex items-center gap-1 text-[10px] text-slate-400"
                    >
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
                        {key}
                      </kbd>
                      {label}
                    </span>
                  ))}
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">
                    Double-click to finish polygon
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">
                    Right-click to cancel
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={handleCreateFolder}
      />

      <BBSQuestionModal
        open={bbsModalStep === "question"}
        answer={bbsAnswer}
        onAnswerChange={setBbsAnswer}
        onClose={handleBBSClose}
        onSkip={handleBBSSkip}
        onContinue={handleBBSContinue}
      />

      <BBSEntryModal
        open={bbsModalStep === "entry"}
        rows={bbsRows}
        onRowChange={handleBBSRowChange}
        onAddRow={handleAddBBSRow}
        onCancel={handleBBSEntryCancel}
        onSave={handleBBSSave}
      />

      <ScaleSetupModal
        open={showScaleSetup}
        measure={scaleWhat}
        onMeasureChange={setScaleWhat}
        onCancel={handleScaleSetupCancel}
        onYes={handleScaleSetupProceed}
      />

      <AssignItemsModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onContinue={handleAssignContinue}
      />

      <ConfirmAssignmentModal
        open={confirmAssignOpen}
        onCancel={() => {
          setConfirmAssignOpen(false);
          setAssignModalOpen(true);
        }}
        onConfirm={handleConfirmMerge}
      />

      <AssignmentCompleteModal
        open={assignCompleteOpen}
        onClose={() => setAssignCompleteOpen(false)}
        onViewElement={() => {
          setAssignCompleteOpen(false);
          console.log("[Assignment] View element");
        }}
      />

      <CreateNewElementModal
        open={createNewElOpen}
        onClose={() => setCreateNewElOpen(false)}
        onUseExisting={() => {
          setCreateNewElOpen(false);
          setAssignModalOpen(true);
        }}
        onCreate={handleCreateNewEl}
      />

      {/* Hidden PDF preloaders — eagerly resolve page count so sidebar shows all pages without
          requiring the user to click each file first.
          • PDF:     loaded here via react-pdf → onPageCountResolved → Redux
          • Image:   pages auto-set to [{Page 1}] in addDrawing reducer (always 1 page)
          • BIM/CAD: pages populated by the viewer via onPageCountResolved once subscription active */}
      <div className="hidden" aria-hidden>
        {drawings
          .filter(
            (d) => d.category === "pdf" && d.previewUrl && d.pages.length === 0,
          )
          .map((d) => (
            <Document
              key={`preload-${d.id}`}
              file={d.previewUrl!}
              onLoadSuccess={({ numPages }) =>
                handlePageCountResolved(d.id, numPages)
              }
            />
          ))}
      </div>
    </div>
  );
}
