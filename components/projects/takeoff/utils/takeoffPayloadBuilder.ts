/**
 * Takeoff Payload Builder
 * ─────────────────────────────────────────────────────────────────────────────
 * Transforms the flat row objects stored in UI state into the exact shape that
 * PUT /takeoff/{projectId}/elements/{elementType} expects.
 *
 * Key responsibilities:
 *  1. Rename `id` → `elementId`
 *  2. Coerce numeric strings to numbers (length, width, depth, count, etc.)
 *  3. Merge concrete-row reinforcement groups into the element's `reinforcement` array
 *  4. Pass-through any extra fields (floorThickness, areaDeduct, …) as-is
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TakeoffApiElement {
  elementId: string;
  shape: "rectangular" | "circular";
  count?: number;
  nr?: number;
  length?: number;
  width?: number;
  depth?: number;
  diameter?: number;
  areaReference?: string;
  state?: "isolated" | "continuous";
  reinforcement?: ReinforcementBar[];
  layeredReinforcement?: ReinforcementBar[];
  /** Any extra fields (floorThickness, areaDeduct, …) are persisted as-is */
  [key: string]: unknown;
}

export interface ReinforcementBar {
  /** The four multiInput values joined, e.g. "150-150-150-150" */
  centerToCenter?: string;
  sizeDia?: string;
  noInEach?: string;
  cutLength?: string;
  /** raw sub-values if needed */
  [key: string]: unknown;
}

export interface TakeoffElementsPayload {
  elements: TakeoffApiElement[];
}

// ─── Numeric field names that need type coercion ─────────────────────────────

const NUMERIC_FIELDS = new Set([
  "count", "nr", "length", "width", "depth", "diameter",
  "height", "thickness", "numberOfPiles",
  "floorThickness", "fillingThickness", "wallThickness", "pitDepth",
  "blockworkWidth", "blockworkHeight", "colBLength", "colBWidth",
  "stripThickness", "numberOfBranches", "lin", "areaToBeDeducted",
]);

// ─── Reinforcement multiInput field names ─────────────────────────────────────

const REINF_FIELDS = ["centerToCenter", "sizeDia", "noThus", "noInEach", "cutLength"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(val: unknown): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

/**
 * Reads multiInput sub-values (_0 … _3) from a row and collapses them
 * into a single "v0 - v1 - v2 - v3" string for the reinforcement payload.
 */
function readMultiInput(row: Record<string, unknown>, fieldKey: string): string | undefined {
  const parts = [0, 1, 2, 3].map((i) => String(row[`${fieldKey}_${i}`] ?? "")).filter(Boolean);
  return parts.length ? parts.join(" - ") : undefined;
}

// ─── Core transformer ────────────────────────────────────────────────────────

/**
 * Converts one UI row object into a backend-ready TakeoffApiElement.
 * @param row   Raw row as stored in tabRows state.
 */
export function buildApiElement(row: Record<string, unknown>): TakeoffApiElement {
  const element: TakeoffApiElement = {
    elementId: String(row.id ?? ""),
    shape: (row.shape as "rectangular" | "circular") ?? "rectangular",
  };

  // Coerce known numeric fields
  for (const key of NUMERIC_FIELDS) {
    const val = toNum(row[key]);
    if (val !== undefined) element[key] = val;
  }

  // Pass-through string fields
  if (row.areaReference) element.areaReference = String(row.areaReference);
  if (row.state) element.state = row.state as "isolated" | "continuous";

  // Pass-through any other extra fields (floorThickness stored as text, areaDeduct, etc.)
  const handled = new Set([
    "id", "shape", "areaReference", "state", ...NUMERIC_FIELDS, ...REINF_FIELDS.flatMap(f => [f, `${f}_0`, `${f}_1`, `${f}_2`, `${f}_3`]),
  ]);
  for (const [key, value] of Object.entries(row)) {
    if (!handled.has(key) && value !== undefined && value !== "") {
      element[key] = value;
    }
  }

  return element;
}

/**
 * Builds the full payload for PUT /takeoff/{projectId}/elements/{elementType}.
 * @param rows  Concrete-formwork rows (each becomes one element).
 */
export function buildElementsPayload(rows: Record<string, unknown>[]): TakeoffElementsPayload {
  return { elements: rows.map(buildApiElement) };
}

/**
 * Builds a payload where each element also carries its reinforcement bars.
 *
 * @param concreteRows   Rows from the Concrete & Formwork subtab.
 * @param reinfRowsMap   Map of { [concreteRowId]: reinforcementRows[] }
 *                       Built by grouping the reinforcement subtab rows by their
 *                       group key (e.g. "PC1", "PC2").
 */
export function buildElementsWithReinforcement(
  concreteRows: Record<string, unknown>[],
  reinfRowsMap: Record<string, Record<string, unknown>[]>,
): TakeoffElementsPayload {
  const elements = concreteRows.map((row) => {
    const element = buildApiElement(row);
    const groupRows = reinfRowsMap[String(row.id)] ?? [];

    if (groupRows.length > 0) {
      element.reinforcement = groupRows.map((r) => {
        const bar: ReinforcementBar = {};
        for (const field of REINF_FIELDS) {
          const collapsed = readMultiInput(r as Record<string, unknown>, field);
          if (collapsed) bar[field] = collapsed;
        }
        return bar;
      });
    }

    return element;
  });

  return { elements };
}

/**
 * Groups reinforcement rows from tabRows state by their parent concrete row ID.
 *
 * The UI stores grouped reinforcement rows under keys like:
 *   "{tabId}-{subTabId}-{concreteRowId}"  (e.g. "pad-concrete-reinforcement-PC1")
 *
 * @param tabRows       Full tabRows state object.
 * @param baseKey       The prefix used for group keys, e.g. "pad-concrete-reinforcement".
 * @param concreteRows  The parent concrete rows (to know which IDs to look for).
 */
export function extractReinfRowsMap(
  tabRows: Record<string, Record<string, unknown>[]>,
  baseKey: string,
  concreteRows: Record<string, unknown>[],
): Record<string, Record<string, unknown>[]> {
  const map: Record<string, Record<string, unknown>[]> = {};
  for (const row of concreteRows) {
    const id = String(row.id ?? "");
    const key = `${baseKey}-${id}`;
    map[id] = tabRows[key] ?? [];
  }
  return map;
}
