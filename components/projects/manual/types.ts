// ─── Step 2 ──────────────────────────────────────────────────────────────────

// ─── Step 2 ──────────────────────────────────────────────────────────────────

export interface Step2Data {
  projectName: string;
  clientName: string;
  projectRef: string;
  streetAddress: string;
  currency: string;
  projectType: string;
  projectPhase: string;
  durationMonths: string;
  description: string;
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

export interface ScopeConfig {
  projectType: string;   // "Piling Alone" | "Piling & Substructure" | "Foundation & Carcass Only" | "Carcass with finishes"
  foundationType: string;
  noOfFloors: string;
  lift: string;          // "Yes" | "No"
  hasPool: boolean;
  poolLocation: string;
}

export interface PileSystem {
  gradeOfConcrete: string;
  castingMethod: string;
  castingLabour: string;
  depth: string;
  diameter: string;
  centerToCenter: string;
  plasticizers: string;
  mainBarNo: string;
  mainBarSize: string;
  ringBarSize: string;
  rebarDepth: string;
}

export interface ConcreteElement {
  gradeOfConcrete: string;
  plasticizers: string;
  waterproofing: string;
  castingMethod: string;
  castingLabourMethod: string;
  wastePercent: string;
}

export interface BlindingElement {
  gradeOfConcrete: string;
  plasticizers?: string;
  waterproof?: string;
  castingMethod: string;
  castingLabourMethod?: string;
  wastePercent: string;
  blindingThickness: string;
}

export interface SubstructureLayer {
  thicknessMm: string;
  wastePercent: string;
}

export interface SubstructureFooting {
  gradeOfConcrete: string;
  plasticizers: string;
  waterproof: string;
  castingType: string;
  castingLabourMethod: string;
  wastePercent: string;
}

export interface SubstructureConcreteElement {
  gradeOfConcrete: string;
  plasticizers: string;
  waterproof: string;
  formworkType: string;
  blockTypeOfFormwork: string;
  blockworkFilling: string;
  castingMethod: string;
  castingLabourMethod: string;
  castingFillingMethod: string;
  wastePercent: string;
}

export interface SubstructureFrameElement {
  gradeOfConcrete: string;
  plasticizers: string;
  waterproof: string;
  formworkType: string;
  castingMethod: string;
  castingLabourMethod: string;
  wastePercent: string;
}

export interface SubstructureData {
  layers: {
    totalFillingThickness: SubstructureLayer;
    lateriteThickness: SubstructureLayer;
    hardcoreThickness: SubstructureLayer;
  };
  columnFooting: SubstructureFooting;
  elements: Record<string, SubstructureConcreteElement>;
  pileCapFrames: SubstructureFrameElement;
  blockworkInStripFoundation: {
    blockworkForFormwork: string;
    blockworkFilling: string;
  };
}

export interface Step3Data {
  scopeConfig: ScopeConfig;
  pileSystem: PileSystem;
  blinding: Record<string, BlindingElement>;
  substructure: SubstructureData;
  superstructure: Record<string, ConcreteElement>;
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────

export interface FinishingSpecifications {
  screedingOnDPM: string;
  meshType: string;
  ceilingType: string;
  roofParapetWall: string;
  paintTypeInternally: string;
  paintTypeExternally: string;
  riserHeightForStairs: string;
  skirtingLandingThickness: string;
}

export interface TileTypeRow {
  typeCode: string;
  description: string;
}

export interface Step4Data {
  specifications: FinishingSpecifications;
  floorTiles: {
    generalAreas: TileTypeRow[];
    wetAreas: TileTypeRow[];
    stairsArea: TileTypeRow[];
    swimmingPool: TileTypeRow[];
    liftWalls: TileTypeRow[];
  };
  wallTiles: {
    internalWalls: TileTypeRow[];
    externalWalls: TileTypeRow[];
  };
}

// ─── Step 5 ──────────────────────────────────────────────────────────────────

export interface Step5Data {
  advancePayment: string;
  fxRate: string;
  markup: string;
  retention: string;
  contingency: string;
  preliminaries: string;
}

// ─── Full Wizard State ────────────────────────────────────────────────────────

export interface WizardState {
  step2: Step2Data;
  scope: Step3Data;
  finishing: Step4Data;
  metrics: Step5Data;
}
