"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen,
  FolderPlus,
  Upload,
  Home,
  ChevronRight,
  ChevronDown,
  Lock,
  Plus,
  FileUp,
  Wrench,
  SlidersHorizontal,
  LayoutGrid,
  CheckCircle2,
  Save,
  Box,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
} from "@/store/slices/manualWizardSlice";
import { toast } from "sonner";
import {
  loadSession,
  saveSession,
  type WsConcreteMeasurement,
  type WsElementAssignment,
} from "./workspaceSession";

import { DrawingCanvas } from "./components/DrawingCanvas";
import { DrawingPreloader } from "./components/DrawingPreloader";
import { FileRow } from "./components/FileRow";
import { NewFolderDialog } from "./components/NewFolderDialog";
import { useCanvasMeasurements } from "./hooks/useCanvasMeasurements";
import type { MPoint } from "./components/types";

const MeasurementCanvas = dynamic(
  () =>
    import("./components/MeasurementCanvas").then((m) => ({
      default: m.MeasurementCanvas,
    })),
  { ssr: false }
);
import { BBSQuestionModal } from "./components/BBSQuestionModal";
import { BBSEntryModal } from "./components/BBSEntryModal";
import { ScaleSetupModal } from "./components/ScaleSetupModal";
import { ElementDetailPanel } from "./components/ElementDetailPanel";
import { AssignItemsModal } from "./components/AssignItemsModal";
import { ConfirmAssignmentModal } from "./components/ConfirmAssignmentModal";
import { AssignmentCompleteModal } from "./components/AssignmentCompleteModal";
import { CreateNewElementModal } from "./components/CreateNewElementModal";
import { PALETTE, TOOLS, ACCEPTED_EXTENSIONS, EXT_CATEGORY, MOCK_EXISTING_ELEMENTS } from "./components/constants";
import { getExt, simulateUpload } from "./components/utils";
import type { ToolId, BBSRow, PileRow, CreatedElement, Measurement } from "./components/types";

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
  const folders = useAppSelector((state) => state.manualWizard.folders);

  const projectName = backendProject?.name ?? `Project ${projectId.slice(0, 8)}`;

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [savedSession] = useState(() => loadSession(projectId));
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [pendingTool, setPendingTool] = useState<ToolId | null>(null);
  const [scaleFlowActive, setScaleFlowActive] = useState(() => savedSession.scaleFlowActive ?? false);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [search, setSearch] = useState("");
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(() => drawings[0]?.id ?? null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<string[]>(() => folders.map((f) => f.id));

  // Count tool BBS flow
  const [bbsModalStep, setBbsModalStep] = useState<"question" | "entry" | null>(null);
  const [bbsAnswer, setBbsAnswer] = useState<"yes" | "no">(() => savedSession.bbsAnswer ?? "yes");
  const [bbsRows, setBbsRows] = useState<BBSRow[]>(
    () => savedSession.bbsRows ?? [{ id: "1", mark: "", size: "Y16", length: "", quantity: "" }],
  );
  const [showScaleSetup, setShowScaleSetup] = useState(false);
  const [scaleWhat, setScaleWhat] = useState(() => savedSession.scaleWhat ?? "Pile");
  const [countModeActive, setCountModeActive] = useState(false);
  const [knownDistance, setKnownDistance] = useState(() => savedSession.knownDistance ?? "");
  const [distanceUnit, setDistanceUnit] = useState(() => savedSession.distanceUnit ?? "Meters");
  const [scaleLocked, setScaleLocked] = useState(() => savedSession.scaleLocked ?? false);
  const [scaleInfo, setScaleInfo] = useState<string | null>(() => savedSession.scaleInfo ?? null);
  const [showScaleNotification, setShowScaleNotification] = useState(false);
  const scaleNotifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Element detail panel — restore from session if scale was already active
  const [showElementPanel, setShowElementPanel] = useState(() => savedSession.scaleFlowActive ?? false);
  const [showRebarTab, setShowRebarTab] = useState(() => savedSession.showRebarTab ?? false);
  const [concreteMeasurements, setConcreteMeasurements] = useState<WsConcreteMeasurement[]>(
    () => savedSession.concreteMeasurements ?? [],
  );

  // Assign element flow
  const [assigningElementId, setAssigningElementId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [assignCompleteOpen, setAssignCompleteOpen] = useState(false);
  const [createNewElOpen, setCreateNewElOpen] = useState(false);

  // Sidebar: DRAWINGS collapsible drawer + ELEMENTS panel
  const [drawingsOpen, setDrawingsOpen] = useState(false);
  const [elementSearch, setElementSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [elements, setElements] = useState<CreatedElement[]>(() => {
    try {
      const raw = localStorage.getItem(`ws-elements-${projectId}`);
      return raw ? (JSON.parse(raw) as CreatedElement[]) : [];
    } catch { return []; }
  });

  // ── Calibration points (received from canvas during calibration) ─────────────
  const [calibPtCount, setCalibPtCount] = useState<0 | 1 | 2>(0);
  const [calibBasePxDist, setCalibBasePxDist] = useState<number | null>(null);
  const [calibPts, setCalibPts] = useState<[MPoint, MPoint] | null>(null);

  // Live in-progress length from the canvas (A→cursor, null when not drawing)
  const [liveDrawingLength, setLiveDrawingLength] = useState<number | null>(null);

  // ── Session totals — accumulate across files until Apply & Continue ───────────
  // Left sidebar  = per-page totals (lengthTotal / countTotal / areaTotal below)
  // Right sidebar = session totals (what you've measured this round across all files)
  const [sessionTotals, setSessionTotals] = useState({ count: 0, length: 0, area: 0 });

  // ── Per-page measurement state (persisted to localStorage) ───────────────────
  const measurementHook = useCanvasMeasurements(selectedDrawingId, selectedPage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId) ?? null;

  // ── Tool click ───────────────────────────────────────────────────────────────

  function handleToolClick(id: ToolId) {
    if (id === "undo") { measurementHook.undo(); return; }
    if (id === "redo") { measurementHook.redo(); return; }
    setPendingTool(id);
    setBbsModalStep("question");
  }

  // ── BBS question ─────────────────────────────────────────────────────────────

  function handleBBSClose() { setBbsModalStep(null); setPendingTool(null); }
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
      setShowRebarTab(true);
      saveSession(projectId, { bbsAnswer, showRebarTab: true });
      setBbsModalStep(null);
      setShowScaleSetup(true);
    }
  }

  // ── BBS entry ────────────────────────────────────────────────────────────────

  function handleBBSEntryCancel() { setBbsModalStep(null); setPendingTool(null); }
  function handleBBSSave() {
    console.log("[CountTool] BBS saved:", bbsRows);
    toast.success("Bar Bending Schedule saved");
    setShowRebarTab(false);
    saveSession(projectId, { bbsAnswer, bbsRows, showRebarTab: false });
    setBbsModalStep(null);
    setShowScaleSetup(true);
  }
  function handleBBSRowChange(id: string, field: keyof BBSRow, value: string) {
    setBbsRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function handleAddBBSRow() {
    setBbsRows((rows) => [...rows, { id: crypto.randomUUID(), mark: "", size: "Y16", length: "", quantity: "" }]);
  }

  // ── Scale setup ──────────────────────────────────────────────────────────────

  function handleScaleSetupProceed() {
    setShowScaleSetup(false);
    setScaleFlowActive(true);
    setShowElementPanel(true);

    if (scaleLocked) {
      // Scale already set for this page — activate the tool directly, no re-calibration
      if (pendingTool) {
        setActiveTool(pendingTool);
        if (pendingTool === "count") setCountModeActive(true);
        setPendingTool(null);
      }
      saveSession(projectId, { scaleWhat, scaleFlowActive: true, scaleLocked: true });
    } else {
      // Scale not yet set — enter calibration mode
      setCalibPtCount(0);
      setCalibBasePxDist(null);
      setCalibPts(null);
      saveSession(projectId, { scaleWhat, scaleFlowActive: true });
    }
  }
  function handleScaleSetupCancel() { setShowScaleSetup(false); setPendingTool(null); }

  // ── Calibration ──────────────────────────────────────────────────────────────

  function handleApplyScale() {
    if (!knownDistance) {
      toast.warning("Enter a known distance first");
      return;
    }
    if (!calibBasePxDist || !calibPts) {
      toast.warning("Click two points on the drawing to define the reference distance");
      return;
    }
    const realDist = parseFloat(knownDistance);
    if (isNaN(realDist) || realDist <= 0) {
      toast.warning("Enter a valid distance greater than 0");
      return;
    }

    // scaleFactor = base pixels per real unit
    const sf = calibBasePxDist / realDist;
    measurementHook.setCalibration(calibPts, sf);

    const approxRatio = Math.round(calibBasePxDist / realDist);
    const newScaleInfo = `Scale: 1:${approxRatio} | ${sf.toFixed(1)} px/${distanceUnit}`;
    setScaleInfo(newScaleInfo);
    setScaleLocked(true);
    setShowScaleNotification(true);
    if (scaleNotifTimerRef.current) clearTimeout(scaleNotifTimerRef.current);
    scaleNotifTimerRef.current = setTimeout(() => setShowScaleNotification(false), 5000);
    saveSession(projectId, {
      knownDistance,
      distanceUnit,
      scaleWhat,
      scaleInfo: newScaleInfo,
      scaleFlowActive: true,
      scaleLocked: true,
    });

    if (pendingTool) {
      setActiveTool(pendingTool);
      if (pendingTool === "count") { setCountModeActive(true); setShowElementPanel(true); }
      setPendingTool(null);
    }
  }

  function handleResetScale() {
    if (scaleNotifTimerRef.current) clearTimeout(scaleNotifTimerRef.current);
    setScaleInfo(null);
    setShowScaleNotification(false);
    setKnownDistance("");
    setScaleLocked(false);
    setScaleFlowActive(false);
    setActiveTool(null);
    setCountModeActive(false);
    setShowElementPanel(false);
    setPendingTool(null);
    setCalibPtCount(0);
    setCalibBasePxDist(null);
    setCalibPts(null);
    saveSession(projectId, { scaleInfo: null, knownDistance: "", scaleLocked: false, scaleFlowActive: false });
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
    if (mode === "existing") { setConfirmAssignOpen(true); } else { setCreateNewElOpen(true); }
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
  function handleCreateNewEl(data: { categoryFolder: string; rows: PileRow[] }) {
    const parts = data.categoryFolder.split(" / ");
    const category = parts[0] ?? "Substructure";
    const name = parts.slice(1).join(" / ") || "Element";

    const newEl: CreatedElement = {
      id: crypto.randomUUID(),
      name,
      category,
      variants: data.rows,
      drawnCount: 0,
      createdAt: Date.now(),
    };

    setElements((prev) => {
      const next = [...prev, newEl];
      localStorage.setItem(`ws-elements-${projectId}`, JSON.stringify(next));
      return next;
    });

    setExpandedCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category],
    );

    setCreateNewElOpen(false);
    toast.success("Element created and saved");
  }

  // ── Calibration callback (from MeasurementCanvas) ────────────────────────────

  function handleCalibrationUpdate(
    basePxDist: number | null,
    pts: [MPoint, MPoint] | null,
    ptCount: 0 | 1 | 2
  ) {
    setCalibBasePxDist(basePxDist);
    setCalibPts(pts);
    setCalibPtCount(ptCount);
  }

  // ── Measurement add — updates canvas state AND session totals ─────────────────

  function handleMeasurementAdd(m: Measurement) {
    measurementHook.addMeasurement(m);
    if (m.type === "count") {
      setSessionTotals((prev) => ({ ...prev, count: prev.count + 1 }));
    } else if (m.type === "length") {
      setSessionTotals((prev) => ({ ...prev, length: prev.length + m.realLength }));
    } else if (m.type === "area") {
      setSessionTotals((prev) => ({ ...prev, area: prev.area + m.realArea }));
    }
  }

  // ── Apply & Continue / Assign Element — save then reset session counters ──────
  // Canvas lines are permanent records; only the session totals reset.

  function handleSessionReset() {
    setSessionTotals({ count: 0, length: 0, area: 0 });
    setLiveDrawingLength(null);
  }

  // ── Per-page totals for the LEFT sidebar stat bar ─────────────────────────────

  const { countTotal, lengthTotal, areaTotal } = useMemo(() => {
    const ms = measurementHook.state.measurements;
    const sf = measurementHook.state.scaleFactor;
    let countTotal = 0, lengthTotal = 0, areaTotal = 0;
    for (const m of ms) {
      if (m.type === "count") countTotal++;
      else if (m.type === "length" && sf) lengthTotal += m.pixelLength / sf;
      else if (m.type === "area" && sf) areaTotal += m.pixelArea / (sf * sf);
    }
    return { countTotal, lengthTotal, areaTotal };
  }, [measurementHook.state.measurements, measurementHook.state.scaleFactor]);

  const nextCountIndex = useMemo(
    () => measurementHook.state.measurements.filter((m) => m.type === "count").length + 1,
    [measurementHook.state.measurements]
  );

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
    if (selectedDrawingId !== fileId) { setSelectedDrawingId(fileId); setScale(1.0); }
    setSelectedPage(pageNum);
  }

  const handlePageCountResolved = useCallback(
    (id: string, numPages: number) => {
      const drawing = drawings.find((d) => d.id === id);
      if (!drawing || drawing.pageCount === numPages) return;
      dispatch(
        setDrawingPages({
          id,
          pages: Array.from({ length: numPages }, (_, i) => ({ number: i + 1, label: `Page ${i + 1}` })),
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
      const previewUrl = category === "pdf" || category === "image" ? URL.createObjectURL(file) : undefined;
      dispatch(addDrawing({ id, name: file.name, size: file.size, extension: ext, category, status: "uploading", progress: 0, previewUrl, folderId: targetFolderId }));
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
    if (firstNewId) { setSelectedDrawingId(firstNewId); setSelectedPage(1); setScale(1.0); }
  }

  function getFilesForFolder(folder: DrawingFolder) {
    return folder.fileIds
      .map((id) => drawings.find((d) => d.id === id))
      .filter((d): d is DrawingFile => !!d && d.name.toLowerCase().includes(search.toLowerCase()));
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  const filteredElements = elementSearch
    ? elements.filter(
        (el) =>
          el.name.toLowerCase().includes(elementSearch.toLowerCase()) ||
          el.category.toLowerCase().includes(elementSearch.toLowerCase()),
      )
    : elements;

  const elementsByCategory = filteredElements.reduce<Record<string, CreatedElement[]>>((acc, el) => {
    if (!acc[el.category]) acc[el.category] = [];
    acc[el.category].push(el);
    return acc;
  }, {});

  const breadcrumb = [
    { label: "Workspace" },
    ...(selectedDrawing ? [{ label: selectedDrawing.name.replace(/\.[^.]+$/, "") }] : []),
    ...(selectedDrawing && selectedPage > 0
      ? [{ label: `Page ${selectedPage}${selectedDrawing.pageCount ? ` of ${selectedDrawing.pageCount}` : ""}` }]
      : []),
  ];

  if (isLoading && !backendProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8edf2]">
      {/* ── Left sidebar ── */}
      <aside className="w-[248px] shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-3 bg-[#fdf8f0] border-b border-amber-100/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <LayoutGrid className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 leading-snug">QSCalc Pro Workspace</p>
            <p className="text-[10px] text-slate-500 truncate">{projectName}</p>
          </div>
        </div>

        {/* Dashboard */}
        <div className="px-3 py-1 border-b border-slate-100">
          <a
            href={basePath.startsWith("/enterprise") ? "/enterprise/dashboard" : "/dashboard"}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Dashboard</span>
          </a>
        </div>

        {/* Tools */}
        <div className="px-3 pt-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tools</span>
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
                    <p className="text-[10px] opacity-75 mt-0.5">{tool.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          {activeTool === "count" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">Count</span>
              <span className="text-white text-[11px] font-bold"># {countTotal}</span>
            </div>
          )}
          {activeTool === "length" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">Length</span>
              <span className="text-white text-[11px] font-bold">
                {(lengthTotal + (liveDrawingLength ?? 0)).toFixed(2)} {distanceUnit}
              </span>
            </div>
          )}
          {activeTool === "area" && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
              <span className="text-white text-[11px] font-semibold">Area</span>
              <span className="text-white text-[11px] font-bold">
                {areaTotal.toFixed(2)} {distanceUnit === "Meters" ? "m²" : `${distanceUnit}²`}
              </span>
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

        {/* ELEMENTS + DRAWINGS drawer */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* ELEMENT section label */}
          <div className="px-3 py-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Element</span>
            </div>
          </div>

          {/* Content: elements list (behind) + DRAWINGS drawer (on top) */}
          <div className="flex-1 min-h-0 relative overflow-hidden">

            {/* ELEMENTS panel — always rendered */}
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <div className="px-2 py-2 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <Input
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Search elements..."
                    className="h-7 pl-7 text-[11px] border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {Object.keys(elementsByCategory).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
                    <Box className="w-8 h-8 text-slate-200" />
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      No elements yet.
                    </p>
                    <button
                      onClick={() => setCreateNewElOpen(true)}
                      className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-[12px] font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Elements
                    </button>
                  </div>
                ) : (
                  <>
                    {Object.entries(elementsByCategory).map(([category, els]) => (
                      <div key={category}>
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                              {category}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${expandedCategories.includes(category) ? "" : "-rotate-90"}`}
                          />
                        </button>

                        {expandedCategories.includes(category) &&
                          els.map((el) => (
                            <button
                              key={el.id}
                              className="w-full flex items-start gap-2 px-4 py-2 hover:bg-slate-50 transition-colors text-left border-b border-slate-50"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-slate-700 truncate">{el.name}</p>
                                {el.variants.length > 0 ? (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                    <span className="text-[10px] text-slate-500">
                                      {el.variants.length} variant{el.variants.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 mt-0.5">(0 drawn)</p>
                                )}
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                            </button>
                          ))}
                      </div>
                    ))}

                    <div className="px-3 py-2.5">
                      <button
                        onClick={() => setCreateNewElOpen(true)}
                        className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-[12px] font-semibold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Elements
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DRAWINGS bottom drawer — slides up over elements */}
            <div
              className="absolute inset-x-2 bottom-0 flex flex-col overflow-hidden rounded-tl-xl rounded-tr-xl"
              style={{
                height: drawingsOpen ? "100%" : "44px",
                transition: "height 0.3s ease-in-out",
              }}
            >
              {/* DRAWINGS header bar — always visible at top of drawer */}
              <button
                onClick={() => setDrawingsOpen((v) => !v)}
                className="h-11 shrink-0 flex items-center justify-between px-3 bg-amber-500 text-white"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-[12px] font-bold tracking-wide">DRAWINGS</span>
                </div>
                <SlidersHorizontal className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* DRAWINGS content */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
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
                  {folders.length === 0 || drawings.filter((d) => d.status === "complete" || d.previewUrl).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                      <FolderOpen className="w-8 h-8 text-slate-200" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        No drawings uploaded yet.
                        <br />
                        Use Upload below to add files.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {folders.map((folder) => {
                        const files = getFilesForFolder(folder);
                        if (files.length === 0 && search) return null;
                        const isOpen = openFolders.includes(folder.id);
                        return (
                          <div key={folder.id}>
                            {/* Folder header toggle */}
                            <button
                              onClick={() =>
                                setOpenFolders((prev) =>
                                  isOpen
                                    ? prev.filter((id) => id !== folder.id)
                                    : [...prev, folder.id],
                                )
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-widest flex-1">
                                {folder.name}
                              </span>
                              <span className="text-[9px] text-slate-400 shrink-0 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full">
                                {folder.fileIds.length}
                              </span>
                              <ChevronDown
                                className={`w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform duration-150 ${
                                  isOpen ? "" : "-rotate-90"
                                }`}
                              />
                            </button>

                            {/* Files — plain div, no overflow constraint */}
                            {isOpen && (
                              <div className="flex flex-col">
                                {files.length === 0 ? (
                                  <p className="text-[10px] text-slate-400 px-5 py-1.5 italic">
                                    No files
                                  </p>
                                ) : (
                                  files.map((file) => (
                                    <FileRow
                                      key={file.id}
                                      file={file}
                                      isActive={selectedDrawingId === file.id}
                                      activePage={selectedPage}
                                      onSelectFile={() => handleSelectFile(file.id)}
                                      onSelectPage={(pg) => handleSelectPage(file.id, pg)}
                                    />
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-10 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <nav className="flex items-center gap-1 text-[11px] text-slate-500 min-w-0">
            <Home className="w-3 h-3 shrink-0 text-slate-400" />
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                <span className={`truncate max-w-[140px] ${i === breadcrumb.length - 1 ? "text-slate-700 font-semibold" : ""}`}>
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
                <span className="text-[10px] font-semibold text-green-700">Scale Locked</span>
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

        {/* Canvas row */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="flex-1 min-w-0 relative overflow-hidden bg-[#e8edf2]">
            <DrawingCanvas
              drawing={selectedDrawing}
              page={selectedPage}
              scale={scale}
              onPageCountResolved={handlePageCountResolved}
              measurementOverlay={
                <MeasurementCanvas
                  pdfScale={scale}
                  activeTool={activeTool}
                  isCalibrating={scaleFlowActive && !scaleLocked}
                  scaleFactor={measurementHook.state.scaleFactor}
                  distanceUnit={distanceUnit}
                  activeColor={activeColor}
                  measurements={measurementHook.state.measurements}
                  nextCountIndex={nextCountIndex}
                  pageKey={`${selectedDrawingId ?? "none"}-${selectedPage}`}
                  onCalibrationUpdate={handleCalibrationUpdate}
                  onMeasurementAdd={handleMeasurementAdd}
                  onLiveLength={setLiveDrawingLength}
                  onUndo={measurementHook.undo}
                  onRedo={measurementHook.redo}
                />
              }
            />

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-1">
              <button onClick={zoomIn} disabled={scale >= 3} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40" title="Zoom in">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={zoomOut} disabled={scale <= 0.25} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40" title="Zoom out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={resetZoom} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500" title="Reset zoom">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page indicator */}
            {selectedDrawing && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white rounded-lg shadow-md border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 font-medium">
                <FileUp className="w-3.5 h-3.5 text-amber-500" />
                Page {selectedPage}
                {selectedDrawing.name && (
                  <span className="text-slate-400">— {selectedDrawing.name.replace(/\.[^.]+$/, "")}</span>
                )}
              </div>
            )}
          </div>

          {/* Element detail panel */}
          {showElementPanel && (
            <ElementDetailPanel
              measure={scaleWhat}
              showRebarTab={showRebarTab}
              activeMeasureTool={
                activeTool === "length" || activeTool === "area" || activeTool === "count"
                  ? activeTool
                  : null
              }
              liveCount={sessionTotals.count}
              liveLength={sessionTotals.length + (liveDrawingLength ?? 0)}
              liveArea={sessionTotals.area}
              distanceUnit={distanceUnit}
              hasMeasurements={
                sessionTotals.count > 0 || sessionTotals.length > 0 || sessionTotals.area > 0
              }
              onClose={() => setShowElementPanel(false)}
              onAssignElement={() => setAssignModalOpen(true)}
              onApplyAndContinue={handleSessionReset}
              onSaveMeasurement={handleSaveMeasurement}
              onResetMeasurements={handleSessionReset}
            />
          )}
        </div>

        {/* Calibration / Ready bar */}
        {scaleFlowActive && (
          <div className="shrink-0 bg-white border-t border-slate-200">
            {!scaleLocked ? (
              <div className="px-6 pt-3 pb-5" style={{ backgroundColor: "#FEF2F280" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-[11px] font-bold tracking-wide text-red-600">CALIBRATION REQUIRED</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Lock Scale:</span>
                    <button
                      disabled={!scaleInfo}
                      onClick={() => { setScaleLocked(true); saveSession(projectId, { scaleLocked: true }); }}
                      className={`relative w-9 h-5 rounded-full transition-colors ${scaleInfo ? "bg-slate-200 hover:bg-slate-300 cursor-pointer" : "bg-slate-100 cursor-not-allowed"}`}
                    >
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500">OFF</span>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-1/3 space-y-3 shrink-0">
                    {/* Step 1 — dynamic based on points placed */}
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px ${calibPtCount === 2 ? "bg-green-500" : "bg-amber-500"}`}>
                        1
                      </div>
                      <span className={`text-[11px] leading-snug ${calibPtCount === 2 ? "text-green-600 font-medium" : "text-slate-600"}`}>
                        {calibPtCount === 0 && "Click the first point on a known distance on the plan."}
                        {calibPtCount === 1 && "✓ Point 1 set — click the second point."}
                        {calibPtCount === 2 && `✓ Both points set — ${calibBasePxDist?.toFixed(0)} px measured.`}
                      </span>
                    </div>
                    {/* Step 2 */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                        2
                      </div>
                      <span className="text-[11px] text-slate-600 leading-snug">Enter the real length below.</span>
                    </div>
                  </div>

                  <div className="w-2/3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Known Distance on Plan</span>
                    <div className="flex items-center gap-2">
                      <Input value={knownDistance} onChange={(e) => setKnownDistance(e.target.value)} className="h-9 flex-1 text-sm" placeholder="0" />
                      <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                        <SelectTrigger className="h-9 w-28 text-[11px] shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Meters", "mm", "cm", "ft"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleApplyScale} className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold px-5 shrink-0">
                        Apply Scale
                      </Button>
                    </div>

                    {showScaleNotification && scaleInfo && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-[12px] font-bold text-green-700">{scaleInfo}</span>
                        <button onClick={handleResetScale} className="ml-auto text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors">
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
                      <span className="text-[11px] text-slate-500">Lock Scale:</span>
                      <button
                        onClick={() => { setScaleLocked(false); saveSession(projectId, { scaleLocked: false }); }}
                        className="relative w-9 h-5 rounded-full bg-green-500 transition-colors"
                      >
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" />
                      </button>
                      <span className="text-[11px] font-bold text-green-600">ON</span>
                    </div>
                    <button onClick={handleResetScale} className="text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors">
                      Edit Calibration
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-2 bg-amber-50/60 border-t border-amber-100">
                  <span className="text-[13px] text-amber-500">💡</span>
                  <span className="text-[10px] font-semibold text-slate-500 shrink-0">Quick tips:</span>
                  <span className="text-[10px] text-slate-400">Press</span>
                  {[{ key: "L", label: "for line tool" }, { key: "A", label: "for area" }, { key: "C", label: "for count" }].map(({ key, label }) => (
                    <span key={key} className="flex items-center gap-1 text-[10px] text-slate-400">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">{key}</kbd>
                      {label}
                    </span>
                  ))}
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">Double-click to finish polygon</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">Right-click to cancel</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} onConfirm={handleCreateFolder} />

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
        existingElements={elements}
        onClose={() => setAssignModalOpen(false)}
        onContinue={handleAssignContinue}
      />

      <ConfirmAssignmentModal
        open={confirmAssignOpen}
        onCancel={() => { setConfirmAssignOpen(false); setAssignModalOpen(true); }}
        onConfirm={handleConfirmMerge}
      />

      <AssignmentCompleteModal
        open={assignCompleteOpen}
        onClose={() => setAssignCompleteOpen(false)}
        onViewElement={() => { setAssignCompleteOpen(false); console.log("[Assignment] View element"); }}
      />

      <CreateNewElementModal
        open={createNewElOpen}
        onClose={() => setCreateNewElOpen(false)}
        onUseExisting={() => { setCreateNewElOpen(false); setAssignModalOpen(true); }}
        onCreate={handleCreateNewEl}
      />

      {/* Hidden PDF preloaders — eagerly resolve page count so sidebar shows all pages without
          requiring the user to click each file first. */}
      <DrawingPreloader drawings={drawings} onPageCountResolved={handlePageCountResolved} />
    </div>
  );
}
