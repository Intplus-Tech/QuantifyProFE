import type {
  AiDetectedMeasurementElement,
  AiElementType,
  AiTakeoffJob,
  BoqResult,
  MeasurementUnit,
} from "@/types/aiTakeoff";
import type {
  BoqSection,
  ExtractedElement,
  ExtractedGroup,
  ExtractionStatus,
  ExtractionStep,
} from "./types";
import { MEASURE_TYPES } from "./mock-data";
import { elementTypeLabels, humaniseText } from "./humanise";

/**
 * Measure tile → server element type.
 *
 * `null` means the detector has no equivalent for that tile. RAMPS, DOORS and
 * WINDOWS have no member in the API's 37-value elementType enum, so they are
 * disabled in the picker rather than sent and rejected.
 */
export const AI_ELEMENT_TYPE_BY_MEASURE: Record<string, AiElementType | null> = {
  piles: "pile",
  "pile-cap": "pile_cap",
  "raft-foundation": "raft_foundation",
  "strip-foundation": "strip_foundation",
  "pad-footing": "pad_footing",
  "ground-beam": "ground_beam",
  columns: "column",
  beams: "beam",
  slabs: "slab",
  "shear-walls": "shear_wall",
  "lift-walls": "lift_wall",
  stairs: "staircase",
  // Blockwork and every wall tile are detected as "wall"; the request is
  // de-duplicated in toAiElementTypes so selecting several asks once.
  blockwork: "wall",
  "ext-walls": "wall",
  "int-walls": "wall",
  lintels: "lintels",
  roof: "roof_slab",
  "swimming-pool": "swimming_pool",
  ramps: null,
  doors: null,
  windows: null,
};

export const MEASURE_BY_AI_ELEMENT_TYPE: Record<string, string> = Object.entries(
  AI_ELEMENT_TYPE_BY_MEASURE,
).reduce<Record<string, string>>((acc, [measureId, elementType]) => {
  if (elementType) acc[elementType] = measureId;
  return acc;
}, {});

export const isMeasureSupported = (measureId: string) =>
  AI_ELEMENT_TYPE_BY_MEASURE[measureId] != null;

export function toAiElementTypes(measureIds: string[]): AiElementType[] {
  const types = measureIds
    .map((id) => AI_ELEMENT_TYPE_BY_MEASURE[id])
    .filter((t): t is AiElementType => t != null);
  return [...new Set(types)];
}

// ── Units ───────────────────────────────────────────────────────────────────

const MM_PER_UNIT: Record<MeasurementUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
  px: 1,
};

export const toMillimetres = (value: number, unit: MeasurementUnit) =>
  value * (MM_PER_UNIT[unit] ?? 1);

const SHAPE_BY_GEOMETRY: Record<string, string> = {
  rectangle: "Rectangle",
  circle: "Circular",
  polygon: "Polygon",
  polyline: "Polyline",
  point: "Point",
  multipoint: "Multipoint",
  freehand: "Freehand",
};

/**
 * Element types that are round by nature, whatever the geometry says.
 *
 * A bored pile is marked on a layout with a symbol, so it comes back as a
 * point and would otherwise be measured as a box — a 600mm pile 10m deep
 * reading 10 × 0.6 × 0.6 = 3.60 m³ instead of π × 0.3² × 10 = 2.83 m³.
 */
const CIRCULAR_MEASURES = new Set(["piles"]);

const STATUS_BY_REVIEW: Record<string, ExtractionStatus> = {
  accepted: "valid",
  rejected: "rejected",
  pending: "review",
};

/**
 * Structural drawings are dimensioned in millimetres, so a bare `600` read off
 * a section is 600 mm — never 600 of whatever unit the page scale happens to
 * be calibrated in. Attribute figures therefore carry their own unit, separate
 * from the scale's.
 */
const ANNOTATION_UNIT: MeasurementUnit = "mm";

const UNIT_SUFFIX: [RegExp, MeasurementUnit][] = [
  [/\bmm\b|millim/i, "mm"],
  [/\bcm\b|centim/i, "cm"],
  [/(?<![a-z])m(?![a-z])|\bmet(er|re)/i, "m"],
  [/\bft\b|feet|foot|'/i, "ft"],
  [/\bin\b|inch|"/i, "in"],
];

/**
 * Attribute keys are not named anywhere in the OpenAPI document, so match
 * loosely: case-insensitive, ignoring separators, across the usual spellings.
 *
 * Returns the unit alongside the number: values arrive both as `600` and as
 * `"600mm"` / `"0.6 m"`, and reading the second kind as the first is the
 * difference between a 0.6 m pile and a 600 m one.
 */
function readAttributeAny(
  attributes: AiDetectedMeasurementElement["attributes"],
  keys: string[],
): { value: number; unit: MeasurementUnit } | null {
  if (!attributes) return null;
  const first = Array.isArray(attributes) ? attributes[0] : attributes;
  if (!first) return null;

  const normalise = (k: string) => k.toLowerCase().replace(/[\s_-]/g, "");
  const wanted = new Set(keys.map(normalise));

  for (const [key, raw] of Object.entries(first)) {
    if (!wanted.has(normalise(key)) || raw == null) continue;

    if (typeof raw === "number") {
      return Number.isFinite(raw) ? { value: raw, unit: ANNOTATION_UNIT } : null;
    }

    const text = String(raw);
    const num = parseFloat(text);
    if (!Number.isFinite(num)) continue;

    const suffix = UNIT_SUFFIX.find(([pattern]) => pattern.test(text.slice(String(num).length)));
    return { value: num, unit: suffix?.[1] ?? ANNOTATION_UNIT };
  }
  return null;
}

/**
 * Measure the detection's own geometry.
 *
 * The model reports *where* each element is, not how big it is — the docs are
 * explicit that "lengths, areas and perimeters are derived from the geometry
 * and the page scale". Points come back in page pixels, so the bounding box
 * times the scale is a real measurement rather than an invented one.
 *
 * A point detection (a pile marked with a symbol) has no extent, so nothing is
 * derivable and the dimensions stay null for Quick Edit to fill.
 */
function measureGeometry(
  geometry: AiDetectedMeasurementElement["geometry"],
  scale: number | null,
): { long: number | null; short: number | null; diameter: number | null } {
  const empty = { long: null, short: null, diameter: null };
  if (!geometry || !scale || scale <= 0) return empty;

  if (geometry.type === "circle" && geometry.radius) {
    return { long: null, short: null, diameter: geometry.radius * 2 * scale };
  }

  const points = geometry.points ?? [];
  if (points.length < 2) return empty;

  const xs = points.map((p) => p[0]).filter(Number.isFinite);
  const ys = points.map((p) => p[1]).filter(Number.isFinite);
  if (xs.length === 0 || ys.length === 0) return empty;

  const width = (Math.max(...xs) - Math.min(...xs)) * scale;
  const height = (Math.max(...ys) - Math.min(...ys)) * scale;
  if (width <= 0 && height <= 0) return empty;

  return {
    long: Math.max(width, height),
    short: Math.min(width, height),
    diameter: null,
  };
}

function readText(
  attributes: AiDetectedMeasurementElement["attributes"],
  key: string,
): string | null {
  if (!attributes) return null;
  const first = Array.isArray(attributes) ? attributes[0] : attributes;
  const raw = first?.[key];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

/**
 * One AI detection → one row in the audit tables.
 *
 * The API deliberately returns geometry only: lengths and areas are derived
 * server-side from the page scale, while depth and reinforcement "live in
 * sections or schedules" and usually come back absent. Those land as `null`
 * here, which is exactly what drives the Quick Edit "NOT DETECTED" state.
 */
export function mapDetectionToElement(
  detection: AiDetectedMeasurementElement,
  unit: MeasurementUnit,
  scale: number | null = null,
): ExtractedElement {
  const geometryType = detection.geometry?.type ?? "rectangle";
  const page = detection.geometry?.page ?? 1;

  // Attributes first (the model read it off the drawing), then the server's
  // computed figures, then the geometry itself. Only after all three come up
  // empty is a dimension genuinely unknown.
  //
  // Each source has its own unit and they are not interchangeable: attributes
  // are drawing annotations (millimetres unless they say otherwise), while
  // geometry and the server's computed figures come out of the page scale and
  // are therefore in `unit`. Applying one unit to all three is how a 600 mm
  // pile turns into a 600 m one.
  const measured = measureGeometry(detection.geometry, scale);
  const scaled = (value: number | null | undefined) =>
    value == null ? null : toMillimetres(value, unit);
  const annotated = (read: { value: number; unit: MeasurementUnit } | null) =>
    read == null ? null : toMillimetres(read.value, read.unit);

  const lengthMm =
    annotated(readAttributeAny(detection.attributes, ["length", "l", "len"])) ??
    scaled(detection.computed?.length) ??
    scaled(measured.long);

  const widthMm =
    annotated(readAttributeAny(detection.attributes, ["width", "w", "breadth"])) ??
    scaled(measured.short);

  const depthMm = annotated(
    readAttributeAny(detection.attributes, ["depth", "d", "thickness", "height"]),
  );

  const diameterMm =
    annotated(readAttributeAny(detection.attributes, ["diameter", "dia", "ø"])) ??
    scaled(measured.diameter);

  const measureTypeId =
    MEASURE_BY_AI_ELEMENT_TYPE[detection.mapsToElementType ?? ""] ?? "piles";

  return {
    // clientId is the handle the review endpoint accepts, so it is the id we key on.
    id: detection.clientId || detection._id,
    measureTypeId,
    grid:
      readText(detection.attributes, "grid") ??
      readText(detection.attributes, "tag") ??
      detection.label ??
      "—",
    page,
    source: `Pg${page}`,
    confidence: Math.round((detection.confidence ?? 0) * 100),
    status: STATUS_BY_REVIEW[detection.reviewStatus ?? "pending"] ?? "review",
    dimensions: {
      shape: CIRCULAR_MEASURES.has(measureTypeId)
        ? "Circular"
        : (SHAPE_BY_GEOMETRY[geometryType] ?? "Rectangle"),
      length: lengthMm,
      width: widthMm,
      depth: depthMm,
      diameter: diameterMm,
    },
    note: detection.reviewStatus === "pending" ? "Pending review" : undefined,
  };
}

/** Group flat detections the way the Overview tables expect. */
export function groupDetections(
  detections: AiDetectedMeasurementElement[],
  unit: MeasurementUnit,
  scale: number | null = null,
): ExtractedGroup[] {
  const elements = detections.map((d) => mapDetectionToElement(d, unit, scale));
  const byMeasure = new Map<string, ExtractedElement[]>();

  for (const element of elements) {
    const bucket = byMeasure.get(element.measureTypeId) ?? [];
    bucket.push(element);
    byMeasure.set(element.measureTypeId, bucket);
  }

  return [...byMeasure.entries()].map(([measureTypeId, groupElements]) => {
    const pages = [...new Set(groupElements.map((e) => e.page))].sort((a, b) => a - b);
    const label =
      MEASURE_TYPES.find((m) => m.id === measureTypeId)?.label ?? measureTypeId;

    return {
      measureTypeId,
      title: `${label} (${groupElements.length} DETECTED)`,
      pageRange:
        pages.length > 1
          ? `PAGES ${pages[0]}-${pages[pages.length - 1]}`
          : `PAGE ${pages[0] ?? 1}`,
      elements: groupElements,
    };
  });
}

/**
 * The committed BOQ → the report's Bill of Quantity tables.
 *
 * The server's BoqResult carries item / specification / unit / quantity only —
 * it holds no rates or per-item material split. Rates stay blank for the QS to
 * price, and the material columns are left at zero rather than invented.
 */
export function mapBoqResultToSections(result: BoqResult): BoqSection[] {
  return (result.sections ?? []).map((section, sectionIndex) => ({
    id: `boq-${sectionIndex}`,
    title: (section.sectionName ?? `Section ${sectionIndex + 1}`).toUpperCase(),
    count: `(${(section.workItems ?? []).length} items)`,
    itemLabel: "ITEM DESCRIPTION",
    descriptorLabel: "SPECIFICATION",
    items: (section.workItems ?? []).map((workItem, itemIndex) => ({
      id: `boq-${sectionIndex}-${itemIndex}`,
      label: workItem.item ?? `Item ${itemIndex + 1}`,
      descriptor: workItem.specification ?? workItem.notes ?? "",
      qty: workItem.quantity ?? 0,
      unit: workItem.unit ?? "—",
      rate: null,
      concrete: 0,
      rebar: 0,
      formwork: 0,
      excavation: null,
    })),
  }));
}

/**
 * Real job state → the five-step checklist the progress panel renders.
 * The API exposes one job status rather than per-stage progress, so the steps
 * ahead of the current status are shown as done and the rest as pending.
 */
export function buildStepsFromJob(job: AiTakeoffJob | null): ExtractionStep[] {
  const status = job?.status ?? "queued";
  const reached =
    status === "queued" ? 1 : status === "processing" ? 2 : status === "completed" ? 5 : 2;

  const detail = (index: number): string => {
    switch (index) {
      case 0:
        return job?.pageNumber ? `Page ${job.pageNumber} queued for analysis.` : "Queued.";
      case 1:
        // The server names element types by their internal ids (pile_cap,
        // ground_beam …). Surveyors read the tile labels, so show those.
        return job?.requestedElementTypes?.length
          ? `Looking for: ${elementTypeLabels(job.requestedElementTypes)}`
          : "Reading the drawing.";
      case 2:
        // The provider and model are deliberately not surfaced to the user.
        return "Matching detections across the page.";
      case 3:
        return job?.detectedCount != null
          ? `Found ${job.detectedCount} element${job.detectedCount === 1 ? "" : "s"}${
              job.discardedCount ? `, set aside ${job.discardedCount}` : ""
            }.`
          : "Reading each element's size and reference.";
      default:
        return (
          humaniseText(job?.notes) ||
          "Working out lengths, areas and volumes from the page scale."
        );
    }
  };

  return [
    "Scanning Layout Pages",
    "Extracting Specifications",
    "Cross-Page Matching",
    "Extracting Detail Attributes",
    "Calculating Quantities",
  ].map((title, index) => ({
    id: `step-${index}`,
    title,
    detail: detail(index),
    status: status === "failed" && index >= reached
      ? "pending"
      : index < reached
        ? "done"
        : index === reached
          ? "running"
          : "pending",
  }));
}
