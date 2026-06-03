import type {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  ScopeConfig,
  PileSystem,
  BlindingElement,
  ConcreteElement,
  SubstructureLayer,
  SubstructureFooting,
  SubstructureConcreteElement,
  SubstructureFrameElement,
  SubstructureData,
} from "./types";

// ─── Stepper config ───────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { id: 1, label: "Project Details", subtitle: "Info & location" },
  { id: 2, label: "Drawings", subtitle: "Upload files" },
] as const;

// ─── Foundation type map ──────────────────────────────────────────────────────

export const FOUNDATION_TYPE_MAP: Record<string, string[]> = {
  "Piling Alone": ["Pile"],
  "Piling & Substructure": ["Pile", "Raft Pile with Basement"],
  "Foundation & Carcass Only": ["Pile", "Raft", "Strip", "Raft Pile with Basement"],
  "Carcass with finishes": ["Pile", "Raft", "Strip", "Raft Pile with Basement"],
};

// ─── Tab derivation ───────────────────────────────────────────────────────────

export function getScopeTabs(projectType: string, foundationType?: string): string[] {
  const foundationPlan = getFoundationSectionPlan(foundationType);
  let tabs: string[] = [];
  switch (projectType) {
    case "Piling Alone":
      tabs = foundationPlan.needsPileSystem
        ? ["pile-system", "superstructure"]
        : ["superstructure"];
      break;
    case "Piling & Substructure":
      tabs = foundationPlan.needsPileSystem
        ? ["pile-system", "blinding", "substructure", "superstructure"]
        : ["blinding", "substructure", "superstructure"];
      break;
    case "Foundation & Carcass Only":
      if (foundationPlan.isPile) {
        tabs = ["pile-system", "superstructure"];
      } else if (foundationPlan.isRaftPileWithBasement) {
        tabs = ["pile-system", "blinding", "substructure", "superstructure"];
      } else {
        tabs = ["blinding", "substructure", "superstructure"];
      }
      break;
    case "Carcass with finishes":
      if (foundationPlan.isPile) {
        tabs = ["pile-system", "superstructure"];
      } else if (foundationPlan.isRaftPileWithBasement) {
        tabs = ["pile-system", "blinding", "substructure", "superstructure"];
      } else {
        tabs = ["blinding", "substructure", "superstructure"];
      }
      break;
    default:
      tabs = foundationPlan.needsPileSystem
        ? ["pile-system", "superstructure"]
        : ["blinding", "substructure", "superstructure"];
  }

  return tabs;
}

export function getFirstTabLabel(foundationType: string): string {
  if (foundationType === "Pile") return "Pile System & Concrete Details";
  if (foundationType === "Raft") return "Raft System & Concrete Details";
  if (foundationType === "Strip") return "Strip Foundation & Concrete Details";
  if (foundationType === "Raft Pile with Basement") return "Raft Pile System & Concrete Details";
  return "Foundation System & Concrete Details";
}

export const TAB_LABELS: Record<string, string> = {
  blinding: "Blinding",
  substructure: "Substructure",
  superstructure: "Superstructure",
};

// ─── Dropdown options ─────────────────────────────────────────────────────────

export const CONCRETE_GRADES = ["Grade 30", "Grade 25", "Grade 20", "Grade 15"];
export const CASTING_METHODS = ["RMC", "Traditional"];
export const CASTING_LABOUR = ["Hydro Rig", "Traditional"];
export const PLASTICIZERS = ["Yes", "No"];
export const WATERPROOFING_OPTS = ["None", "Membrane", "Crystalline", "Tanking"];
export const LIFT_OPTIONS = ["Yes", "No"];
export const POOL_LOCATIONS = ["Substructure", "Superstructure", "External"];
export const DRAWING_CATEGORIES = ["Architectural", "Structural", "MEP", "Civil", "Electrical"];
export const SUBSTRUCTURE_FORMWORK_TYPES = ["Block", "Timber"];
export const SUBSTRUCTURE_BLOCK_TYPES = ["100mm", "150mm", "225mm", "Nil"];
export const SUBSTRUCTURE_BLOCKWORK_FILLINGS = ["Filled solid with frames", "Solid", "Hollow", "Nil"];
export const SUBSTRUCTURE_STRIP_BLOCKWORK_FORMWORKS = ["150mm block"];
export const SUBSTRUCTURE_CASTING_TYPES = ["RMC", "Traditional"];
export const SUBSTRUCTURE_CASTING_METHODS = ["RMC", "Traditional", "RMC with pump"];

export const CURRENCIES = [
  { value: "NGN", label: "Naira (₦)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "EUR", label: "Euro (€)" },
];

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Infrastructure",
  "Industrial",
  "Mixed Use",
];

export const PROJECT_PHASES = [
  "Pre-Contract",
  "Post-Contract",
  "Design",
  "Construction",
];

export const SCOPE_PROJECT_TYPES = [
  "Piling Alone",
  "Piling & Substructure",
  "Foundation & Carcass Only",
  "Carcass with finishes",
];

export function getFoundationSectionPlan(foundationType?: string) {
  const normalizedFoundation = foundationType?.toLowerCase().replace(/\s+/g, "_");
  const isPile = normalizedFoundation === "pile";
  const isRaftPileWithBasement = normalizedFoundation === "raft_pile_with_basement";
  const isRaft = normalizedFoundation === "raft";
  const isStrip = normalizedFoundation === "strip";

  return {
    normalizedFoundation,
    isPile,
    isRaftPileWithBasement,
    isRaft,
    isStrip,
    needsPileSystem: isPile || isRaftPileWithBasement,
    needsBlinding: isRaftPileWithBasement || isRaft || isStrip,
    needsSubstructure: isRaftPileWithBasement || isRaft || isStrip,
  };
}

// Finishing dropdowns (placeholder options — replace with real values)
export const SCREEDING_OPTIONS = ["Yes", "No"];
export const MESH_TYPES = ["A142", "A193", "A252", "A393"];
export const CEILING_TYPES = ["Suspended", "False", "Direct", "None"];
export const PARAPET_WALL_OPTIONS = ["Yes", "No"];
export const PAINT_TYPES = ["Emulsion", "Gloss", "Satin", "Matt", "Textured"];
export const RISER_HEIGHTS = ["150mm", "175mm", "200mm", "225mm"];
export const SKIRTING_THICKNESSES = ["12mm", "18mm", "25mm", "32mm"];

// ─── Blinding elements ────────────────────────────────────────────────────────

export const BLINDING_ELEMENTS_ALWAYS = ["Pile Cap", "Ground Beam", "Oversite Slab"];
export const SUBSTRUCTURE_ELEMENTS_ALWAYS = [
  "Pile Cap",
  "Ground Beam",
  "Oversite Slab",
  "Column in Foundation",
  "Shear Wall",
];
export const SUPERSTRUCTURE_ELEMENTS_ALWAYS = [
  "Column",
  "Lintels",
  "Beam",
  "Stairs",
  "Slab",
  "Shear Wall",
  "Roof Column",
  "Kitchen countertop & fixtures",
  "Roof Beam",
];

// ─── Default state factories ──────────────────────────────────────────────────

export function defaultBlindingElement(): BlindingElement {
  return {
    gradeOfConcrete: "",
    plasticizers: "",
    waterproof: "",
    castingMethod: "",
    castingLabourMethod: "",
    wastePercent: "",
    blindingThickness: "",
  };
}

export function defaultConcreteElement(): ConcreteElement {
  return { gradeOfConcrete: "", plasticizers: "", waterproofing: "", castingMethod: "", castingLabourMethod: "", wastePercent: "" };
}

export function defaultSubstructureLayer(): SubstructureLayer {
  return { thicknessMm: "", wastePercent: "" };
}

export function defaultSubstructureFooting(): SubstructureFooting {
  return {
    gradeOfConcrete: "",
    plasticizers: "",
    waterproof: "",
    castingType: "",
    castingLabourMethod: "",
    wastePercent: "",
  };
}

export function defaultSubstructureConcreteElement(): SubstructureConcreteElement {
  return {
    gradeOfConcrete: "",
    plasticizers: "",
    waterproof: "",
    formworkType: "",
    blockTypeOfFormwork: "",
    blockworkFilling: "",
    castingMethod: "",
    castingLabourMethod: "",
    castingFillingMethod: "",
    wastePercent: "",
  };
}

export function defaultSubstructureFrameElement(): SubstructureFrameElement {
  return {
    gradeOfConcrete: "",
    plasticizers: "",
    waterproof: "",
    formworkType: "",
    castingMethod: "",
    castingLabourMethod: "",
    wastePercent: "",
  };
}

export function defaultSubstructureData(): SubstructureData {
  return {
    layers: {
      totalFillingThickness: defaultSubstructureLayer(),
      lateriteThickness: defaultSubstructureLayer(),
      hardcoreThickness: defaultSubstructureLayer(),
    },
    columnFooting: defaultSubstructureFooting(),
    elements: Object.fromEntries(
      SUBSTRUCTURE_ELEMENTS_ALWAYS.map((el) => [el, defaultSubstructureConcreteElement()])
    ),
    pileCapFrames: defaultSubstructureFrameElement(),
    blockworkInStripFoundation: {
      blockworkForFormwork: "",
      blockworkFilling: "",
    },
  };
}

export function defaultPileSystem(): PileSystem {
  return {
    gradeOfConcrete: "", castingMethod: "", castingLabour: "",
    depth: "", diameter: "", centerToCenter: "", plasticizers: "",
    mainBarNo: "", mainBarSize: "", ringBarSize: "", rebarDepth: "",
  };
}

export function defaultScopeConfig(): ScopeConfig {
  return {
    projectType: "", foundationType: "", noOfFloors: "1",
    lift: "No", hasPool: false, poolLocation: "",
  };
}

export function defaultStep2(): Step2Data {
  return {
    projectName: "", clientName: "", projectRef: "", streetAddress: "",
    currency: "", projectType: "", projectPhase: "", durationMonths: "", description: "",
  };
}

export function defaultStep3(): Step3Data {
  return {
    scopeConfig: defaultScopeConfig(),
    pileSystem: defaultPileSystem(),
    blinding: Object.fromEntries(BLINDING_ELEMENTS_ALWAYS.map((el) => [el, defaultBlindingElement()])),
    substructure: defaultSubstructureData(),
    superstructure: Object.fromEntries(SUPERSTRUCTURE_ELEMENTS_ALWAYS.map((el) => [el, defaultConcreteElement()])),
  };
}

export function defaultStep4(): Step4Data {
  return {
    specifications: {
      screedingOnDPM: "", meshType: "", ceilingType: "", roofParapetWall: "",
      paintTypeInternally: "", paintTypeExternally: "", riserHeightForStairs: "", skirtingLandingThickness: "",
    },
    floorTiles: {
      generalAreas: [{ typeCode: "A", description: "" }],
      wetAreas: [{ typeCode: "A", description: "" }],
      stairsArea: [{ typeCode: "A", description: "" }],
      swimmingPool: [{ typeCode: "A", description: "" }],
      liftWalls: [{ typeCode: "A", description: "" }],
    },
    wallTiles: {
      internalWalls: [{ typeCode: "A", description: "" }],
      externalWalls: [{ typeCode: "A", description: "" }],
    },
  };
}

export function defaultStep5(): Step5Data {
  return {
    advancePayment: "", fxRate: "",
    markup: "12.5", retention: "12.5",
    contingency: "5.0", preliminaries: "2.5",
  };
}
