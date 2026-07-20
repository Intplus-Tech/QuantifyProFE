/**
 * Manual project creation wizard — payload transformer utilities.
 *
 * These functions map the frontend WizardState (from Redux) into the exact
 * request body schemas that the backend API expects. All transformations are
 * co-located here so ManualSetupShell.tsx stays clean.
 */

import {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  ScopeConfig,
  ConcreteElement,
  BlindingElement,
} from "./types";
import { getFoundationSectionPlan } from "./constants";
import {
  CreateManualProjectPayload,
  UpdateQsConfigPayload,
  UpdateFinishingPayload,
  UpdateMetricsPayload,
  LiftOption,
  QsProjectType,
  PoolLocation,
} from "@/types/manualProject";

// ─── Step 1: Project Shell ────────────────────────────────────────────────────

/**
 * Maps UI projectPhase display labels → backend enum values.
 * Backend enum: 'pre_contract' | 'post_contract' | 'design' | 'construction'
 * UI labels come from PROJECT_PHASES in constants.ts.
 */
function toProjectPhase(uiValue: string): string {
  const map: Record<string, string> = {
    "Pre-Contract": "pre_contract",
    "Post-Contract": "post_contract",
    "Design": "design",
    "Construction": "construction",
  };
  return map[uiValue] ?? uiValue.toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Maps UI projectType display labels → backend enum values.
 * UI labels come from PROJECT_TYPES in constants.ts.
 */
function toProjectType(uiValue: string): string {
  const map: Record<string, string> = {
    "Residential": "residential",
    "Commercial": "commercial",
    "Infrastructure": "infrastructure",
    "Industrial": "industrial",
    "Mixed Use": "mixed_use",
  };
  return map[uiValue] ?? uiValue.toLowerCase().replace(/[\s-]+/g, "_");
}

export function buildCreateProjectPayload(
  step2: Step2Data,
  drawingIds?: string[],
): CreateManualProjectPayload {
  return {
    name: step2.projectName,
    description: step2.description || undefined,
    source: "manual",
    processingMode: "manual",
    projectCode: step2.projectRef || undefined,
    projectType: step2.projectType ? toProjectType(step2.projectType) : undefined,
    projectLocation: step2.streetAddress || undefined,
    projectPhase: step2.projectPhase ? toProjectPhase(step2.projectPhase) : undefined,
    duration: step2.durationMonths ? Number(step2.durationMonths) : undefined,
    currency: step2.currency || undefined,
    clientName: step2.clientName || undefined,
    drawings: drawingIds?.length ? drawingIds : undefined,
  };
}

// ─── Step 2: QS Configuration ─────────────────────────────────────────────────

/**
 * Maps the UI "project type" label to the backend enum value.
 * UI values come from the Step 3 ScopeConfig.projectType dropdown.
 */
function toQsProjectType(uiValue: string): QsProjectType {
  const map: Record<string, QsProjectType> = {
    "Piling Alone": "piling_alone",
    "Piling & Substructure": "piling_and_substructure",
    "Foundation & Carcass Only": "foundation_and_carcass",
    "Carcass with Finishes": "carcass_with_finishes",
    "Carcass with finishes": "carcass_with_finishes", // match constants.ts casing
  };
  return map[uiValue] ?? "foundation_and_carcass";
}

/**
 * Converts the UI lift value ("Yes"/"No" or a specific type) to the
 * backend liftOption enum.
 */
function toLiftOption(uiValue: string): LiftOption {
  const map: Record<string, LiftOption> = {
    No: "none",
    None: "none",
    Passenger: "passenger",
    Service: "service",
    Both: "both",
    Yes: "passenger", // legacy fallback — treat "Yes" as passenger
  };
  return map[uiValue] ?? "none";
}

function toPoolLocations(uiValue: string): PoolLocation[] {
  const map: Record<string, PoolLocation[]> = {
    Substructure: ["substructure"],
    External: ["external"],
    Both: ["substructure", "external"],
  };
  return map[uiValue] ?? [];
}

/**
 * Maps UI foundation type labels → backend enum values.
 * Backend expects: 'pile' | 'raft' | 'strip' | 'raft_pile_with_basement'
 */
function toFoundationType(uiValue: string): string {
  const map: Record<string, string> = {
    "Pile": "pile",
    "Raft": "raft",
    "Strip": "strip",
    "Raft Pile with Basement": "raft_pile_with_basement",
    "Raft Pile With Basement": "raft_pile_with_basement",
  };
  // Fallback: lowercase + replace spaces with underscores
  return map[uiValue] ?? uiValue.toLowerCase().replace(/\s+/g, "_");
}

export function buildQsConfigPayload(
  scopeConfig: ScopeConfig
): UpdateQsConfigPayload {
  const payload: UpdateQsConfigPayload = {
    qsProjectType: toQsProjectType(scopeConfig.projectType),
    foundationTypes: [toFoundationType(scopeConfig.foundationType)],
    hasSwimmingPool: scopeConfig.hasPool,
    numberOfFloors: Number(scopeConfig.noOfFloors) || 1,
    liftOption: toLiftOption(scopeConfig.lift),
  };

  if (scopeConfig.hasPool && scopeConfig.poolLocation) {
    payload.poolLocations = toPoolLocations(scopeConfig.poolLocation);
  }

  return payload;
}

/**
 * Returns the normalized (backend-safe) foundation type for use in
 * path params (e.g. PUT /structural-scope/:foundationType).
 */
export function normaliseFoundationType(uiValue: string): string {
  return toFoundationType(uiValue);
}

// ─── Step 3: Structural Scope ─────────────────────────────────────────────────

/**
 * Converts string numeric fields to numbers for the backend.
 * The wizard stores all user inputs as strings for controlled input
 * compatibility, but the API expects number types.
 */
function parseNumeric(val: string | undefined): number | undefined {
  if (val === undefined || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function normalisePileSystem(pile: Step3Data["pileSystem"]) {
  return {
    gradeOfConcrete: pile.gradeOfConcrete || undefined,
    castingMethod: pile.castingMethod || undefined,
    castingLabour: pile.castingLabour || undefined,
    depth: parseNumeric(pile.depth),
    diameter: parseNumeric(pile.diameter),
    centerToCenter: parseNumeric(pile.centerToCenter),
    plasticizers: pile.plasticizers || undefined,
    mainBarNo: parseNumeric(pile.mainBarNo),
    mainBarSize: parseNumeric(pile.mainBarSize),
    ringBarSize: parseNumeric(pile.ringBarSize),
    rebarDepth: parseNumeric(pile.rebarDepth),
  };
}

function normaliseConcreteElement(el: {
  gradeOfConcrete: string;
  plasticizers: string;
  waterproofing: string;
  castingMethod: string;
  castingLabourMethod: string;
  wastePercent: string;
}) {
  return {
    gradeOfConcrete: el.gradeOfConcrete || undefined,
    plasticizers: el.plasticizers || undefined,
    waterproofing: el.waterproofing || undefined,
    castingMethod: el.castingMethod || undefined,
    castingLabourMethod: el.castingLabourMethod || undefined,
    wastePercent: parseNumeric(el.wastePercent),
  };
}

export function buildStructuralScopeBody(
  scope: Step3Data
): Record<string, unknown> {
  const foundationType = normaliseFoundationType(scope.scopeConfig.foundationType);
  const foundationPlan = getFoundationSectionPlan(foundationType);

  // Helper: convert our Record<string, ConcreteElement> -> backend array
  const mapConcreteRecordToArray = (
    rec: Record<string, ConcreteElement>
  ): Array<Record<string, unknown>> => {
    return Object.entries(rec).map(([key, el]) => {
      const norm = normaliseConcreteElement(el as any);
      return {
        elementType: key,
        concreteGrade: norm.gradeOfConcrete,
        plasticizers: norm.plasticizers,
        waterproofing: norm.waterproofing,
        castingMethod: norm.castingMethod,
        castingLabourMethod: norm.castingLabourMethod,
        wastePercentage: norm.wastePercent,
      };
    });
  };

  // Start building backend-shaped payload
  const payload: Record<string, unknown> = {
    superstructureElements: mapConcreteRecordToArray(scope.superstructure),
  };

  if (foundationPlan.needsPileSystem) {
    const p = normalisePileSystem(scope.pileSystem);
    payload.pileSpecification = {
      concreteGrade: p.gradeOfConcrete,
      castingMethod: p.castingMethod,
      castingLabourMethod: p.castingLabour,
      depth: p.depth,
      diameter: p.diameter,
      centerToCenter: p.centerToCenter,
      plasticizers: p.plasticizers,
      mainBarNo: p.mainBarNo,
      mainBarSize: p.mainBarSize,
      ringBarSize: p.ringBarSize,
      rebarDepth: p.rebarDepth,
    };
  }

  if (foundationPlan.needsBlinding) {
    payload.blindingElements = Object.entries(scope.blinding).map(
      ([key, el]) => ({
        elementType: key,
        concreteGrade: el.gradeOfConcrete || undefined,
        castingMethod: el.castingMethod || undefined,
        wastePercentage: parseNumeric(el.wastePercent),
        blindingThickness: parseNumeric(el.blindingThickness),
      })
    );
  }

  if (foundationPlan.needsSubstructure) {
    const sub = scope.substructure;
    // convert thicknessMm -> thickness (m)
    const toMetres = (mm?: number) => (mm === undefined ? undefined : mm / 1000);

    payload.substructureFilling = {
      totalFilling: {
        thickness: toMetres(
          parseNumeric(sub.layers.totalFillingThickness.thicknessMm)
        ),
        wastePercentage: parseNumeric(sub.layers.totalFillingThickness.wastePercent),
      },
      laterite: {
        thickness: toMetres(parseNumeric(sub.layers.lateriteThickness.thicknessMm)),
        wastePercentage: parseNumeric(sub.layers.lateriteThickness.wastePercent),
      },
      hardcore: {
        thickness: toMetres(parseNumeric(sub.layers.hardcoreThickness.thicknessMm)),
        wastePercentage: parseNumeric(sub.layers.hardcoreThickness.wastePercent),
      },
    };

    payload.substructureElements = Object.entries(sub.elements).map(
      ([key, el]) => ({
        elementType: key,
        concreteGrade: el.gradeOfConcrete || undefined,
        plasticizers: el.plasticizers || undefined,
        waterproofing: el.waterproof || undefined,
        formworkType: el.formworkType || undefined,
        blockTypeOfFormwork: el.blockTypeOfFormwork || undefined,
        blockworkFilling: el.blockworkFilling || undefined,
        castingMethod: el.castingMethod || undefined,
        castingLabourMethod: el.castingLabourMethod || undefined,
        castingFillingMethod: el.castingFillingMethod || undefined,
        wastePercentage: parseNumeric(el.wastePercent),
      })
    );

    // columnFooting is removed because backend no longer expects it for raft/strip/raft_pile_with_basement
  }

  return payload;
}

// ─── Step 4: Finishing ────────────────────────────────────────────────────────

export function buildFinishingPayload(
  finishing: Step4Data
): UpdateFinishingPayload {
  return {
    finishingSpecifications: {
      screedingOnDpm: finishing.specifications.screedingOnDPM || undefined,
      meshType: finishing.specifications.meshType || undefined,
      ceilingType: finishing.specifications.ceilingType || undefined,
      paintTypeInternally: finishing.specifications.paintTypeInternally || undefined,
      paintTypeExternally: finishing.specifications.paintTypeExternally || undefined,
      riserHeightForStairs: finishing.specifications.riserHeightForStairs || undefined,
      skirtingLandingThickness:
        finishing.specifications.skirtingLandingThickness || undefined,
    },
    floorTiles: {
      generalAreas: finishing.floorTiles.generalAreas,
      wetAreas: finishing.floorTiles.wetAreas,
      stairsArea: finishing.floorTiles.stairsArea,
      swimmingPool: finishing.floorTiles.swimmingPool,
      liftWalls: finishing.floorTiles.liftWalls,
    },
    wallTiles: {
      internalWalls: finishing.wallTiles.internalWalls,
      externalWalls: finishing.wallTiles.externalWalls,
    },
  };
}

// ─── Step 5: Financial Metrics ────────────────────────────────────────────────

export function buildMetricsPayload(metrics: Step5Data): UpdateMetricsPayload {
  return {
    advancePayment: parseNumeric(metrics.advancePayment),
    fxRate: parseNumeric(metrics.fxRate),
    markup: parseNumeric(metrics.markup),
    retention: parseNumeric(metrics.retention),
    contingency: parseNumeric(metrics.contingency),
    preliminaries: parseNumeric(metrics.preliminaries),
  };
}
