"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Expand,
  Ban,
  FolderOpen,
  Folder,
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
  Trash2,
  Hand,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useRouter } from "next/navigation";
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "@/store/api/projectsApi";
import {
  useUploadFileMutation,
  useGetUploadQuery,
  useDownloadUploadQuery,
} from "@/store/api/uploadApi";
import {
  useCreateMeasurementSessionMutation,
  useGetMeasurementSessionQuery,
  useUpdateMeasurementCanvasMutation,
  useUpdateMeasurementSessionStatusMutation,
  useUpsertMeasurementElementMutation,
  useDeleteMeasurementElementMutation,
  useFinalizeMeasurementSessionMutation,
  useLazyListProjectMeasurementSessionsQuery,
  useLazyGetMeasurementSessionQuery,
  useDeleteMeasurementSessionMutation,
} from "@/store/api/measurementSessionApi";
import type {
  MeasurementElement as BackendMeasurementElement,
  MeasurementGeometry,
} from "@/types/measurementSession";
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
  loadPageCalibration,
  savePageCalibration,
  clearPageCalibration,
  type WsConcreteMeasurement,
  type WsElementAssignment,
  type VariantCalibration,
} from "./workspaceSession";
import type { SaveMeasurementPayload } from "./components/ElementDetailPanel";

import { DrawingCanvas } from "./components/DrawingCanvas";
import { DrawingPreloader } from "./components/DrawingPreloader";
import { FileRow } from "./components/FileRow";
import { NewFolderDialog } from "./components/NewFolderDialog";
import {
  WorkspaceOnboarding,
  hasSeenWorkspaceOnboarding,
  type OnboardingStep,
} from "./components/WorkspaceOnboarding";
import {
  useCanvasMeasurements,
  removeMeasurementsFromStorage,
} from "./hooks/useCanvasMeasurements";
import type { MPoint } from "./components/types";

const MeasurementCanvas = dynamic(
  () =>
    import("./components/MeasurementCanvas").then((m) => ({
      default: m.MeasurementCanvas,
    })),
  { ssr: false },
);
import { BBSQuestionModal } from "./components/BBSQuestionModal";
import { BBSEntryModal } from "./components/BBSEntryModal";
import { ScaleSetupModal } from "./components/ScaleSetupModal";
import { ElementDetailPanel } from "./components/ElementDetailPanel";
import { LiveMeasurementsPanel } from "./components/LiveMeasurementsPanel";
import { AssignItemsModal } from "./components/AssignItemsModal";
import { ConfirmAssignmentModal } from "./components/ConfirmAssignmentModal";
import { AssignmentCompleteModal } from "./components/AssignmentCompleteModal";
import { CreateNewElementModal } from "./components/CreateNewElementModal";
import {
  PALETTE,
  TOOLS,
  ACCEPTED_EXTENSIONS,
  EXT_CATEGORY,
  ELEMENT_CONFIGS,
  LINTEL_LENGTH_BONUS_M,
} from "./components/constants";
import { getExt } from "./components/utils";
import type {
  ToolId,
  BBSRow,
  PileRow,
  CreatedElement,
  Measurement,
  LengthMeasurement,
  AreaMeasurement,
  CountMark,
} from "./components/types";

// ── Measurement ↔ backend element converters ──────────────────────────────────

const HYDRATION_COLOR = "#f59e0b";

function toXY(p: { x: number; y: number }): [number, number] {
  return [p.x, p.y];
}

// Returns 0..N Measurement objects for a single backend element.
// Count elements stored as multipoint produce one CountMark per point.
function backendElementToMeasurement(
  el: BackendMeasurementElement,
  countIndex: number,
): Measurement[] {
  const pts = el.geometry?.points ?? [];

  if (el.tool === "count") {
    if (pts.length === 0) return [];
    return pts.map((pt, i) => ({
      id: `${el.clientId}:${i}`,
      type: "count" as const,
      point: { x: pt[0], y: pt[1] },
      index: countIndex + i,
      color: HYDRATION_COLOR,
    }));
  }

  if (el.tool === "length" && pts.length >= 2) {
    return [
      {
        id: el.clientId,
        type: "length" as const,
        points: pts.map(([x, y]) => ({ x, y })),
        pixelLength: el.computed?.lengthPx ?? 0,
        realLength: el.computed?.length ?? 0,
        unit: "m",
        color: HYDRATION_COLOR,
      },
    ];
  }

  if (el.tool === "area" && pts.length >= 3) {
    return [
      {
        id: el.clientId,
        type: "area" as const,
        points: pts.map(([x, y]) => ({ x, y })),
        pixelArea: el.computed?.areaPx ?? 0,
        realArea: el.computed?.area ?? 0,
        unit: "m²",
        color: HYDRATION_COLOR,
      },
    ];
  }

  return [];
}

// Maps UI display names → backend takeoff element type strings (underscore_case).
// The backend materializes only elements whose mapsToElementType matches a known type.
function toBackendElementType(measureType: string): string {
  const map: Record<string, string> = {
    // Substructure
    Piles: "pile",
    Pile: "pile",
    "Pile Cap": "pile_cap",
    "Ground Beam / Raft": "ground_beam",
    "Column Base / Pad": "pad_footing",
    "Stud Column / Column in Foundation": "column_in_foundation",
    "Ground Floor Slab": "ground_floor_bed",
    "Pile Cap Frames": "pile_cap_frames",
    "Column in Foundation": "column_in_foundation",
    "Column Footing": "column_footing",
    "Pad Footing": "pad_footing",
    "Ground Beam": "ground_beam",
    "Excavation Ground Beam": "excavation_ground_beam",
    Strip: "strip_foundation",
    "Strip Foundation": "strip_foundation",
    "Strip Length Calculator": "strip_length_calculator",
    "Excavation Strip": "excavation_strip",
    "Raft Foundation": "raft_foundation",
    "Oversite Slab": "oversite_slab",
    "Ground Floor Bed": "ground_floor_bed",
    "Ground Floor Bed Void": "ground_floor_bed_void",
    "Water Slab": "water_slab",
    "Swimming Pool": "swimming_pool",
    "Deduction: Pad Pit in Strip": "ddt_pad_pit_in_strip",
    "Excavation Clearing": "excavation_clearing",
    // Superstructure
    Column: "column",
    Columns: "column",
    Beam: "beam",
    "Floor Beams": "beam",
    "Roof Beams": "roof_beam",
    "Roof Column": "roof_column",
    Slabs: "slab",
    "Upper Floor Slab": "slab",
    "Roof Slab": "roof_slab",
    "Upper Floor Void": "upper_floor_ddt_void",
    Wall: "wall",
    "Shear Wall": "shear_wall",
    "Lift Wall": "lift_wall",
    "Lift Shaft": "lift_shaft",
    Lintel: "lintels",
    Lintels: "lintels",
    Staircase: "staircase",
    "Staircase Landing": "staircase_landing",
    "Staircase Strings & Steps": "staircase_strings_steps",
    "Staircase Upper Floors": "staircase_upper_floors",
    // Roof / Finishing
    Roof: "roof_beam",
    "Roof Upstands / Parapet": "parapet_wall",
    "Parapet Wall": "parapet_wall",
    "Parapet Wall Coping": "parapet_wall_copping",
    "Kitchen Countertop": "kitchen_countertop",
    // Blockwork has no dedicated backend type yet — closest existing match is "wall".
    Blockwork: "wall",
    "Blockwork on Foundation": "wall",
    "External Blockwork": "wall",
    "Internal Blockwork": "wall",
  };
  return map[measureType] ?? measureType.toLowerCase().replace(/[\s/]+/g, "_");
}

// Maps the UI's distance-unit vocabulary (used throughout the app for display,
// e.g. "Meters") to the backend's calibration.unit enum ('mm'|'cm'|'m'|'ft'|'in'|'px').
function toBackendDistanceUnit(unit: string): string {
  const map: Record<string, string> = {
    Meters: "m",
    mm: "mm",
    cm: "cm",
    ft: "ft",
  };
  return map[unit] ?? unit.toLowerCase();
}

// Reverse of toBackendDistanceUnit — used when hydrating calibration.unit back
// from the backend so it matches the UI's own vocabulary (Select options, "Meters"
// string comparisons for m²/m³ labels, etc.).
function toUiDistanceUnit(unit: string): string {
  const map: Record<string, string> = {
    m: "Meters",
    mm: "mm",
    cm: "cm",
    ft: "ft",
  };
  return map[unit] ?? unit;
}

// Converts our internal VariantRebar → the backend's reinforcement array.
// barSize format: "Y16" → barType "Y", diameter 16. depth is stored in mm → convert to m.
function rebarToReinforcement(
  rebar: import("./workspaceSession").VariantRebar | null,
) {
  if (!rebar) return undefined;
  const rows = [...rebar.mainBars, ...rebar.additionBars];
  const result = rows
    .filter((b) => b.size && b.count)
    .map((b) => {
      const match = b.size.match(/^([A-Z])(\d+)$/);
      return {
        barMark: b.id,
        barCount: Number.parseInt(b.count, 10) || 0,
        barType: match?.[1] ?? "Y",
        diameter: parseInt(match?.[2] ?? "16", 10),
        length: Math.round((parseFloat(b.depth) / 1000) * 1000) / 1000, // mm → m
      };
    })
    .filter((r) => r.barCount > 0);
  return result.length > 0 ? result : undefined;
}

// Stable reference so useMemo below doesn't create a new empty Set every render.
const EMPTY_MARK_SET: ReadonlySet<string> = new Set();

function DrawingHydrator({
  fileId,
  folderId,
  onLoaded,
}: {
  fileId: string;
  folderId: string;
  onLoaded: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const existsInRedux = useAppSelector((s) =>
    s.manualWizard.drawings.some(
      (d) => d.id === fileId || d.uploadedFileId === fileId,
    ),
  );
  const { data: metaData } = useGetUploadQuery(fileId, { skip: existsInRedux });
  const { data: blobUrl } = useDownloadUploadQuery(fileId, {
    skip: existsInRedux,
  });
  const dispatched = useRef(false);

  useEffect(() => {
    if (dispatched.current || existsInRedux || !metaData?.data || !blobUrl)
      return;
    dispatched.current = true;

    const file = metaData.data;
    const ext = getExt(file.originalName);
    const category = EXT_CATEGORY[ext] ?? "pdf";

    dispatch(
      addDrawing({
        id: file._id,
        name: file.originalName,
        size: file.metadata?.bytes ?? 0,
        extension: ext,
        category,
        status: "complete",
        progress: 100,
        previewUrl: blobUrl,
        uploadedUrl: file.url,
        uploadedFileId: file._id,
        folderId,
      }),
    );
    onLoaded(file._id);
  }, [metaData, blobUrl, existsInRedux, dispatch, folderId, onLoaded]);

  return null;
}

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

  const [uploadFile] = useUploadFileMutation();
  const [updateProject] = useUpdateProjectMutation();

  // ── Measurement session ─────────────────────────────────────────────────────
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const openedSessionKeys = useRef<Map<string, string>>(new Map()); // `${uploadedFileId}-${page}` → sessionId
  const hydratedSessionIds = useRef<Set<string>>(new Set());

  const [createMeasurementSession] = useCreateMeasurementSessionMutation();
  // Only called now when an element is actually assigned — calibration is
  // otherwise applied locally, no backend round-trip while measuring.
  const [updateMeasurementCanvas] = useUpdateMeasurementCanvasMutation();
  const [updateSessionStatus] = useUpdateMeasurementSessionStatusMutation();
  const [upsertMeasurementElement] = useUpsertMeasurementElementMutation();
  const [deleteMeasurementElement] = useDeleteMeasurementElementMutation();
  const [deleteMeasurementSession] = useDeleteMeasurementSessionMutation();
  const [fetchProjectSessions] = useLazyListProjectMeasurementSessionsQuery();
  const [fetchSessionById] = useLazyGetMeasurementSessionQuery();

  // Populated when session create returns 409 (another live session exists for this project)
  const [sessionConflict, setSessionConflict] = useState<{
    liveSessionId: string;
    uploadedFileId?: string;
    pageNumber?: number;
  } | null>(null);

  const { data: activeSessionData } = useGetMeasurementSessionQuery(
    activeSessionId ?? "",
    {
      skip: !activeSessionId,
    },
  );

  const projectName =
    backendProject?.name ?? `Project ${projectId.slice(0, 8)}`;

  // Selects the first drawing that arrives from DrawingHydrator (API path)
  const firstDrawingSelected = useRef(false);
  const handleDrawingHydrated = useCallback((id: string) => {
    if (firstDrawingSelected.current) return;
    firstDrawingSelected.current = true;
    setSelectedDrawingId(id);
    setSelectedPage(1);
    setScale(1.0);
    setRotation(0);
  }, []);

  // ── Local UI state ──────────────────────────────────────────────────────────
  // UI preferences only — loaded from localStorage once on mount.
  // All measurement data (scale, elements, variants) comes from backend hydration.
  const [savedSession] = useState(() => loadSession(projectId));
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [pendingTool, setPendingTool] = useState<ToolId | null>(null);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [search, setSearch] = useState("");
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(
    () => drawings[0]?.id ?? null,
  );
  const [selectedPage, setSelectedPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<string[]>(() =>
    folders.map((f) => f.id),
  );

  // Count tool BBS flow — UI preferences, kept in localStorage
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
    () => savedSession.scaleWhat ?? "Piles",
  );
  const [countModeActive, setCountModeActive] = useState(false);
  const [showRebarTab, setShowRebarTab] = useState(
    () => savedSession.showRebarTab ?? false,
  );

  // Dual-mode categories (Stud Column / Columns) — which tool the user picked.
  const [columnMeasureChoice, setColumnMeasureChoice] = useState<
    "count" | "area" | null
  >(null);
  // Which tab of the Element Detail Panel is active — drives whether the canvas
  // tool is the category's own tool (concrete) or forced to "length" (rebar).
  const [elementPanelTab, setElementPanelTab] = useState<"concrete" | "rebar">(
    "concrete",
  );
  // Length drawn on canvas while the Rebar tab is active, passed down to auto-fill bar depths.
  const [rebarDrawnLength, setRebarDrawnLength] = useState<number | null>(null);
  // Blockwork-only: External/Internal are independent elements, not tab views of
  // the same one. Defaults to External whenever a Blockwork round starts fresh.
  const [blockworkSide, setBlockworkSide] = useState<"external" | "internal">(
    "external",
  );

  // ── Backend-owned state — start empty, populated by Phase 2 hydration ────────
  const [scaleFlowActive, setScaleFlowActive] = useState(false);
  const [knownDistance, setKnownDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("Meters");
  const [scaleLocked, setScaleLocked] = useState(false);
  const [scaleInfo, setScaleInfo] = useState<string | null>(null);
  const [globalScaleFactor, setGlobalScaleFactor] = useState<number | null>(
    null,
  );
  const [showScaleNotification, setShowScaleNotification] = useState(false);
  const scaleNotifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether the calibration/scale bar at the bottom is visible — auto-hides a
  // couple seconds after locking, brought back via the "Edit Calibration" button.
  const [showCalibrationBar, setShowCalibrationBar] = useState(true);
  const calibrationBarHideTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [showElementPanel, setShowElementPanel] = useState(false);
  const [concreteMeasurements, setConcreteMeasurements] = useState<
    WsConcreteMeasurement[]
  >([]);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  // currentVariantId stays stable for one measurement round. It is the clientId
  // used when upserting to the backend, making repeated auto-saves idempotent.
  // Cycling it (on "Apply & Continue") starts a fresh measurement round.
  const currentVariantId = useRef<string>(crypto.randomUUID());
  const lastFormPayload = useRef<SaveMeasurementPayload | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMarkCount = useRef(0);
  // IDs of canvas marks drawn while the Rebar tab was active — excluded from the
  // concrete variant's own geometry (see handleMeasurementAdd / handleAutoSave).
  const rebarMarkIds = useRef<Set<string>>(new Set());

  // Assign element flow
  const [assigningElementId, setAssigningElementId] = useState<string | null>(
    null,
  );
  const [assigningElement, setAssigningElement] =
    useState<CreatedElement | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [assignCompleteOpen, setAssignCompleteOpen] = useState(false);
  const [createNewElOpen, setCreateNewElOpen] = useState(false);
  const [assignCompleteData, setAssignCompleteData] = useState<{
    elementName: string;
    addedCount: number;
    addedUnit: string;
    newTotal: number;
    elementId: string;
  } | null>(null);

  // Finalize session for View BOQ
  const [finalizeSession, { isLoading: finalizing }] =
    useFinalizeMeasurementSessionMutation();
  const router = useRouter();

  // Sidebar: DRAWINGS collapsible drawer + ELEMENTS panel
  const [drawingsOpen, setDrawingsOpen] = useState(
    () => (savedSession.drawings ?? []).length > 0,
  );
  const [elementSearch, setElementSearch] = useState("");

  // Left workspace sidebar — collapsed by default so the drawing gets full width;
  // expands to the full Tools/Element/Drawings column when the header icon is clicked.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => savedSession.sidebarCollapsed ?? false,
  );

  // ── Floating Element Detail Panel — draggable + collapsible, position persists ──
  const [elementPanelPos, setElementPanelPos] = useState<{
    x: number;
    y: number;
  } | null>(() => savedSession.elementPanelPos ?? null);
  const [elementPanelCollapsed, setElementPanelCollapsed] = useState(
    () => savedSession.elementPanelCollapsed ?? false,
  );
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  // Mirrors DrawingCanvas's internal pan-drag state so the measurement overlay
  // (rendered here, on top of it) can also show a "grabbing" cursor while
  // panning — otherwise the active tool's crosshair cursor never changes,
  // even mid-drag, since the overlay owns cursor styling over its own area.
  const [isPanningDrawing, setIsPanningDrawing] = useState(false);
  const elementPanelRef = useRef<HTMLDivElement>(null);
  const panelDragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    width: number;
    height: number;
    moved: boolean;
  } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  // Elements — populated by Phase 2 hydration from backend, never from localStorage
  const [elements, setElements] = useState<CreatedElement[]>([]);
  // True while loadProjectElements' backend round-trip is in flight — lets the
  // sidebar distinguish "still fetching" from "genuinely no elements yet".
  const [elementsLoading, setElementsLoading] = useState(true);
  const [deleteElementTarget, setDeleteElementTarget] =
    useState<CreatedElement | null>(null);
  const [deletingElementId, setDeletingElementId] = useState<string | null>(
    null,
  );

  // ── Calibration points (received from canvas during calibration) ─────────────
  const [calibPtCount, setCalibPtCount] = useState<0 | 1 | 2>(0);
  const [calibBasePxDist, setCalibBasePxDist] = useState<number | null>(null);
  const [calibPts, setCalibPts] = useState<[MPoint, MPoint] | null>(null);
  // Snapshot taken at Apply Scale time — carried on every variant saved while
  // this page's scale is active, since nothing pushes it to the backend
  // until the variant's element is actually assigned.
  const [appliedCalibration, setAppliedCalibration] =
    useState<VariantCalibration | null>(null);

  // Live in-progress length from the canvas (A→cursor, null when not drawing)
  const [liveDrawingLength, setLiveDrawingLength] = useState<number | null>(
    null,
  );

  // ── Round totals — derived from actual canvas marks, never a drifting counter ──
  // Left sidebar  = per-page totals (lengthTotal / countTotal / areaTotal below)
  // Right panel   = current-round totals: marks not yet "claimed" by a finished
  // round (Apply & Continue, +New Element, Blockwork side switch, hydration).
  // Deriving straight from measurementHook.state.measurements means undo/redo can
  // never desync it, unlike an incrementing counter that only ever counted up.
  const [claimedMarkIds, setClaimedMarkIds] = useState<Set<string>>(new Set());

  // ── Per-page measurement state (persisted to localStorage) ───────────────────
  const measurementHook = useCanvasMeasurements(
    selectedDrawingId,
    selectedPage,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── First-run onboarding — anchors for the guided tour coachmarks ────────────
  const toolsSectionRef = useRef<HTMLDivElement>(null);
  const newElementBtnRef = useRef<HTMLButtonElement>(null);
  const zoomControlsRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (backendProject && !hasSeenWorkspaceOnboarding()) {
      // Force the sidebar open so the coachmark targets are actually visible —
      // overrides a stale collapsed preference from before this tour existed.
      setSidebarCollapsed(false);
      setShowOnboarding(true);
    }
  }, [backendProject]);

  const selectedDrawing =
    drawings.find((d) => d.id === selectedDrawingId) ?? null;

  // Current-round totals: sum of marks that aren't yet claimed by a finished
  // round and aren't rebar-tab reference lengths. Recomputed from the actual
  // mark list on every render, so undo/redo can never leave it stale.
  const sessionTotals = useMemo(() => {
    let count = 0,
      length = 0,
      area = 0;
    for (const m of measurementHook.state.measurements) {
      if (claimedMarkIds.has(m.id) || rebarMarkIds.current.has(m.id)) continue;
      if (m.type === "count") count++;
      else if (m.type === "length") length += m.realLength;
      else if (m.type === "area") area += m.realArea;
    }
    return { count, length, area };
  }, [measurementHook.state.measurements, claimedMarkIds]);

  // Marks the marks currently on canvas as "belonging to a finished round" so
  // the next round's live totals start fresh at zero without touching the
  // drawing itself — used by Apply & Continue, +New Element, and Blockwork
  // side switching.
  function claimCurrentMarks() {
    setClaimedMarkIds((prev) => {
      const next = new Set(prev);
      for (const m of measurementHook.state.measurements) next.add(m.id);
      return next;
    });
  }

  // ── Click a Live Measurements row to bring its value + geometry back up ──────
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    const allVariants = [
      ...elements.flatMap((el) => el.variants),
      ...concreteMeasurements,
    ];
    return allVariants.find((v) => v.id === selectedVariantId) ?? null;
  }, [selectedVariantId, elements, concreteMeasurements]);

  const highlightedMarkIds = useMemo(() => {
    return selectedVariant
      ? new Set(selectedVariant.canvas.measurementIds)
      : EMPTY_MARK_SET;
  }, [selectedVariant]);

  function handleSelectVariant(variant: WsConcreteMeasurement) {
    setSelectedVariantId((prev) => (prev === variant.id ? null : variant.id));
  }

  // Erases the actual drawn marks (points/lines/polygons) a variant is made of,
  // not just its table row. Resolves the variant's own drawing/page — which may
  // not be the one currently on screen — and either updates the live canvas
  // hook (active page) or patches that other page's localStorage entry directly.
  function removeMarksForVariant(variant: WsConcreteMeasurement) {
    const ids = variant.canvas.measurementIds;
    if (ids.length === 0) return;
    const drawing = drawings.find(
      (d) =>
        d.uploadedFileId === variant.drawingId || d.id === variant.drawingId,
    );
    const localDrawingId = drawing?.id ?? variant.drawingId;
    if (!localDrawingId) return;
    const isActivePage =
      localDrawingId === selectedDrawingId &&
      variant.pageNumber === selectedPage;
    if (isActivePage) {
      measurementHook.removeMeasurements(ids);
    } else {
      removeMeasurementsFromStorage(localDrawingId, variant.pageNumber, ids);
    }
  }

  // Live Measurements row delete — local storage only, matches the same
  // localStorage-first model the rest of the measurement data now uses.
  // Handles both pending (not yet assigned) and already-assigned variants.
  function handleDeleteVariant(variant: WsConcreteMeasurement) {
    setSelectedVariantId((prev) => (prev === variant.id ? null : prev));
    removeMarksForVariant(variant);

    setConcreteMeasurements((prev) => {
      if (!prev.some((v) => v.id === variant.id)) return prev;
      const next = prev.filter((v) => v.id !== variant.id);
      saveSession(projectId, { concreteMeasurements: next });
      return next;
    });

    setElements((prev) => {
      let changed = false;
      const next = prev.map((el) => {
        if (!el.variants.some((v) => v.id === variant.id)) return el;
        changed = true;
        return {
          ...el,
          variants: el.variants.filter((v) => v.id !== variant.id),
        };
      });
      if (!changed) return prev;
      saveSession(projectId, { createdElements: next });
      return next;
    });
  }

  // Clears every row from the Live Measurements table — pending variants and
  // every assigned element's variants — local storage only, per element record
  // metadata (name/category) is kept, only the measurement data is wiped.
  function handleClearAllVariants() {
    const allVariants = [
      ...concreteMeasurements,
      ...elements.flatMap((el) => el.variants),
    ];
    if (allVariants.length === 0) return;
    if (
      !window.confirm(
        "Clear all measurements from this table? This can't be undone.",
      )
    ) {
      return;
    }

    for (const variant of allVariants) removeMarksForVariant(variant);

    setSelectedVariantId(null);
    setConcreteMeasurements([]);
    saveSession(projectId, { concreteMeasurements: [] });

    setElements((prev) => {
      const next = prev.map((el) => ({ ...el, variants: [] }));
      saveSession(projectId, { createdElements: next });
      return next;
    });
  }

  // ── On mount: wipe stale backend-owned keys from localStorage AND live state ──
  // Scale, elements, and variants are now sourced from the backend session.
  // This runs once per projectId so stale data from before the migration — or from
  // a previously-viewed project, if this component instance gets reused across a
  // client-side navigation between two different projects' workspaces — is gone.
  // Phase 2 hydration (below) re-populates these from the backend afterward if the
  // new project's session actually has a locked scale.
  useEffect(() => {
    saveSession(projectId, {
      createdElements: [],
      // concreteMeasurements is intentionally NOT cleared here — the global element
      // loader reads it from the backend, and localStorage acts as a fallback for
      // pending variants that haven't been assigned yet. Clearing it on mount
      // would destroy that fallback before it can be used.
      scaleFactor: null,
      scaleLocked: false,
      scaleFlowActive: false,
      scaleInfo: null,
      knownDistance: "",
      elementAssignments: [],
    });

    hydratedSessionIds.current = new Set();
    openedSessionKeys.current = new Map();
    projectElementsLoaded.current = false;

    setScaleFlowActive(false);
    setShowElementPanel(false);
    setShowCalibrationBar(true);
    setScaleLocked(false);
    setGlobalScaleFactor(null);
    setAppliedCalibration(null);
    setScaleInfo(null);
    setKnownDistance("");
    setActiveTool(null);
    setElements([]);
    setElementsLoading(true);
    setConcreteMeasurements([]);
    setClaimedMarkIds(new Set());
    rebarMarkIds.current = new Set();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── Phase 1: Open/resume a measurement session whenever the drawing+page changes ──
  // The backend allows only one active session per project. Before switching to a new
  // page we pause the current session; on return to a cached page we resume it.
  // This prevents the 409 conflict that previously fired on every page navigation.
  useEffect(() => {
    const uploadedFileId = selectedDrawing?.uploadedFileId;
    if (!uploadedFileId) return;

    const sessionKey = `${uploadedFileId}-${selectedPage}`;
    let cancelled = false;

    async function switchSession() {
      if (!uploadedFileId) return; // satisfies TS narrowing inside async scope

      // Pause the session we are leaving so the backend frees the "active" slot.
      if (activeSessionId) {
        await updateSessionStatus({
          sessionId: activeSessionId,
          body: { status: "paused" },
        });
      }

      if (cancelled) return;

      const cached = openedSessionKeys.current.get(sessionKey);

      if (cached) {
        // Already visited this page — just resume the existing session.
        await updateSessionStatus({
          sessionId: cached,
          body: { status: "active" },
        });
        if (!cancelled) setActiveSessionId(cached);
        return;
      }

      // First visit to this page — create a fresh session.
      const result = await createMeasurementSession({
        projectId,
        body: {
          uploadedFileId,
          pageNumber: selectedPage,
          canvas: { width: 1920, height: 1080 },
        },
      });

      if (cancelled) return;

      if ("data" in result && result.data?.data?._id) {
        const sid = result.data.data._id;
        openedSessionKeys.current.set(sessionKey, sid);
        setActiveSessionId(sid);
        return;
      }

      // 409 still possible if an active session exists from another device / tab.
      // List sessions to surface the conflict dialog so the user can resolve it.
      if (
        "error" in result &&
        (result.error as { status?: number })?.status === 409
      ) {
        const sessionsResult = await fetchProjectSessions(projectId);
        if (cancelled) return;
        const list = "data" in sessionsResult ? sessionsResult.data?.data : [];
        const live = list?.find((s) => s.status === "active");
        if (!live) return;

        const sessionResult = await fetchSessionById(live._id);
        if (cancelled) return;
        const fullSession =
          "data" in sessionResult ? sessionResult.data?.data?.session : null;

        setSessionConflict({
          liveSessionId: live._id,
          uploadedFileId: fullSession?.uploadedFileId,
          pageNumber: fullSession?.pageNumber ?? live.pageNumber,
        });
      }
    }

    switchSession();
    return () => {
      cancelled = true;
    };
    // activeSessionId intentionally excluded — including it would cause the effect
    // to re-run every time a session is set, creating an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDrawing?.uploadedFileId, selectedPage, projectId]);

  // ── Phase 2: Re-hydrate canvas calibration from the active session ───────────
  // Restores scale factor and canvas marks for the current page only.
  // Element aggregation across all pages is handled by the global loader below.
  useEffect(() => {
    if (!activeSessionData?.data || !activeSessionId) return;
    if (hydratedSessionIds.current.has(activeSessionId)) return;
    hydratedSessionIds.current.add(activeSessionId);

    const { session, elements } = activeSessionData.data;
    const backendScale = session.canvas.scale;
    const backendUnit = session.canvas.unit
      ? toUiDistanceUnit(session.canvas.unit)
      : distanceUnit;
    const calibration = session.canvas.calibration;

    // A truthy `scale` alone isn't proof the user ever calibrated this session —
    // the backend may default it to a non-null placeholder for brand-new sessions.
    // Only treat it as genuinely calibrated when the calibration inputs that Apply
    // Scale actually sends (knownDistance + pixelDistance) are both present too.
    const isGenuinelyCalibrated =
      !!backendScale &&
      !!calibration?.knownDistance &&
      !!calibration?.pixelDistance;

    if (isGenuinelyCalibrated) {
      setGlobalScaleFactor(backendScale);
      setScaleLocked(true);
      setScaleFlowActive(true);
      setShowElementPanel(true);
      setScaleInfo(
        `Scale: 1 px = ${(1 / backendScale).toFixed(3)} ${backendUnit}`,
      );
    }

    if (calibration?.knownDistance)
      setKnownDistance(String(calibration.knownDistance));
    if (calibration?.unit) setDistanceUnit(toUiDistanceUnit(calibration.unit));

    let countIdx = 1;
    const measurements: Measurement[] = [];
    for (const el of elements) {
      const newMarks = backendElementToMeasurement(el, countIdx);
      for (const m of newMarks) {
        measurements.push(m);
        if (m.type === "count") countIdx++;
      }
    }

    // Marks now live in localStorage (useCanvasMeasurements already loaded this
    // page's marks from its own storage before this effect ever runs) — drawing
    // no longer pushes to the backend, so `measurements` here is only whatever
    // was already finalized into a real element. Never blindly resetWithData:
    // that would wipe out local-only, not-yet-finalized marks. Merge instead —
    // add only backend marks the local state doesn't already have.
    if (measurements.length > 0) {
      const existingIds = new Set(
        measurementHook.state.measurements.map((m) => m.id),
      );
      const newFromBackend = measurements.filter((m) => !existingIds.has(m.id));
      if (newFromBackend.length > 0) {
        measurementHook.resetWithData({
          scaleFactor: isGenuinelyCalibrated ? backendScale : null,
          calibPts: null,
          measurements: [
            ...measurementHook.state.measurements,
            ...newFromBackend,
          ],
        });
      }
      // These marks belong to already-saved elements from a prior round —
      // exclude them from the next fresh round's live totals.
      setClaimedMarkIds((prev) => {
        const next = new Set(prev);
        for (const m of measurements) next.add(m.id);
        return next;
      });
    }
  }, [
    activeSessionData,
    activeSessionId,
    distanceUnit,
    measurementHook.resetWithData,
  ]);

  // ── Restore this page's calibration from localStorage ────────────────────────
  // Calibration is frontend-only now (see handleApplyScale) — the backend never
  // learns about it until an element is assigned, so it can't be the thing that
  // restores scale on reload for a page that hasn't had anything assigned yet.
  // measurementHook.state.scaleFactor is already loaded from ITS OWN page-scoped
  // storage by the time this runs; pair it with the calibration metadata
  // (knownDistance/unit) saved alongside it to fully restore the UI state.
  useEffect(() => {
    if (globalScaleFactor !== null) return; // already restored, e.g. via backend hydration
    const uploadedFileId = selectedDrawing?.uploadedFileId;
    if (!uploadedFileId) return;
    const localScaleFactor = measurementHook.state.scaleFactor;
    if (!localScaleFactor) return;
    const saved = loadPageCalibration(uploadedFileId, selectedPage);
    if (!saved) return;

    setGlobalScaleFactor(localScaleFactor);
    setKnownDistance(saved.knownDistance);
    setDistanceUnit(saved.distanceUnit);
    setScaleInfo(saved.scaleInfo);
    setScaleLocked(saved.scaleLocked);
    setScaleFlowActive(true);
    setShowElementPanel(true);
    setAppliedCalibration({
      knownDistance: parseFloat(saved.knownDistance) || 0,
      pixelDistance: measurementHook.state.calibPts
        ? Math.hypot(
            measurementHook.state.calibPts[1].x -
              measurementHook.state.calibPts[0].x,
            measurementHook.state.calibPts[1].y -
              measurementHook.state.calibPts[0].y,
          )
        : 0,
      unit: toBackendDistanceUnit(saved.distanceUnit),
    });
  }, [
    selectedDrawing?.uploadedFileId,
    selectedPage,
    measurementHook.state.scaleFactor,
    measurementHook.state.calibPts,
    globalScaleFactor,
  ]);

  // ── Global element loader: merge assigned elements from ALL project sessions ──
  // Fetches every session in parallel and aggregates their assigned elements so
  // the Elements tab shows all work regardless of which page is currently active.
  // Exposed as a stable callback (not just an effect body) so anything that
  // mutates elements server-side — e.g. deleting one — can re-invoke it to
  // resync the sidebar list with the backend instead of trusting local state.
  const loadProjectElements = useCallback(async () => {
    setElementsLoading(true);
    try {
    const sessionsResult = await fetchProjectSessions(projectId);
    if (!("data" in sessionsResult) || !sessionsResult.data?.data?.length)
      return;

    const sessionIds = sessionsResult.data.data.map((s) => s._id);
    const sessionResults = await Promise.all(
      sessionIds.map((id) => fetchSessionById(id)),
    );

    const assignedElementMap = new Map<
      string,
      { meta: CreatedElement; variantMap: Map<string, WsConcreteMeasurement> }
    >();
    const pendingVariantsMap = new Map<string, WsConcreteMeasurement>();

    for (const result of sessionResults) {
      if (!("data" in result) || !result.data?.data) continue;
      const { elements, session: sessionData } = result.data.data;
      const sid = sessionData._id;

      for (const el of elements) {
        const attrs = el.attributes ?? {};
        const snapshotStr = attrs._snapshot as string | undefined;
        if (!snapshotStr) continue;

        let parsedVariant: WsConcreteMeasurement | null = null;
        try {
          parsedVariant = JSON.parse(snapshotStr) as WsConcreteMeasurement;
        } catch {
          continue;
        }

        if (attrs.pending === true) {
          if (!pendingVariantsMap.has(parsedVariant.id)) {
            pendingVariantsMap.set(parsedVariant.id, parsedVariant);
          }
        } else {
          const eid = attrs.elementId as string | undefined;
          const elementName = attrs.elementName as string | undefined;
          if (!eid || !elementName) continue;

          if (!assignedElementMap.has(eid)) {
            assignedElementMap.set(eid, {
              meta: {
                id: eid,
                name: elementName,
                category: (attrs.elementCategory as string) ?? "Substructure",
                categoryFolder: (attrs.categoryFolder as string) ?? elementName,
                measurementUnit: (attrs.measurementUnit as string) ?? "items",
                variants: [],
                sessionId: sid,
                drawingId: parsedVariant.drawingId,
                pageNumber: parsedVariant.pageNumber,
                createdAt: parsedVariant.savedAt,
              },
              variantMap: new Map(),
            });
          }

          const entry = assignedElementMap.get(eid)!;
          if (!entry.variantMap.has(parsedVariant.id)) {
            entry.variantMap.set(parsedVariant.id, parsedVariant);
          }
        }
      }
    }

    const reconstructedElements: CreatedElement[] = Array.from(
      assignedElementMap.values(),
    ).map(({ meta, variantMap }) => ({
      ...meta,
      variants: Array.from(variantMap.values()),
    }));

    const reconstructedPending = Array.from(pendingVariantsMap.values());

    setElements(reconstructedElements);
    if (reconstructedPending.length > 0) {
      setConcreteMeasurements(reconstructedPending);
    } else {
      // Backend has no pending variants — fall back to localStorage for measurements
      // saved in this session that weren't yet assigned to an element (e.g. after a
      // hard refresh before assignment was completed).
      const localPending = loadSession(projectId).concreteMeasurements;
      if (localPending && localPending.length > 0) {
        setConcreteMeasurements(localPending);
      }
    }
    } finally {
      setElementsLoading(false);
    }
    // fetchProjectSessions and fetchSessionById are stable references from RTK Query lazy hooks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Runs once after the project document loads.
  const projectElementsLoaded = useRef(false);
  useEffect(() => {
    if (projectElementsLoaded.current) return;
    if (!backendProject?._id) return;
    projectElementsLoaded.current = true;
    loadProjectElements();
  }, [backendProject?._id, loadProjectElements]);

  // ── Auto-save: upsert the current variant to the backend ─────────────────────
  // Called both by canvas-mark completions and by form field changes (debounced).
  // Uses currentVariantId as a stable clientId so repeated calls are idempotent.
  function handleAutoSave(formPayload?: SaveMeasurementPayload) {
    if (!activeSessionId || !scaleFlowActive) return;

    const payload = formPayload ?? lastFormPayload.current;
    if (formPayload) lastFormPayload.current = formPayload;

    // Rebar-tab marks are reference lengths for bar depth, not part of the
    // element's own concrete geometry — exclude them from this variant's canvas.
    const measurementIds = measurementHook.state.measurements
      .map((m) => m.id)
      .filter((id) => !rebarMarkIds.current.has(id));
    const variant: WsConcreteMeasurement = {
      id: currentVariantId.current,
      measureType: effectiveMeasureType,
      tag: payload?.tag ?? "",
      concreteFields: payload?.concreteFields ?? {},
      rebar: payload?.rebar ?? null,
      canvas: {
        tool: concreteToolForCategory,
        count: sessionTotals.count,
        length: effectiveConcreteLength,
        area: sessionTotals.area,
        unit: distanceUnit,
        measurementIds,
      },
      calibration: appliedCalibration,
      sessionId: activeSessionId,
      drawingId: selectedDrawing?.uploadedFileId ?? null,
      pageNumber: selectedPage,
      savedAt: Date.now(),
    };

    setConcreteMeasurements((prev) => {
      const idx = prev.findIndex((v) => v.id === currentVariantId.current);
      const next =
        idx >= 0
          ? prev.map((v, i) => (i === idx ? variant : v))
          : [...prev, variant];
      saveSession(projectId, { concreteMeasurements: next });
      return next;
    });

    setAutoSaveStatus("saving");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveStatus("saved");
      autoSaveTimerRef.current = setTimeout(
        () => setAutoSaveStatus("idle"),
        3000,
      );
    }, 400);
  }

  // Keep a stable ref so the canvas mark effect never captures a stale closure.
  const handleAutoSaveRef = useRef(handleAutoSave);
  useEffect(() => {
    handleAutoSaveRef.current = handleAutoSave;
  });

  // Trigger auto-save whenever a new canvas mark is added.
  useEffect(() => {
    const count = measurementHook.state.measurements.length;
    if (count > prevMarkCount.current && scaleFlowActive) {
      handleAutoSaveRef.current();
    }
    prevMarkCount.current = count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementHook.state.measurements.length]);

  // ── Keyboard shortcuts: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z or Ctrl+Y = redo ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        measurementHook.undo();
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        measurementHook.redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [measurementHook.undo, measurementHook.redo]);

  // Concrete-tab length total, gated so an in-progress rebar-tab drag never leaks
  // in, with the Lintel +300mm bearing allowance applied once anything is measured.
  const effectiveConcreteLength = useMemo(() => {
    const raw =
      sessionTotals.length +
      (elementPanelTab === "concrete" ? (liveDrawingLength ?? 0) : 0);
    return scaleWhat === "Lintel" && raw > 0
      ? raw + LINTEL_LENGTH_BONUS_M
      : raw;
  }, [sessionTotals.length, liveDrawingLength, scaleWhat, elementPanelTab]);

  // ── Category → tool mapping ───────────────────────────────────────────────────
  // The active category (scaleWhat) decides which canvas tool is used for the
  // concrete measurement. "choice" categories (Stud Column / Columns) resolve via
  // columnMeasureChoice, set by the ScaleSetupModal sub-selector.
  const concreteToolForCategory: "count" | "length" | "area" = useMemo(() => {
    const cfg = ELEMENT_CONFIGS[scaleWhat] ?? ELEMENT_CONFIGS["Piles"];
    if (cfg.tool === "choice") return columnMeasureChoice ?? "count";
    return cfg.tool;
  }, [scaleWhat, columnMeasureChoice]);

  const isBlockworkCategory =
    ELEMENT_CONFIGS[scaleWhat]?.blockworkSides === true;

  // External/Internal Blockwork are independent elements — this is the name
  // actually used for measureType, backend type mapping, and category folder,
  // wherever scaleWhat would normally be used for those purposes.
  const effectiveMeasureType = isBlockworkCategory
    ? blockworkSide === "external"
      ? "External Blockwork"
      : "Internal Blockwork"
    : scaleWhat;

  // While the Rebar tab is active, the canvas always draws lengths (rebar runs),
  // regardless of what tool the concrete measurement uses. Switching back to the
  // Concrete tab restores the category's own tool.
  useEffect(() => {
    if (!scaleFlowActive) return;
    if (elementPanelTab === "rebar") {
      setActiveTool("length");
      setCountModeActive(false);
    } else {
      setActiveTool(concreteToolForCategory);
      setCountModeActive(concreteToolForCategory === "count");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementPanelTab, concreteToolForCategory, scaleFlowActive]);

  function handleElementPanelTabChange(tab: "concrete" | "rebar") {
    setElementPanelTab(tab);
    if (tab === "concrete") setRebarDrawnLength(null);
  }

  // External/Internal Blockwork are independent elements — switching starts a
  // fresh round (live length back to zero, new variant) without touching
  // whatever's already drawn on the sheet.
  function handleBlockworkSideChange(side: "external" | "internal") {
    if (side === blockworkSide) return;
    setBlockworkSide(side);
    claimCurrentMarks();
    currentVariantId.current = crypto.randomUUID();
    lastFormPayload.current = null;
  }

  function handleAddNewElement() {
    // Start a fresh measurement round so this doesn't overwrite whatever variant
    // was previously being drawn.
    currentVariantId.current = crypto.randomUUID();
    lastFormPayload.current = null;
    setColumnMeasureChoice(null);
    setElementPanelTab("concrete");
    setRebarDrawnLength(null);
    setBlockworkSide("external");
    claimCurrentMarks();
    setLiveDrawingLength(null);
    setPendingTool(null);
    setShowScaleSetup(true);
  }

  // ── Floating Element Detail Panel: drag + collapse ────────────────────────────

  function handlePanelDragStart(e: React.PointerEvent<HTMLElement>) {
    const container = canvasAreaRef.current;
    const panelEl = elementPanelRef.current;
    if (!container || !panelEl) return;
    const containerRect = container.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();
    panelDragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: elementPanelPos?.x ?? panelRect.left - containerRect.left,
      origY: elementPanelPos?.y ?? panelRect.top - containerRect.top,
      width: panelRect.width,
      height: panelRect.height,
      moved: false,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePanelDragMove(e: React.PointerEvent<HTMLElement>) {
    const ds = panelDragState.current;
    const container = canvasAreaRef.current;
    if (!ds || !container) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) ds.moved = true;
    if (!ds.moved) return;
    const rect = container.getBoundingClientRect();
    const nextX = Math.min(
      Math.max(ds.origX + dx, 0),
      Math.max(rect.width - ds.width, 0),
    );
    const nextY = Math.min(
      Math.max(ds.origY + dy, 0),
      Math.max(rect.height - ds.height, 0),
    );
    setElementPanelPos({ x: nextX, y: nextY });
  }

  function handlePanelDragEnd() {
    const ds = panelDragState.current;
    panelDragState.current = null;
    if (!ds?.moved) return;
    setElementPanelPos((pos) => {
      if (pos) saveSession(projectId, { elementPanelPos: pos });
      return pos;
    });
  }

  function handlePanelToggleCollapsed() {
    // Ignore the click that follows a real drag (pointerup fires a click too).
    if (panelDragState.current?.moved) return;
    setElementPanelCollapsed((prev) => {
      const next = !prev;
      saveSession(projectId, { elementPanelCollapsed: next });
      return next;
    });
  }

  function handleDeselectTool() {
    setActiveTool(null);
    setCountModeActive(false);
    setPendingTool(null);
  }

  // ── Tool click ───────────────────────────────────────────────────────────────

  function handleToolClick(id: ToolId) {
    if (id === "undo") {
      measurementHook.undo();
      return;
    }
    if (id === "redo") {
      measurementHook.redo();
      return;
    }
    // Text is a plain annotation tool, not a measurable BOQ category — it never
    // goes through the BBS/Scale modal chain (that's only for "+ New Element").
    if (id === "text") {
      setActiveTool((prev) => (prev === "text" ? null : "text"));
      return;
    }
    // Scale already configured — activate tool directly, skip BBS/Scale modal chain.
    // This lets the user navigate to another page for additional rebar/concrete
    // measurements without being re-prompted for BBS or scale every time.
    if (scaleFlowActive) {
      setActiveTool(id);
      setCountModeActive(id === "count");
      setPendingTool(null);
      return;
    }
    setPendingTool(id);
    setBbsModalStep("question");
  }

  function handleScaleSetupMeasureChange(value: string) {
    setScaleWhat(value);
    setColumnMeasureChoice(null);
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
    activateScaleFlow();
  }
  function handleBBSContinue() {
    if (bbsAnswer === "yes") {
      setShowRebarTab(false);
      setBbsModalStep("entry");
    } else {
      setShowRebarTab(true);
      saveSession(projectId, { bbsAnswer, showRebarTab: true });
      setBbsModalStep(null);
      activateScaleFlow();
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
    activateScaleFlow();
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

  // "Yes, I want to Scale" — category is chosen, next step is the BBS question.
  // Scale flow itself only activates once BBS is answered (see activateScaleFlow).
  // Blockwork has no rebar involved at all, so it skips BBS entirely.
  function handleScaleSetupProceed() {
    setShowScaleSetup(false);
    if (isBlockworkCategory) {
      setShowRebarTab(false);
      activateScaleFlow();
      return;
    }
    setBbsModalStep("question");
  }
  function handleScaleSetupCancel() {
    setShowScaleSetup(false);
    setPendingTool(null);
  }

  // ── Enter the workspace — last step of "+ New Element" (after BBS) ───────────
  // Activates the tool derived from the chosen category. Canvas drawing is still
  // blocked: clicks are either calibration-mode (red reference dots) or fully
  // gated by the scaleFactor=null guard until Apply Scale is clicked.
  function activateScaleFlow() {
    setScaleFlowActive(true);
    setShowElementPanel(true);
    setShowCalibrationBar(true);
    setPendingTool(null);
    setBlockworkSide("external");

    setActiveTool(concreteToolForCategory);
    setCountModeActive(concreteToolForCategory === "count");

    if (scaleLocked && globalScaleFactor !== null) {
      // Scale already applied and locked — jump straight to measuring, no re-calibration
      saveSession(projectId, {
        scaleWhat,
        scaleFlowActive: true,
        scaleLocked: true,
      });
    } else {
      // Scale not yet applied — show calibration bar, canvas accepts 2 reference clicks
      setCalibPtCount(0);
      setCalibBasePxDist(null);
      setCalibPts(null);
      saveSession(projectId, { scaleWhat, scaleFlowActive: true });
    }
  }

  // ── Calibration ──────────────────────────────────────────────────────────────

  // Scale only takes effect locally once the backend confirms it — this is what
  // actually gates drawing (via isCalibrating in MeasurementCanvas), so a failed
  // save must never leave the app acting as if scale was applied.
  // Applied entirely on the frontend — no backend call here. The calibration
  // snapshot is instead carried on every variant saved while it's active, and
  // only reaches the backend when that variant's element is actually assigned
  // (see persistVariantsToBackend).
  function handleApplyScale() {
    if (!knownDistance) {
      toast.warning("Enter a known distance first");
      return;
    }
    if (!calibBasePxDist || !calibPts) {
      toast.warning(
        "Click two points on the drawing to define the reference distance",
      );
      return;
    }
    const realDist = parseFloat(knownDistance);
    if (isNaN(realDist) || realDist <= 0) {
      toast.warning("Enter a valid distance greater than 0");
      return;
    }

    // scaleFactor = base pixels per real unit
    const sf = calibBasePxDist / realDist;

    // TEMP diagnostic — remove once the pixel-to-real-unit bug is found.
    console.log("[CALIBRATION]", {
      pdfZoom: scale,
      calibBasePxDist,
      knownDistanceEntered: realDist,
      unit: distanceUnit,
      scaleFactor_pxPerUnit: sf,
    });

    setGlobalScaleFactor(sf);
    measurementHook.setCalibration(calibPts, sf);
    setAppliedCalibration({
      knownDistance: realDist,
      pixelDistance: calibBasePxDist,
      unit: toBackendDistanceUnit(distanceUnit),
    });

    const approxRatio = Math.round(calibBasePxDist / realDist);
    const newScaleInfo = `Scale: 1:${approxRatio} | ${sf.toFixed(1)} px/${distanceUnit}`;
    setScaleInfo(newScaleInfo);
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
      scaleLocked: false,
      scaleFactor: sf,
    });
    if (selectedDrawing?.uploadedFileId) {
      savePageCalibration(selectedDrawing.uploadedFileId, selectedPage, {
        knownDistance,
        distanceUnit,
        scaleInfo: newScaleInfo,
        scaleLocked: false,
      });
    }
  }

  function handleShowCalibrationBar() {
    if (calibrationBarHideTimerRef.current) {
      clearTimeout(calibrationBarHideTimerRef.current);
      calibrationBarHideTimerRef.current = null;
    }
    setShowCalibrationBar(true);
  }

  // Keeps this page's calibration restorable after a reload — calibration is
  // frontend/localStorage-only now, so Lock Scale toggling needs to update the
  // page-scoped record the same way handleApplyScale does when it's first set.
  function handleToggleScaleLock(locked: boolean) {
    setScaleLocked(locked);
    saveSession(projectId, { scaleLocked: locked });
    const uploadedFileId = selectedDrawing?.uploadedFileId;
    if (uploadedFileId && scaleInfo) {
      savePageCalibration(uploadedFileId, selectedPage, {
        knownDistance,
        distanceUnit,
        scaleInfo,
        scaleLocked: locked,
      });
    }
  }

  function handleResetScale() {
    if (scaleNotifTimerRef.current) clearTimeout(scaleNotifTimerRef.current);
    if (calibrationBarHideTimerRef.current) {
      clearTimeout(calibrationBarHideTimerRef.current);
      calibrationBarHideTimerRef.current = null;
    }
    setShowCalibrationBar(true);
    setScaleInfo(null);
    setShowScaleNotification(false);
    setKnownDistance("");
    setScaleLocked(false);
    setGlobalScaleFactor(null);
    setScaleFlowActive(false);
    setActiveTool(null);
    setCountModeActive(false);
    setShowElementPanel(false);
    setPendingTool(null);
    setCalibPtCount(0);
    setCalibBasePxDist(null);
    setCalibPts(null);
    setAppliedCalibration(null);
    setColumnMeasureChoice(null);
    setElementPanelTab("concrete");
    setRebarDrawnLength(null);
    saveSession(projectId, {
      scaleInfo: null,
      knownDistance: "",
      scaleLocked: false,
      scaleFlowActive: false,
      scaleFactor: null,
    });
    if (selectedDrawing?.uploadedFileId) {
      clearPageCalibration(selectedDrawing.uploadedFileId, selectedPage);
    }
  }

  function handleSaveMeasurement(payload: SaveMeasurementPayload) {
    const measurementIds = measurementHook.state.measurements
      .map((m) => m.id)
      .filter((id) => !rebarMarkIds.current.has(id));

    // Use currentVariantId so "Apply & Continue" finalises whatever auto-save
    // already persisted, rather than creating a duplicate with a new UUID.
    const variant: WsConcreteMeasurement = {
      id: currentVariantId.current,
      measureType: effectiveMeasureType,
      tag: payload.tag,
      concreteFields: payload.concreteFields,
      rebar: payload.rebar,
      canvas: { ...payload.canvas, measurementIds },
      calibration: appliedCalibration,
      sessionId: activeSessionId,
      drawingId: selectedDrawing?.uploadedFileId ?? null,
      pageNumber: selectedPage,
      savedAt: Date.now(),
    };

    setConcreteMeasurements((prev) => {
      const idx = prev.findIndex((v) => v.id === currentVariantId.current);
      const next =
        idx >= 0
          ? prev.map((v, i) => (i === idx ? variant : v))
          : [...prev, variant];
      saveSession(projectId, { concreteMeasurements: next });
      return next;
    });

    // Cycle to a fresh ID so the next measurement round gets its own slot.
    currentVariantId.current = crypto.randomUUID();
    lastFormPayload.current = null;
  }

  // ── Assign element flow ───────────────────────────────────────────────────────

  function handleAssignContinue(mode: "new" | "existing", elementId?: string) {
    setAssignModalOpen(false);
    if (mode === "existing") {
      const target = elements.find((e) => e.id === elementId) ?? null;
      setAssigningElementId(elementId ?? null);
      setAssigningElement(target);
      setConfirmAssignOpen(true);
    } else {
      setCreateNewElOpen(true);
    }
  }

  function handleConfirmMerge() {
    if (!assigningElement) return;

    const updatedElement: CreatedElement = {
      ...assigningElement,
      variants: [...assigningElement.variants, ...concreteMeasurements],
    };

    const updatedElements = elements.map((e) =>
      e.id === assigningElement.id ? updatedElement : e,
    );

    const addedCount =
      concreteMeasurements[0]?.canvas.tool === "count"
        ? concreteMeasurements.reduce((s, v) => s + v.canvas.count, 0)
        : concreteMeasurements[0]?.canvas.tool === "length"
          ? Math.round(
              concreteMeasurements.reduce((s, v) => s + v.canvas.length, 0) *
                100,
            ) / 100
          : Math.round(
              concreteMeasurements.reduce((s, v) => s + v.canvas.area, 0) * 100,
            ) / 100;

    const addedUnit =
      concreteMeasurements[0]?.canvas.tool === "count"
        ? "items"
        : concreteMeasurements[0]?.canvas.tool === "length"
          ? (concreteMeasurements[0]?.canvas.unit ?? "m")
          : concreteMeasurements[0]?.canvas.unit === "Meters"
            ? "m²"
            : `${concreteMeasurements[0]?.canvas.unit ?? ""}²`;

    const newTotal = updatedElement.variants.reduce((s, v) => {
      const tool = v.canvas.tool;
      return (
        s +
        (tool === "count"
          ? v.canvas.count
          : tool === "length"
            ? v.canvas.length
            : v.canvas.area)
      );
    }, 0);

    setElements(updatedElements);
    saveSession(projectId, { createdElements: updatedElements });

    const assignment: WsElementAssignment = {
      id: crypto.randomUUID(),
      elementId: assigningElement.id,
      elementName: assigningElement.name,
      assignedAt: Date.now(),
    };
    const prevAssignments = loadSession(projectId).elementAssignments ?? [];
    saveSession(projectId, {
      elementAssignments: [...prevAssignments, assignment],
    });

    // Persist all variant geometry + data to the backend now that they're assigned.
    // Pass element metadata so the backend can return it on hydration and we can
    // reconstruct the sidebar element list without relying on localStorage.
    if (activeSessionId) {
      persistVariantsToBackend(
        concreteMeasurements,
        activeSessionId,
        assigningElement.id,
        assigningElement.name,
        assigningElement.category,
        assigningElement.categoryFolder,
        assigningElement.measurementUnit,
      );
    }

    setConcreteMeasurements([]);
    saveSession(projectId, { concreteMeasurements: [] });

    setAssignCompleteData({
      elementName: assigningElement.name,
      addedCount,
      addedUnit,
      newTotal: Math.round(newTotal * 100) / 100,
      elementId: assigningElement.id,
    });

    setConfirmAssignOpen(false);
    setAssignCompleteOpen(true);
  }

  function handleCreateNewEl(data: {
    categoryFolder: string;
    measurementUnit: string;
    rows: PileRow[];
  }) {
    const parts = data.categoryFolder.split(" / ");
    const category = parts[0] ?? "Substructure";
    const name = parts.slice(1).join(" / ") || "Element";

    const newEl: CreatedElement = {
      id: crypto.randomUUID(),
      name,
      category,
      categoryFolder: data.categoryFolder,
      measurementUnit: data.measurementUnit,
      variants: concreteMeasurements,
      sessionId: activeSessionId,
      drawingId: selectedDrawing?.uploadedFileId ?? null,
      pageNumber: selectedPage,
      createdAt: Date.now(),
    };

    const updatedElements = [...elements, newEl];
    setElements(updatedElements);
    saveSession(projectId, { createdElements: updatedElements });

    // Persist all variant geometry + data to the backend now that they're assigned.
    // Pass element metadata so the backend can return it on hydration and we can
    // reconstruct the sidebar element list without relying on localStorage.
    if (activeSessionId) {
      persistVariantsToBackend(
        concreteMeasurements,
        activeSessionId,
        newEl.id,
        newEl.name,
        newEl.category,
        newEl.categoryFolder,
        newEl.measurementUnit,
      );
    }

    setConcreteMeasurements([]);
    saveSession(projectId, { concreteMeasurements: [] });

    setExpandedCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category],
    );

    const addedCount =
      concreteMeasurements[0]?.canvas.tool === "count"
        ? concreteMeasurements.reduce((s, v) => s + v.canvas.count, 0)
        : concreteMeasurements[0]?.canvas.tool === "length"
          ? Math.round(
              concreteMeasurements.reduce((s, v) => s + v.canvas.length, 0) *
                100,
            ) / 100
          : Math.round(
              concreteMeasurements.reduce((s, v) => s + v.canvas.area, 0) * 100,
            ) / 100;

    const addedUnit =
      concreteMeasurements[0]?.canvas.tool === "count"
        ? "items"
        : concreteMeasurements[0]?.canvas.tool === "length"
          ? (concreteMeasurements[0]?.canvas.unit ?? "m")
          : concreteMeasurements[0]?.canvas.unit === "Meters"
            ? "m²"
            : `${concreteMeasurements[0]?.canvas.unit ?? ""}²`;

    setAssignCompleteData({
      elementName: name,
      addedCount,
      addedUnit,
      newTotal: addedCount,
      elementId: newEl.id,
    });

    setCreateNewElOpen(false);
    setAssignCompleteOpen(true);
    toast.success(`"${name}" element created`);
  }

  function handleElementClick(el: CreatedElement) {
    if (!el.drawingId) return;
    const drawing = drawings.find(
      (d) => d.uploadedFileId === el.drawingId || d.id === el.drawingId,
    );
    if (!drawing) return;
    setSelectedDrawingId(drawing.id);
    setSelectedPage(el.pageNumber || 1);
    setScale(1.0);
    setRotation(0);
    setDrawingsOpen(false);
  }

  function handleDeleteElement(el: CreatedElement) {
    setDeleteElementTarget(el);
  }

  async function handleConfirmDeleteElement() {
    const el = deleteElementTarget;
    if (!el) return;
    setDeletingElementId(el.id);

    // Each distinct canvas tool used by this element's variants was persisted
    // as its own backend record (clientId `${elementId}-${tool}`) — delete
    // every one of them so nothing lingers server-side.
    if (el.sessionId) {
      const tools = Array.from(new Set(el.variants.map((v) => v.canvas.tool)));
      for (const tool of tools) {
        try {
          await deleteMeasurementElement({
            sessionId: el.sessionId,
            clientId: `${el.id}-${tool}`,
          }).unwrap();
        } catch (err) {
          // 404 just means it was never persisted (e.g. still-pending variant) — ignore.
          const status = (err as { status?: number })?.status;
          if (status !== 404) {
            toast.error(`Failed to delete "${el.name}" from the server.`);
            setDeletingElementId(null);
            return;
          }
        }
      }
    }

    for (const variant of el.variants) removeMarksForVariant(variant);

    // Optimistic local removal so the sidebar updates instantly, then
    // invalidate by re-fetching the project's sessions so the list reconciles
    // with the backend's actual state rather than trusting local bookkeeping.
    const updatedElements = elements.filter((e) => e.id !== el.id);
    setElements(updatedElements);
    saveSession(projectId, { createdElements: updatedElements });
    loadProjectElements();

    toast.success(`"${el.name}" deleted`);
    setDeletingElementId(null);
    setDeleteElementTarget(null);
  }

  async function handleViewBoq() {
    if (!activeSessionId) {
      toast.warning(
        "No active session — open a drawing page first before viewing the BOQ.",
      );
      return;
    }
    try {
      await finalizeSession({
        sessionId: activeSessionId,
        body: { commit: true },
      }).unwrap();
      router.push(`${basePath}/${projectId}/boq`);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg =
        status === 404
          ? "Session not found — it may have already been finalized."
          : status === 400
            ? "Cannot finalize: ensure at least one measurement is saved."
            : `Could not finalize session (${status ?? "unknown error"}) — try again.`;
      toast.error(msg);
    }
  }

  // ── Calibration callback (from MeasurementCanvas) ────────────────────────────

  function handleCalibrationUpdate(
    basePxDist: number | null,
    pts: [MPoint, MPoint] | null,
    ptCount: 0 | 1 | 2,
  ) {
    setCalibBasePxDist(basePxDist);
    setCalibPts(pts);
    setCalibPtCount(ptCount);
  }

  // ── Measurement add/remove — canvas-only, no backend call at draw time ──────────
  // Elements are persisted to the backend in batch when the user creates or assigns
  // an element (see persistVariantsToBackend below).

  function handleMeasurementAdd(m: Measurement) {
    measurementHook.addMeasurement(m);

    // Rebar tab: the drawn length fills bar depths in the panel instead of
    // contributing to this element's own concrete quantity. sessionTotals is
    // derived from measurementHook.state.measurements, so no manual increment
    // is needed for the concrete case — it updates automatically on re-render.
    if (elementPanelTab === "rebar" && m.type === "length") {
      rebarMarkIds.current.add(m.id);
      setRebarDrawnLength(m.realLength);
    }
  }

  function handleMeasurementRemove(id: string) {
    measurementHook.removeMeasurement(id);
  }

  // ── Persist all variant geometry + data to the backend in one batch ───────────
  // Called only at element creation / assignment, never during drawing.
  // Each canvas mark is sent with its parent variant's concrete + rebar attributes.

  // Bundles every variant of the same category into as few backend requests as
  // possible (one per canvas tool) instead of one request per variant — e.g.
  // three separately-drawn Pile Caps (PC1, PC2, PC3) become ONE POST with
  // `attributes` as a parallel array and geometry's plural field (rectangles/
  // polylines/pointGroups) holding each one's own points, matching the
  // backend's documented multi-attribute payload shape.
  function persistVariantsToBackend(
    variants: WsConcreteMeasurement[],
    sessionId: string,
    elementId: string,
    elementName: string,
    elementCategory: string,
    categoryFolder: string,
    measurementUnit: string,
  ) {
    const allMeasurements = measurementHook.state.measurements;

    // Calibration was applied locally only (no backend call at Apply Scale time
    // anymore) — send it now, once, as part of actually assigning the element.
    const calibratedVariant = variants.find((v) => v.calibration);
    if (calibratedVariant?.calibration) {
      updateMeasurementCanvas({
        sessionId,
        body: { calibration: calibratedVariant.calibration },
      });
    }

    // Legacy cleanup — pending placeholders are no longer pushed while drawing,
    // but delete any stale one from before that change so it can't linger.
    for (const variant of variants) {
      deleteMeasurementElement({ sessionId, clientId: variant.id });
    }

    // Group by canvas tool — geometry type (and therefore what's valid to send)
    // depends on the tool, so each group becomes its own bundled request.
    const groups = new Map<
      "count" | "length" | "area",
      WsConcreteMeasurement[]
    >();
    for (const variant of variants) {
      const list = groups.get(variant.canvas.tool) ?? [];
      list.push(variant);
      groups.set(variant.canvas.tool, list);
    }

    for (const [tool, groupVariants] of groups) {
      const pointGroups: [number, number][][] = [];
      const attributesList: Record<string, unknown>[] = [];
      let color = "#f59e0b";
      let page = groupVariants[0].pageNumber;
      let backendType = toBackendElementType(groupVariants[0].measureType);

      for (const variant of groupVariants) {
        const variantMarks = allMeasurements.filter((m) =>
          variant.canvas.measurementIds.includes(m.id),
        );
        if (variantMarks.length === 0) continue;

        // A variant can carry more than one mark (e.g. two wall segments
        // applied together) — flatten them into this variant's one slot in
        // the bundle so the 1 variant : 1 attributes-entry mapping holds.
        const points: [number, number][] =
          tool === "count"
            ? variantMarks
                .filter((m): m is CountMark => m.type === "count")
                .map((m) => toXY(m.point))
            : variantMarks.flatMap((m) =>
                m.type === "count" ? [] : m.points.map(toXY),
              );
        if (points.length === 0) continue;

        // Flatten concreteFields values to numbers where possible, then spread
        // them directly into attributes so the server's BOQ materializer can read them.
        const flatFields = Object.fromEntries(
          Object.entries(variant.concreteFields).map(([k, v]) => {
            const n = parseFloat(v);
            return [k, Number.isFinite(n) ? n : v];
          }),
        );

        // Snapshot is stored on every backend element so the hydration pass can
        // reconstruct WsConcreteMeasurement objects without touching localStorage.
        // measurementIds are canvas-local and meaningless after a page reload, so exclude them.
        const _snapshot = JSON.stringify({
          ...variant,
          canvas: { ...variant.canvas, measurementIds: [] },
        });

        pointGroups.push(points);
        attributesList.push({
          elementId,
          elementName,
          elementCategory,
          categoryFolder,
          measurementUnit,
          measureType: variant.measureType,
          variantId: variant.id,
          pending: false,
          _snapshot,
          points,
          ...flatFields,
          reinforcement: rebarToReinforcement(variant.rebar),
        });

        color = variantMarks[0]?.color ?? color;
        page = variant.pageNumber;
        backendType = toBackendElementType(variant.measureType);
      }

      if (pointGroups.length === 0) continue;

      const geometry: MeasurementGeometry = {
        type:
          tool === "count"
            ? "multipoint"
            : tool === "length"
              ? "polyline"
              : "polygon",
        points: pointGroups.flat(),
        page,
      };
      if (tool === "count") geometry.pointGroups = pointGroups;
      if (tool === "length") geometry.polylines = pointGroups;
      if (tool === "area") geometry.polygons = pointGroups;

      const label = groupVariants[0].tag || groupVariants[0].measureType;

      upsertMeasurementElement({
        sessionId,
        body: {
          // Stable per element+tool so re-assigning the same element updates
          // this same backend record instead of creating duplicates.
          clientId: `${elementId}-${tool}`,
          tool,
          label,
          mapsToElementType: backendType,
          geometry,
          style: { color, strokeWidth: 2 },
          attributes:
            attributesList.length === 1 ? attributesList[0] : attributesList,
        },
      });
    }
  }

  // ── Session conflict resolution (409 on session create) ──────────────────────

  function handleResumeConflictSession() {
    if (!sessionConflict) return;
    const { liveSessionId, uploadedFileId, pageNumber } = sessionConflict;
    setActiveSessionId(liveSessionId);
    if (uploadedFileId) {
      openedSessionKeys.current.set(
        `${uploadedFileId}-${pageNumber ?? 1}`,
        liveSessionId,
      );
      const drawing = drawings.find((d) => d.uploadedFileId === uploadedFileId);
      if (drawing) {
        setSelectedDrawingId(drawing.id);
        setSelectedPage(pageNumber ?? 1);
        setScale(1.0);
        setRotation(0);
      }
    }
    setSessionConflict(null);
  }

  async function handleDeleteConflictAndCreate() {
    if (!sessionConflict) return;
    const uploadedFileId = selectedDrawing?.uploadedFileId;
    if (!uploadedFileId) return;
    try {
      await deleteMeasurementSession(sessionConflict.liveSessionId).unwrap();
      setSessionConflict(null);
      const result = await createMeasurementSession({
        projectId,
        body: {
          uploadedFileId,
          pageNumber: selectedPage,
          canvas: { width: 1920, height: 1080 },
        },
      });
      if ("data" in result && result.data?.data?._id) {
        const sid = result.data.data._id;
        openedSessionKeys.current.set(`${uploadedFileId}-${selectedPage}`, sid);
        setActiveSessionId(sid);
      }
    } catch {
      toast.error("Could not start fresh session — please try again.");
    }
  }

  // ── Apply & Continue / Assign Element — save then reset session counters ──────
  // Canvas lines are permanent records; only the session totals reset.

  function handleSessionReset() {
    claimCurrentMarks();
    setLiveDrawingLength(null);
    setRebarDrawnLength(null);
    setElementPanelTab("concrete");
  }

  // ── Per-page totals for the LEFT sidebar stat bar ─────────────────────────────

  const { countTotal, lengthTotal, areaTotal } = useMemo(() => {
    const ms = measurementHook.state.measurements;
    const sf = globalScaleFactor;
    let countTotal = 0,
      lengthTotal = 0,
      areaTotal = 0;
    for (const m of ms) {
      if (m.type === "count") countTotal++;
      else if (m.type === "length" && sf) lengthTotal += m.pixelLength / sf;
      else if (m.type === "area" && sf) areaTotal += m.pixelArea / (sf * sf);
    }
    return { countTotal, lengthTotal, areaTotal };
  }, [measurementHook.state.measurements, globalScaleFactor]);

  const nextCountIndex = useMemo(
    () =>
      measurementHook.state.measurements.filter((m) => m.type === "count")
        .length + 1,
    [measurementHook.state.measurements],
  );

  // ── Canvas helpers ────────────────────────────────────────────────────────────

  const zoomIn = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3));
  const zoomOut = () => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.25));
  const resetZoom = () => setScale(1.0);
  const rotateDrawing = () =>
    setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270);

  // Mouse wheel and trackpad pinch (browsers report pinch as wheel + ctrlKey) both
  // zoom, and only while the cursor is over the drawing itself. Attached as a real
  // native listener (not React's onWheel) with { passive: false } — React's
  // synthetic wheel handler isn't guaranteed non-passive in every browser, so
  // preventDefault() inside it can silently no-op and let the browser's own
  // native pinch/ctrl+wheel page-zoom fire at the same time. A real non-passive
  // listener is the only way to reliably suppress that.
  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      // Scrolling inside the floating Element panel should scroll that panel,
      // not zoom the drawing underneath it — a native listener on an ancestor
      // fires during real DOM bubbling, before React's synthetic event system
      // even runs, so a descendant's React-level stopPropagation can't stop
      // this one; check the actual target instead.
      if (elementPanelRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
      setScale((s) => {
        const next = e.deltaY > 0 ? s - 0.1 : s + 0.1;
        return Math.min(Math.max(+next.toFixed(2), 0.25), 3);
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function handleSidebarToggle() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveSession(projectId, { sidebarCollapsed: next });
      return next;
    });
  }

  function handleSelectFile(fileId: string) {
    if (selectedDrawingId === fileId) return;
    setSelectedDrawingId(fileId);
    setSelectedPage(1);
    setScale(1.0);
    setRotation(0);
  }
  function handleSelectPage(fileId: string, pageNum: number) {
    if (selectedDrawingId !== fileId) {
      setSelectedDrawingId(fileId);
      setScale(1.0);
      setRotation(0);
    }
    setSelectedPage(pageNum);
  }

  const handlePageCountResolved = useCallback(
    (id: string, numPages: number) => {
      const drawing = drawings.find((d) => d.id === id);
      if (!drawing || drawing.pageCount === numPages) return;
      const baseName = drawing.name.replace(/\.[^.]+$/, "");
      const truncatedName =
        baseName.length > 10 ? `${baseName.slice(0, 10)}...` : baseName;
      dispatch(
        setDrawingPages({
          id,
          pages: Array.from({ length: numPages }, (_, i) => ({
            number: i + 1,
            label: `${truncatedName}${i + 1}`,
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
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadFile({
          formData,
          onUploadProgress: (event) => {
            if (event.total) {
              const pct = Math.round((event.loaded / event.total) * 100);
              dispatch({
                type: "manualWizard/updateDrawing",
                payload: { id, progress: pct, status: "uploading" },
              });
            }
          },
        }).unwrap();

        const uploadedFileId = result.data._id;
        const uploadedUrl = result.data.url;

        dispatch({
          type: "manualWizard/updateDrawing",
          payload: { id, status: "processing", progress: 100 },
        });
        await new Promise((r) => setTimeout(r, 400));
        dispatch({
          type: "manualWizard/updateDrawing",
          payload: { id, status: "complete", uploadedFileId, uploadedUrl },
        });

        // Persist drawing to workspace session so it survives a page reload
        const currentSession = loadSession(projectId);
        const sessionDrawings = currentSession.drawings ?? [];
        if (!sessionDrawings.some((d) => d.id === uploadedFileId)) {
          saveSession(projectId, {
            drawings: [
              ...sessionDrawings,
              {
                id: uploadedFileId,
                name: file.name,
                url: uploadedUrl,
                extension: ext,
                size: file.size,
              },
            ],
          });
        }

        // Append new file ID to project's drawings array on the backend
        const existingIds = backendProject?.drawings ?? [];
        await updateProject({
          projectId,
          body: { drawings: [...existingIds, uploadedFileId] },
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
      setRotation(0);
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

  const elementsByCategory = filteredElements.reduce<
    Record<string, CreatedElement[]>
  >((acc, el) => {
    if (!acc[el.category]) acc[el.category] = [];
    acc[el.category].push(el);
    return acc;
  }, {});

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

  // Merge backend drawing IDs with session-saved IDs (set by wizard before navigation).
  // The backend may not return `drawings` immediately after creation, so the session
  // fallback ensures drawings always hydrate on first workspace visit.
  // Must run before the loading early-return below — a hook can never be called
  // conditionally, or React throws a "rendered fewer/more hooks than expected"
  // mismatch on the loading→loaded transition, which breaks DrawingHydrator mounting.
  const apiHydrateIds = useMemo(() => {
    const ids = new Set<string>(backendProject?.drawings ?? []);
    for (const d of savedSession.drawings ?? []) ids.add(d.id);
    return Array.from(ids);
  }, [backendProject?.drawings, savedSession.drawings]);

  // True while at least one expected drawing hasn't finished hydrating into
  // Redux yet — lets the canvas/sidebar show "loading" instead of the same
  // empty state a genuinely drawing-less project would show.
  const drawingsHydrating = useMemo(
    () =>
      apiHydrateIds.some(
        (id) => !drawings.some((d) => d.id === id || d.uploadedFileId === id),
      ),
    [apiHydrateIds, drawings],
  );

  const onboardingSteps: OnboardingStep[] = useMemo(
    () => [
      {
        title: "Start by creating an Element",
        body: "This is your first step. Creating an Element walks you through choosing what to measure (piles, columns, beams…) and setting your drawing's scale — everything else in the workspace builds on it.",
        targetRef: newElementBtnRef,
        placement: "bottom",
      },
      {
        title: "Then measure with these tools",
        body: "Once your element and scale are set, use Length, Area, or Count to take off quantities from the drawing.",
        targetRef: toolsSectionRef,
        placement: "right",
      },
      {
        title: "Navigating the drawing",
        body: "These controls move you around without disturbing your measurements:",
        legend: [
          { icon: Hand, label: "Hand — drag to pan the drawing" },
          { icon: ZoomIn, label: "Zoom in" },
          { icon: ZoomOut, label: "Zoom out" },
          { icon: Maximize2, label: "Fit / reset zoom" },
          { icon: RotateCw, label: "Rotate the drawing 90°" },
        ],
        targetRef: zoomControlsRef,
        placement: "right",
      },
    ],
    [],
  );

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
    <>
      {apiHydrateIds.map((fileId) => (
        <DrawingHydrator
          key={fileId}
          fileId={fileId}
          folderId={folders[0]?.id ?? "default"}
          onLoaded={handleDrawingHydrated}
        />
      ))}
      <div className="relative flex h-screen overflow-hidden bg-[#e8edf2]">
        {/* ── Left sidebar ── */}
        <aside
          className={`shrink-0 bg-white border-r border-slate-100 overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-0 border-r-0" : "w-[248px]"
          }`}
        >
          {/* Fixed-width inner column so content never reflows while the aside animates —
          the aside itself just clips it via overflow-hidden. */}
          <div className="w-[248px] h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-3 py-3 bg-[#fdf8f0] border-b border-amber-100/60 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <LayoutGrid className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-800 leading-snug">
                  QSCalc Pro Workspace
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {projectName}
                </p>
              </div>
            </div>

            {/* Dashboard */}
            <div className="px-3 py-1 border-b border-slate-100 flex items-center gap-1.5">
              <a
                href={
                  basePath.startsWith("/enterprise")
                    ? "/enterprise/dashboard"
                    : "/dashboard"
                }
                className="flex-1 min-w-0 flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Home className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Dashboard
                </span>
              </a>
              <button
                onClick={handleSidebarToggle}
                title="Collapse sidebar"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white shrink-0 transition-colors"
              >
                <Expand className="w-4 h-4" />
              </button>
            </div>

            {/* Tools */}
            <div
              ref={toolsSectionRef}
              className="px-3 pt-3 pb-2.5 border-b border-slate-100"
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Tools
                </span>
              </div>
              <TooltipProvider delayDuration={400}>
                <div className="flex gap-1.5">
                  {TOOLS.map((tool) => {
                    const isDisabled =
                      (tool.id === "undo" && !measurementHook.canUndo) ||
                      (tool.id === "redo" && !measurementHook.canRedo);
                    return (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleToolClick(tool.id)}
                            disabled={isDisabled}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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
                    );
                  })}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDeselectTool}
                        disabled={!activeTool}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                      <p className="font-semibold text-xs">Deselect Tool</p>
                      <p className="text-[10px] opacity-75 mt-0.5">
                        Stop drawing with the active tool
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              {activeTool === "count" && (
                <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
                  <span className="text-white text-[11px] font-semibold">
                    Count
                  </span>
                  <span className="text-white text-[11px] font-bold">
                    # {countTotal}
                  </span>
                </div>
              )}
              {activeTool === "length" && (
                <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
                  <span className="text-white text-[11px] font-semibold">
                    Length
                  </span>
                  <span className="text-white text-[11px] font-bold">
                    {(lengthTotal + (liveDrawingLength ?? 0)).toFixed(2)}{" "}
                    {distanceUnit}
                  </span>
                </div>
              )}
              {activeTool === "area" && (
                <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
                  <span className="text-white text-[11px] font-semibold">
                    Area
                  </span>
                  <span className="text-white text-[11px] font-bold">
                    {areaTotal.toFixed(2)}{" "}
                    {distanceUnit === "Meters" ? "m²" : `${distanceUnit}²`}
                  </span>
                </div>
              )}
              {activeTool === "text" && (
                <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-700 rounded-lg">
                  <span className="text-white text-[11px] font-semibold">
                    Text
                  </span>
                </div>
              )}
            </div>

            {/* ELEMENTS + DRAWINGS drawer */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* ELEMENT section label */}
              <div className="px-3 py-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Element
                    </span>
                  </div>
                  <button
                    ref={newElementBtnRef}
                    onClick={handleAddNewElement}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-800 underline hover:text-amber-600 transition-colors"
                  >
                    New Element
                  </button>
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
                    {elementsLoading &&
                    Object.keys(elementsByCategory).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
                        <div className="w-6 h-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                          Loading elements…
                        </p>
                      </div>
                    ) : Object.keys(elementsByCategory).length === 0 ? (
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
                        {Object.entries(elementsByCategory).map(
                          ([category, els]) => (
                            <div key={category} className="py-1">
                              <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Folder className="w-4 h-4 text-blue-500 fill-blue-100 shrink-0" />
                                  <span className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
                                    {category}
                                  </span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${expandedCategories.includes(category) ? "" : "-rotate-90"}`}
                                />
                              </button>

                              {expandedCategories.includes(category) && (
                                <div className="ml-[19px] border-l border-slate-200 pl-3">
                                  {els.map((el) => (
                                    <div
                                      key={el.id}
                                      className="w-full flex items-center gap-1 hover:bg-amber-50/60 transition-colors group rounded"
                                    >
                                      <button
                                        onClick={() => handleElementClick(el)}
                                        className="flex-1 min-w-0 py-2 text-left"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0 transition-colors" />
                                          <span className="flex-1 min-w-0 text-[13px] font-bold text-slate-800 truncate group-hover:text-amber-700 transition-colors">
                                            {el.name}
                                          </span>
                                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-400 shrink-0 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 pl-[22px]">
                                          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                          <span className="text-[12px] text-slate-500">
                                            {el.variants.length} variant
                                            {el.variants.length !== 1
                                              ? "s"
                                              : ""}
                                          </span>
                                        </div>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteElement(el);
                                        }}
                                        disabled={deletingElementId === el.id}
                                        title="Delete element"
                                        className="w-6 h-6 shrink-0 mr-1.5 inline-flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ),
                        )}

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
                      <span className="text-[12px] font-bold tracking-wide">
                        DRAWINGS
                      </span>
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
                      {drawingsHydrating &&
                      drawings.filter(
                        (d) => d.status === "complete" || d.previewUrl,
                      ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                          <div className="w-6 h-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Loading drawings…
                          </p>
                        </div>
                      ) : folders.length === 0 ||
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
                                          isActive={
                                            selectedDrawingId === file.id
                                          }
                                          activePage={selectedPage}
                                          onSelectFile={() =>
                                            handleSelectFile(file.id)
                                          }
                                          onSelectPage={(pg) =>
                                            handleSelectPage(file.id, pg)
                                          }
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
          </div>
        </aside>

        {/* Floating compact header — shown only while the sidebar is collapsed */}
        {sidebarCollapsed && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2.5 bg-[#fdf8f0] border border-amber-100/60 rounded-xl shadow-md px-3 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <LayoutGrid className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-slate-800 leading-snug">
                QSCalc Pro Workspace
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {projectName}
              </p>
            </div>
            <button
              onClick={handleSidebarToggle}
              title="Expand sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0 transition-colors ml-1"
            >
              <Expand className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Main area ── */}
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
              {autoSaveStatus === "saving" ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-500">
                  <div className="w-2.5 h-2.5 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Save className="w-3 h-3" />
                  {autoSaveStatus === "saved"
                    ? "Auto-saved just now"
                    : "Auto-saved just now"}
                </span>
              )}
              {scaleLocked && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-lg border border-green-200">
                  <Lock className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] font-semibold text-green-700">
                    Scale Locked
                  </span>
                </div>
              )}
              {scaleLocked && !showCalibrationBar && (
                <button
                  onClick={handleShowCalibrationBar}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 underline transition-colors"
                >
                  Edit Calibration
                </button>
              )}
              {scaleFlowActive && (
                <button
                  onClick={handleViewBoq}
                  disabled={finalizing}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-[11px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {finalizing ? (
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FileUp className="w-3 h-3" />
                  )}
                  View BOQ
                </button>
              )}
            </div>
          </header>

          {/* Canvas row */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div
              ref={canvasAreaRef}
              className="flex-1 min-w-0 relative overflow-hidden bg-[#e8edf2]"
            >
              {drawingsHydrating && !selectedDrawing ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
                  <div className="w-8 h-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                  <p className="text-sm text-slate-500 font-medium">
                    Loading drawings…
                  </p>
                </div>
              ) : (
              <DrawingCanvas
                drawing={selectedDrawing}
                page={selectedPage}
                scale={scale}
                rotation={rotation}
                panEnabled={
                  !(scaleFlowActive && !scaleLocked) &&
                  (!activeTool || activeTool === "text")
                }
                onPanningChange={setIsPanningDrawing}
                onPageCountResolved={handlePageCountResolved}
                measurementOverlay={
                  <MeasurementCanvas
                    pdfScale={scale}
                    activeTool={activeTool}
                    isCalibrating={scaleFlowActive && !scaleLocked}
                    scaleFactor={globalScaleFactor}
                    distanceUnit={distanceUnit}
                    activeColor={activeColor}
                    measurements={measurementHook.state.measurements}
                    highlightedIds={highlightedMarkIds}
                    nextCountIndex={nextCountIndex}
                    pageKey={`${selectedDrawingId ?? "none"}-${selectedPage}`}
                    isPanning={isPanningDrawing}
                    onCalibrationUpdate={handleCalibrationUpdate}
                    onMeasurementAdd={handleMeasurementAdd}
                    onLiveLength={setLiveDrawingLength}
                    onUndo={measurementHook.undo}
                    onRedo={measurementHook.redo}
                  />
                }
              />
              )}

              {/* Zoom controls */}
              <div
                ref={zoomControlsRef}
                className="absolute top-4 left-4 flex flex-col gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-1"
              >
                <button
                  onClick={handleDeselectTool}
                  className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                    !activeTool
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                  title="Hand tool — pan the drawing"
                >
                  <Hand className="w-3.5 h-3.5" />
                </button>
                <div className="h-px bg-slate-200 mx-0.5" />
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
                <div className="h-px bg-slate-200 mx-0.5" />
                <button
                  onClick={rotateDrawing}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                  title="Rotate drawing 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
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

              {/* Floating Element Detail Panel — draggable, collapsible, position persists */}
              {showElementPanel && (
                <div
                  ref={elementPanelRef}
                  className={`absolute z-20 ${elementPanelPos ? "" : "right-6 top-4"}`}
                  style={
                    elementPanelPos
                      ? { left: elementPanelPos.x, top: elementPanelPos.y }
                      : undefined
                  }
                >
                  {elementPanelCollapsed ? (
                    <button
                      onPointerDown={handlePanelDragStart}
                      onPointerMove={handlePanelDragMove}
                      onPointerUp={() => {
                        handlePanelDragEnd();
                        handlePanelToggleCollapsed();
                      }}
                      style={{ touchAction: "none" }}
                      title="Expand element panel"
                      className="relative w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing animate-in fade-in zoom-in-90 duration-200"
                    >
                      <Box className="w-5 h-5" />
                      {(sessionTotals.count > 0 ||
                        sessionTotals.length > 0 ||
                        sessionTotals.area > 0) && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </button>
                  ) : (
                    <div className="w-[290px] max-h-[70vh] flex flex-col rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <ElementDetailPanel
                        measure={scaleWhat}
                        measureChoice={columnMeasureChoice}
                        showRebarTab={showRebarTab}
                        activeMeasureTool={concreteToolForCategory}
                        liveCount={sessionTotals.count}
                        liveLength={effectiveConcreteLength}
                        liveArea={sessionTotals.area}
                        liveRebarLength={rebarDrawnLength}
                        selectedVariant={selectedVariant}
                        distanceUnit={distanceUnit}
                        hasMeasurements={
                          sessionTotals.count > 0 ||
                          sessionTotals.length > 0 ||
                          sessionTotals.area > 0
                        }
                        activeColor={activeColor}
                        onColorChange={setActiveColor}
                        onClose={handlePanelToggleCollapsed}
                        onAssignElement={() => {
                          if (concreteMeasurements.length === 0) {
                            toast.warning(
                              "Take a measurement on the drawing first — draw some marks before assigning an element.",
                            );
                            return;
                          }
                          setAssignModalOpen(true);
                        }}
                        onApplyAndContinue={handleSessionReset}
                        onSaveMeasurement={handleSaveMeasurement}
                        onFormChange={handleAutoSave}
                        onResetMeasurements={handleSessionReset}
                        onTabChange={handleElementPanelTabChange}
                        blockworkSide={blockworkSide}
                        onBlockworkSideChange={handleBlockworkSideChange}
                        dragHandleProps={{
                          onPointerDown: handlePanelDragStart,
                          onPointerMove: handlePanelDragMove,
                          onPointerUp: handlePanelDragEnd,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Calibration / Ready bar — fades/collapses out a couple seconds after
              locking; "Edit Calibration" in the top header brings it back. */}
          {scaleFlowActive && (
            <div
              className={`shrink-0 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                showCalibrationBar
                  ? "max-h-[320px] opacity-100 border-t border-slate-200"
                  : "max-h-0 opacity-0 border-t-0"
              }`}
            >
              {!scaleInfo ? (
                <div
                  className="px-6 pt-3 pb-5"
                  style={{ backgroundColor: "#FEF2F280" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-500" />
                      <span className="text-[11px] font-bold tracking-wide text-red-600">
                        CALIBRATION REQUIRED
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-1/3 space-y-3 shrink-0">
                      {/* Step 1 — dynamic based on points placed */}
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px ${calibPtCount === 2 ? "bg-green-500" : "bg-amber-500"}`}
                        >
                          1
                        </div>
                        <span
                          className={`text-[11px] leading-snug ${calibPtCount === 2 ? "text-green-600 font-medium" : "text-slate-600"}`}
                        >
                          {calibPtCount === 0 &&
                            "Click the first point on a known distance on the plan."}
                          {calibPtCount === 1 &&
                            "✓ Point 1 set — click the second point."}
                          {calibPtCount === 2 &&
                            `✓ Both points set — ${calibBasePxDist?.toFixed(0)} px measured.`}
                        </span>
                      </div>
                      {/* Step 2 */}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-px">
                          2
                        </div>
                        <span className="text-[11px] text-slate-600 leading-snug">
                          Enter the real length below.
                        </span>
                      </div>
                    </div>

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
                    </div>
                  </div>
                </div>
              ) : !scaleLocked ? (
                <div
                  className="px-6 py-3 flex items-center justify-between"
                  style={{ backgroundColor: "#FEF2F280" }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-[12px] font-bold text-green-700">
                      {scaleInfo}
                    </span>
                    {showScaleNotification && (
                      <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Lock Scale:
                      </span>
                      <button
                        onClick={() => {
                          handleToggleScaleLock(true);
                          if (calibrationBarHideTimerRef.current)
                            clearTimeout(calibrationBarHideTimerRef.current);
                          calibrationBarHideTimerRef.current = setTimeout(
                            () => setShowCalibrationBar(false),
                            2500,
                          );
                        }}
                        className="relative w-9 h-5 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors"
                      >
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" />
                      </button>
                      <span className="text-[11px] font-semibold text-slate-500">
                        OFF
                      </span>
                    </div>
                    <button
                      onClick={handleResetScale}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Reset Scale
                    </button>
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
                        <span className="text-[11px] text-slate-500">
                          Lock Scale:
                        </span>
                        <button
                          onClick={() => {
                            handleToggleScaleLock(false);
                            handleShowCalibrationBar();
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
                        Reset Scale
                      </button>
                    </div>
                  </div>

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

          {/* Live Measurements panel — visible once measuring has started */}
          {scaleFlowActive && scaleLocked && (
            <LiveMeasurementsPanel
              elements={elements}
              pendingVariants={concreteMeasurements}
              distanceUnit={distanceUnit}
              selectedVariantId={selectedVariantId}
              onSelectVariant={handleSelectVariant}
              onDeleteVariant={handleDeleteVariant}
              onClearAll={handleClearAllVariants}
            />
          )}
        </div>

        {/* ── Dialogs ── */}
        <NewFolderDialog
          open={newFolderOpen}
          onOpenChange={setNewFolderOpen}
          onConfirm={handleCreateFolder}
        />

        {/* 409 conflict — another live session exists for this project */}
        <Dialog
          open={!!sessionConflict}
          onOpenChange={(v) => {
            if (!v) setSessionConflict(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                Active Session Conflict
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500 pt-1">
                There is already an active measurement session for this project.
                You can resume that session (and navigate to its drawing) or
                delete it and start a new one here.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSessionConflict(null)}
              >
                Cancel
              </Button>
              <Button variant="outline" onClick={handleResumeConflictSession}>
                Resume Existing
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleDeleteConflictAndCreate}
              >
                Delete &amp; Start Fresh
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
          onMeasureChange={handleScaleSetupMeasureChange}
          measureChoice={columnMeasureChoice}
          onMeasureChoiceChange={setColumnMeasureChoice}
          onCancel={handleScaleSetupCancel}
          onYes={handleScaleSetupProceed}
        />

        <AssignItemsModal
          open={assignModalOpen}
          existingElements={elements}
          pendingVariants={concreteMeasurements}
          onClose={() => setAssignModalOpen(false)}
          onContinue={handleAssignContinue}
        />

        <AlertDialog
          open={!!deleteElementTarget}
          onOpenChange={(v) => {
            if (!v) setDeleteElementTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete element?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{deleteElementTarget?.name}
                &quot; and all {deleteElementTarget?.variants.length ?? 0} of
                its measurement variant
                {deleteElementTarget?.variants.length !== 1 ? "s" : ""} from the
                project. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!deletingElementId}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDeleteElement();
                }}
                disabled={!!deletingElementId}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deletingElementId ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ConfirmAssignmentModal
          open={confirmAssignOpen}
          pendingVariants={concreteMeasurements}
          targetElement={assigningElement}
          onCancel={() => {
            setConfirmAssignOpen(false);
            setAssignModalOpen(true);
          }}
          onConfirm={handleConfirmMerge}
        />

        <AssignmentCompleteModal
          open={assignCompleteOpen}
          elementName={assignCompleteData?.elementName ?? ""}
          addedCount={assignCompleteData?.addedCount ?? 0}
          addedUnit={assignCompleteData?.addedUnit ?? "items"}
          newTotal={assignCompleteData?.newTotal ?? 0}
          onClose={() => {
            setAssignCompleteOpen(false);
            setAssignCompleteData(null);
          }}
          onViewElement={() => {
            const el = elements.find(
              (e) => e.id === assignCompleteData?.elementId,
            );
            setAssignCompleteOpen(false);
            setAssignCompleteData(null);
            if (el) handleElementClick(el);
          }}
        />

        {/* Mount fresh each open so useState initializers fire with the latest variants */}
        {createNewElOpen && (
          <CreateNewElementModal
            open={createNewElOpen}
            pendingVariants={concreteMeasurements}
            measureType={effectiveMeasureType}
            onClose={() => setCreateNewElOpen(false)}
            onUseExisting={() => {
              setCreateNewElOpen(false);
              setAssignModalOpen(true);
            }}
            onCreate={handleCreateNewEl}
          />
        )}

        {/* Hidden PDF preloaders — eagerly resolve page count so sidebar shows all pages without
          requiring the user to click each file first. */}
        <DrawingPreloader
          drawings={drawings}
          onPageCountResolved={handlePageCountResolved}
        />
      </div>

      {showOnboarding && (
        <WorkspaceOnboarding
          steps={onboardingSteps}
          onFinish={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
