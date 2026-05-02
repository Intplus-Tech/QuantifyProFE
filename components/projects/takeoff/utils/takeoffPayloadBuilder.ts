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
  thickness?: number;
  diameter?: number;
  areaReference?: string;
  state?: "isolated" | "continuous";
  reinforcement?: ReinforcementBar[];
  layeredReinforcement?: ReinforcementBar[];
  /** Any extra fields (floorThickness, areaDeduct, …) are persisted as-is */
  [key: string]: unknown;
}

export interface ReinforcementBar {
  /** Used for simple reinforcement (e.g. PF1 example) */
  barMark?: string;
  barCount?: number;
  barType?: string;
  diameter?: number;
  length?: number;
  /** Used for layered reinforcement (e.g. PD1 example with 4 inputs) */
  name?: string;
  centerToCenter?: number[];
  sizeDia?: number[];
  noThus?: number[];
  noInEach?: number[];
  cutLength?: number[];
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
 * Reads multiInput sub-values (_0 … _3) from a row and returns them as an array of numbers.
 */
function readMultiInputArray(row: Record<string, unknown>, fieldKey: string): number[] | undefined {
  const parts = [0, 1, 2, 3]
    .map((i) => toNum(row[`${fieldKey}_${i}`]))
    .filter((val): val is number => val !== undefined);
  
  return parts.length ? parts : undefined;
}

/**
 * Checks if a row is essentially "empty" (no actual measurements filled).
 * We ignore 'id', 'shape', 'state' and only look for numeric or multi-input data.
 */
function isRowEmpty(row: Record<string, unknown>): boolean {
  return !Object.entries(row).some(([key, value]) => {
    if (["id", "shape", "state", "areaReference"].includes(key)) return false;
    if (value === undefined || value === null || value === "") return false;
    // For numeric fields, check if they are valid numbers
    if (NUMERIC_FIELDS.has(key)) {
      const n = Number(value);
      return !isNaN(n);
    }
    // For multi-input fields, they are stored as key_0, key_1...
    if (key.includes("_")) {
      const n = Number(value);
      return !isNaN(n);
    }
    // Any other filled-in field counts as "not empty"
    return true;
  });
}

// ─── Core transformer ────────────────────────────────────────────────────────

/**
 * Converts one UI row object into a backend-ready TakeoffApiElement.
 * @param row   Raw row as stored in tabRows state.
 */
export function buildApiElement(row: Record<string, unknown>): TakeoffApiElement {
  const element: TakeoffApiElement = {
    elementId: String(row.id ?? ""),
    shape: String(row.shape ?? "rectangular").toLowerCase() as "rectangular" | "circular",
  };

  // Coerce known numeric fields
  for (const key of NUMERIC_FIELDS) {
    const val = toNum(row[key]);
    if (val !== undefined) element[key] = val;
  }

  // Pass-through string fields
  if (row.areaReference) element.areaReference = String(row.areaReference);
  if (row.state) element.state = String(row.state).toLowerCase() as "isolated" | "continuous";

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
export function buildElementsPayload(rows: Record<string, unknown>[]): TakeoffElementsPayload | null {
  const filtered = rows.filter((r) => !isRowEmpty(r));
  if (filtered.length === 0) return null;
  return { elements: filtered.map(buildApiElement) };
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
): TakeoffElementsPayload | null {
  // Filter concrete rows that have measurements OR have non-empty reinforcement
  const filteredConcrete = concreteRows.filter((row) => {
    const hasConcreteData = !isRowEmpty(row);
    const reinfRows = reinfRowsMap[String(row.id)] || [];
    const hasReinfData = reinfRows.some((r) => !isRowEmpty(r));
    return hasConcreteData || hasReinfData;
  });

  if (filteredConcrete.length === 0) return null;

  const elements = filteredConcrete.map((row) => {
    const element = buildApiElement(row);
    const groupRows = reinfRowsMap[String(row.id)] ?? [];

    if (groupRows.length > 0) {
      // Check if this member uses layered reinforcement (has multiInput fields)
      const hasMultiInput = groupRows.some(r => 
        REINF_FIELDS.some(f => r[`${f}_0`] !== undefined)
      );

      if (hasMultiInput) {
        element.layeredReinforcement = groupRows.map((r) => {
          const layer: ReinforcementBar = {
            name: String(row.id ?? ""),
          };
          for (const field of REINF_FIELDS) {
            const arr = readMultiInputArray(r, field);
            if (arr) layer[field as keyof ReinforcementBar] = arr as any;
          }
          return layer;
        });
      } else {
        // Simple reinforcement format (e.g. PF1 example)
        element.reinforcement = groupRows.map((r) => ({
          barMark: String(r.barMark || r.id || ""),
          barCount: toNum(r.barCount || r.count || r.noThus),
          barType: String(r.barType || "Y"),
          diameter: toNum(r.diameter || r.sizeDia),
          length: toNum(r.length || r.cutLength),
        }));
      }
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
  
  // 1. First, check if there's a single table under the baseKey (e.g., singleTable: true)
  const singleTableRows = tabRows[baseKey] || [];
  
  for (const row of concreteRows) {
    const id = String(row.id ?? "");
    
    // 2. If it's a single table, filter the rows that match this ID
    if (singleTableRows.length > 0) {
      map[id] = singleTableRows.filter(r => String(r.id) === id);
    } 
    // 3. Fallback: look for ID-specific keys (e.g., "baseKey-BM1")
    else {
      const key = `${baseKey}-${id}`;
      map[id] = tabRows[key] ?? [];
    }
  }
  return map;
}
