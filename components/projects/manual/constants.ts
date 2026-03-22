import type {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  ScopeConfig,
  PileSystem,
  BlindingElement,
  ConcreteElement,
} from "./types";

// ─── Stepper config ───────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { id: 1, label: "Drawings", subtitle: "Upload files" },
  { id: 2, label: "Project Details", subtitle: "Info & location" },
  { id: 3, label: "Scope", subtitle: "Structural config" },
  { id: 4, label: "Finishing", subtitle: "Materials" },
  { id: 5, label: "Metrics", subtitle: "Currency & rates" },
] as const;

// ─── Foundation type map ──────────────────────────────────────────────────────

export const FOUNDATION_TYPE_MAP: Record<string, string[]> = {
  "Piling Alone": ["Pile"],
  "Piling & Substructure": ["Pile", "Raft Pile with Basement"],
  "Foundation & Carcass Only": ["Pile", "Raft", "Strip", "Raft Pile with Basement"],
  "Carcass with finishes": ["Pile", "Raft", "Strip", "Raft Pile with Basement"],
};

// ─── Tab derivation ───────────────────────────────────────────────────────────

export function getScopeTabs(projectType: string): string[] {
  switch (projectType) {
    case "Piling Alone":
      return ["pile-system", "superstructure"];
    case "Piling & Substructure":
      return ["pile-system", "blinding", "substructure", "superstructure"];
    case "Foundation & Carcass Only":
    case "Carcass with finishes":
      return ["foundation-system", "blinding", "substructure", "superstructure"];
    default:
      return ["superstructure"];
  }
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
  "Feasibility",
  "Design Development",
  "Construction",
];

export const SCOPE_PROJECT_TYPES = [
  "Piling Alone",
  "Piling & Substructure",
  "Foundation & Carcass Only",
  "Carcass with finishes",
];

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
export const SUPERSTRUCTURE_ELEMENTS_ALWAYS = ["Column", "Lintels", "Beam", "Stairs", "Slab", "Shear Wall", "Roof Column"];

// ─── Default state factories ──────────────────────────────────────────────────

export function defaultBlindingElement(): BlindingElement {
  return { gradeOfConcrete: "", castingMethod: "", wastePercent: "", blindingThickness: "" };
}

export function defaultConcreteElement(): ConcreteElement {
  return { gradeOfConcrete: "", plasticizers: "", waterproofing: "", castingMethod: "", castingLabourMethod: "", wastePercent: "" };
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
      generalAreas: [{ typeCode: "A", description: "" }, { typeCode: "B", description: "" }, { typeCode: "C", description: "" }, { typeCode: "D", description: "" }],
      wetAreas: [{ typeCode: "P", description: "" }, { typeCode: "Q", description: "" }],
      stairsArea: [{ typeCode: "K", description: "" }],
      swimmingPool: [{ typeCode: "Z(F)", description: "" }, { typeCode: "Z(W)", description: "" }],
      liftWalls: [{ typeCode: "Z", description: "" }],
    },
    wallTiles: {
      internalWalls: [{ typeCode: "F", description: "" }, { typeCode: "G", description: "" }],
      externalWalls: [{ typeCode: "V", description: "" }, { typeCode: "W", description: "" }],
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
