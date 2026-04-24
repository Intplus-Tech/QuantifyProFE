/**
 * Manual project creation wizard — API payload types.
 *
 * These types mirror the backend request schemas for each step of the
 * manual-mode wizard. They are intentionally kept separate from
 * types/projects.ts to avoid merge conflicts with AI-flow work.
 */

import { ApiResponse } from "./common";
import { Project } from "./projects";

/**
 * Extends the shared Project type with the processingMode field returned
 * by the backend for manual-mode projects.
 * We keep this isolated here to avoid modifying types/projects.ts
 * (shared with the AI-flow developer).
 */
export interface ManualProject extends Project {
  processingMode: "manual" | "ai" | string;
}

// ─── Step 1: Create Project Shell ────────────────────────────────────────────

export interface CreateManualProjectPayload {
  name: string;
  description?: string;
  source: "manual";
  processingMode: "manual";
  projectCode?: string;
  projectType?: string;
  projectLocation?: string;
  projectPhase?: string;
  duration?: number;
  currency?: string;
  clientName?: string;
  clientId?: string;
  companyId?: string;
  scopeCategories?: string[];
  drawingType?: string[];
}

export type CreateManualProjectResponse = ApiResponse<Project>;

// ─── Step 2: QS Configuration ────────────────────────────────────────────────

/** liftOption values accepted by the backend */
export type LiftOption = "none" | "passenger" | "service" | "both";

/** Pool location values accepted by the backend */
export type PoolLocation = "substructure" | "external";

/** qsProjectType values accepted by the backend */
export type QsProjectType =
  | "piling_alone"
  | "piling_and_substructure"
  | "foundation_and_carcass"
  | "carcass_with_finishes";

export interface GlobalConfiguration {
  defaultConcreteGrade?: string;
  reinforcementCover?: number;
  defaultRebarSizes?: number[];
  defaultBarType?: string;
}

export interface UpdateQsConfigPayload {
  qsProjectType: QsProjectType;
  foundationTypes: string[];
  hasSwimmingPool: boolean;
  poolLocations?: PoolLocation[];
  numberOfFloors: number;
  liftOption: LiftOption;
  globalConfiguration?: GlobalConfiguration;
}

export type UpdateQsConfigResponse = ApiResponse<Project>;

// ─── Step 3: Structural Scope ─────────────────────────────────────────────────
// The backend accepts the full structural scope document for each foundation
// type. We pass the raw wizard Step3Data directly since the backend schema
// matches the frontend representation closely. If divergence grows, add a
// transformer here.

export interface UpsertStructuralScopePayload {
  projectId: string;
  foundationType: string;
  // The body is intentionally typed as a flexible record to accommodate
  // the varying shapes across pile / raft / strip / raft_pile_with_basement
  // foundation types without tightly coupling to each sub-shape here.
  body: Record<string, unknown>;
}

export interface StructuralScopeResponseData {
  projectId: string;
  foundationType: string;
  [key: string]: unknown;
}

export type UpsertStructuralScopeResponse =
  ApiResponse<StructuralScopeResponseData>;

// ─── Step 4: Finishing Configuration ─────────────────────────────────────────

export interface TileEntry {
  typeCode: string;
  description: string;
}

export interface UpdateFinishingPayload {
  finishingSpecifications?: {
    screedingOnDpm?: string;
    meshType?: string;
    ceilingType?: string;
    paintTypeInternally?: string;
    paintTypeExternally?: string;
    riserHeightForStairs?: string;
    skirtingLandingThickness?: string;
  };
  floorTiles?: {
    generalAreas?: TileEntry[];
    wetAreas?: TileEntry[];
    stairsArea?: TileEntry[];
    swimmingPool?: TileEntry[];
    liftWalls?: TileEntry[];
  };
  wallTiles?: {
    internalWalls?: TileEntry[];
    externalWalls?: TileEntry[];
  };
}

export type UpdateFinishingResponse = ApiResponse<Project>;

// ─── Step 5: Financial Metrics ────────────────────────────────────────────────

export interface UpdateMetricsPayload {
  advancePayment?: number;
  fxRate?: number;
  markup?: number;
  retention?: number;
  contingency?: number;
  preliminaries?: number;
}

export type UpdateMetricsResponse = ApiResponse<Project>;
