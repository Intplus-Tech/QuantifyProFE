/**
 * Takeoff Config Type Definitions
 * ─────────────────────────────────────────────────────────────────────────────
 * These interfaces describe the shape of every page in the Takeoff workspace.
 * The rendering engine (TakeoffItemView.tsx) reads these objects and builds
 * the UI automatically — you only need to define the data here.
 *
 * Quick-start guide for new developers:
 *  1. Open the relevant section file (e.g. superstructure.ts / finishing.ts).
 *  2. Add a new `if` block matching your section + item slug.
 *  3. Return a TakeoffConfig object following the patterns already in the file.
 *  4. Register the route in ProjectWorkspaceLayout.tsx (substructureItems array).
 *  5. Done — no changes needed to TakeoffItemView.tsx.
 */

// ─── Column ──────────────────────────────────────────────────────────────────

export interface TakeoffColumn {
  /** Unique key used to read/write the value in row state. */
  key: string;
  /** Header text displayed in the table. */
  label: string;
  /**
   * If true, the cell shows the row ID and cannot be edited.
   * Always set this on the first `{ key: "id" }` column.
   */
  readonly?: boolean;
  /**
   * If true, the cell is highlighted green when complete, orange when empty.
   * Use this on every data-entry column so completion status is visible.
   */
  highlight?: boolean;
  /** Renders a <select> dropdown instead of a text input. */
  type?: "text" | "number" | "select";
  /** Required when type === "select". List of option strings. */
  options?: string[];
  /**
   * If true, the cell renders FOUR small input boxes side-by-side.
   * When all four are filled the display collapses to "v1 - v2 - v3 - v4".
   * Use this for reinforcement columns (Center to Center, Size-Dia, etc.).
   */
  multiInput?: boolean;
}

// ─── Table (used inside a sub-tab that has multiple sibling tables) ───────────

export interface TakeoffTableConfig {
  /** Unique ID within the sub-tab, e.g. "beam" or "column". */
  id: string;
  /** Label shown as the table header, e.g. "BEAM" or "COLUMN". */
  label: string;
  columns: TakeoffColumn[];
  /** Rows pre-seeded in the table on first load. */
  defaultRows: Record<string, any>[];
  /**
   * Prefix used when auto-generating new row IDs via "Add Row".
   * e.g. prefix "BM" → BM1, BM2, BM3 …
   */
  prefix: string;
  /**
   * Backend elementType value used when POSTing rows from this table.
   * e.g. "beam", "column_in_foundation"
   */
  elementType?: string;
}

// ─── Sub-Tab ─────────────────────────────────────────────────────────────────

export interface TakeoffSubTab {
  /** Unique ID within the parent tab, e.g. "concrete-formwork". */
  id: string;
  /** Label shown on the sub-tab button. */
  label: string;
  /**
   * Backend elementType value used when POSTing rows from this sub-tab.
   * e.g. "pile_cap", "strip_foundation"
   */
  elementType?: string;

  // ── Option A: single flat table ──────────────────────────────────────────
  /** Columns for this sub-tab's single table. */
  columns?: TakeoffColumn[];
  /** Pre-seeded rows for the single table. */
  defaultRows?: Record<string, any>[];

  // ── Option B: multiple sibling tables (e.g. BEAM + COLUMN) ───────────────
  /**
   * Use `tables` instead of `columns`/`defaultRows` when a sub-tab needs
   * to render more than one independent table (e.g. BEAM and COLUMN).
   */
  tables?: TakeoffTableConfig[];

  // ── Bending Summary ───────────────────────────────────────────────────────
  /**
   * Shows the "Bending Summary" button in the top-right.
   * When the user fills and saves the modal, the reinforcement tables are
   * replaced with a single summary row (Y6, Y8, Y10 … TOTAL kg / tons).
   */
  hasBendingSummary?: boolean;

  // ── Dynamic grouping (Reinforcement tabs) ─────────────────────────────────
  /**
   * ID of the sibling sub-tab whose rows drive this sub-tab's group headers.
   * e.g. "concrete-formwork" → one table per row in the Concrete & Formwork tab.
   */
  groupedBy?: string;
  /**
   * Human-readable prefix for each group header.
   * e.g. "PILE CAP" renders "PILE CAP 1", "PILE CAP 2" …
   */
  groupLabelPrefix?: string;
  /**
   * ID prefix for row IDs within each group.
   * e.g. "PC" renders rows as PC1-1, PC1-2 …
   */
  groupIdPrefix?: string;

  /**
   * If true, the grouped rows are rendered in a single unified table instead
   * of multiple separate tables per group.
   */
  singleTable?: boolean;

  // ── Option C: Nested sub-tabs (3-level hierarchy) ────────────────────────
  /**
   * Use `subTabs` within a sub-tab to create another level of navigation.
   * e.g. Level (Tab) -> Member (Sub-Tab) -> Action (Sub-Sub-Tab)
   */
  subTabs?: TakeoffSubTab[];
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export interface TakeoffTab {
  /** Unique ID for this top-level tab, e.g. "excavation-clearing". */
  id: string;
  /** Short label shown on the tab button in the header navigation. */
  label: string;
  /** Full title shown in the content area header. */
  title: string;
  /** Subtitle shown below the title. */
  subtitle: string;
  /** Lucide icon component reference. Import from "lucide-react". */
  icon: any;
  /**
   * Backend elementType value used when POSTing rows from this flat tab.
   * e.g. "excavation_clearing", "ddt_pad_pit_in_strip"
   * Not needed when the tab uses subTabs (each subTab carries its own elementType).
   */
  elementType?: string;

  // ── Option A: simple flat table (no sub-tabs) ────────────────────────────
  columns?: TakeoffColumn[];
  defaultRows?: Record<string, any>[];

  // ── Option B: sub-tabs (e.g. Concrete & Formwork + Reinforcement) ─────────
  subTabs?: TakeoffSubTab[];

  // ── Option C: multiple sibling tables directly on the tab (rare) ──────────
  tables?: TakeoffTableConfig[];

  // ── Inherited from sub-tab (used when tab itself is the grouped table) ────
  hasBendingSummary?: boolean;
  groupedBy?: string;
  groupLabelPrefix?: string;
  groupIdPrefix?: string;
  singleTable?: boolean;
}

// ─── Top-level config ────────────────────────────────────────────────────────

export interface TakeoffConfig {
  /** Array of top-level tabs rendered in the horizontal navigation. */
  tabs: TakeoffTab[];
}
