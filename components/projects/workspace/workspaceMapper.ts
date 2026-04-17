import type { WizardState } from "@/components/projects/manual/types";
import type { WorkspaceProjectSnapshot } from "./types";

function toMoney(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function pickReferenceDrawings(drawings: WizardState["drawings"]): string[] {
  return drawings.map((file) => file.file.name).slice(0, 3);
}

function deriveBuildingType(projectType: string): string {
  if (projectType.includes("Carcass")) return "Residential";
  if (projectType.includes("Foundation")) return "Mixed Use";
  if (projectType.includes("Piling")) return "Infrastructure";
  return "Building";
}

function buildSections(wizard: WizardState): WorkspaceProjectSnapshot["sections"] {
  const scope = wizard.scope;
  const finishing = wizard.finishing;
  const blindingKeys = Object.keys(scope.blinding);
  const substructureKeys = Object.keys(scope.substructure.elements);
  const superstructureKeys = Object.keys(scope.superstructure);

  return [
    {
      id: "blinding",
      title: "Section 1: Blinding",
      description: "Foundation and blinding specifications derived from manual setup.",
      status: blindingKeys.length ? "done" : "queued",
      summary: blindingKeys.length
        ? `${blindingKeys.length} element${blindingKeys.length === 1 ? "" : "s"} configured`
        : "No blinding items configured",
      metrics: [
        { label: "Elements", value: `${blindingKeys.length}` },
        { label: "Pool", value: scope.scopeConfig.hasPool ? "Yes" : "No" },
      ],
    },
    {
      id: "substructure",
      title: "Section 2: Substructure",
      description: "Layer build-up, footings, and substructure components.",
      status: substructureKeys.length ? "done" : "queued",
      summary: substructureKeys.length
        ? `${substructureKeys.length} substructure components configured`
        : "No substructure items configured",
      metrics: [
        { label: "Components", value: `${substructureKeys.length}` },
        { label: "Floors", value: scope.scopeConfig.noOfFloors || "1" },
      ],
    },
    {
      id: "superstructure",
      title: "Section 3: Superstructure",
      description: "Columns, beams, slabs, stairs, pool, and lift wall setup.",
      status: superstructureKeys.length ? "in-progress" : "queued",
      summary: superstructureKeys.length
        ? `${superstructureKeys.length} superstructure elements configured`
        : "No superstructure items configured",
      metrics: [
        { label: "Elements", value: `${superstructureKeys.length}` },
        { label: "Lift", value: scope.scopeConfig.lift },
      ],
    },
    {
      id: "finishing",
      title: "Section 4: Finishing",
      description: "Finishes, tile categories, and measurement rules.",
      status: finishing.floorTiles.generalAreas.length ? "in-progress" : "queued",
      summary: "Finishing scope is ready for detailed takeoff and BOQ build-up.",
      metrics: [
        { label: "Floor groups", value: `${Object.keys(finishing.floorTiles).length}` },
        { label: "Wall groups", value: `${Object.keys(finishing.wallTiles).length}` },
      ],
    },
  ];
}

function buildActivities(projectName: string): WorkspaceProjectSnapshot["activities"] {
  return [
    {
      label: "Scope Configuration",
      actor: "Manual Setup",
      time: "Just now",
      action: `Configured for ${projectName}`,
    },
    {
      label: "Workspace Created",
      actor: "System",
      time: "Just now",
      action: "Generated workspace from manual submission",
    },
    {
      label: "Next Step",
      actor: "You",
      time: "Next",
      action: "Open configuration or BOQ preview",
    },
  ];
}

export function buildWorkspaceProjectFromWizard(
  projectId: string,
  wizard: WizardState,
): WorkspaceProjectSnapshot {
  const projectType = wizard.scope.scopeConfig.projectType || "Manual Project";
  const foundationType = wizard.scope.scopeConfig.foundationType || "Foundation";
  const floors = Number(wizard.scope.scopeConfig.noOfFloors || 1);
  const hasPool = wizard.scope.scopeConfig.hasPool;
  const lift = wizard.scope.scopeConfig.lift;

  const grossFloorArea = Math.max(780, 720 + floors * 280 + (hasPool ? 120 : 0));
  const estimateTotal = Math.round(grossFloorArea * (projectType.includes("Piling") ? 6800 : 5900));
  const costPerSqm = Math.round(estimateTotal / grossFloorArea);
  const completionStatus = Math.min(95, 38 + floors * 10 + (hasPool ? 6 : 0) + (lift === "Yes" ? 6 : 0));
  const contingencies = wizard.metrics.contingency || "5.0";
  const clientName = wizard.step2.clientName || "Client name pending";
  const projectName = wizard.step2.projectName || `Project ${projectId.slice(0, 8)}`;

  return {
    id: projectId,
    projectId,
    name: projectName,
    projectType,
    foundationType,
    floors,
    hasPool,
    lift,
    grossFloorArea,
    estimateTotal,
    costPerSqm,
    completionStatus,
    contingencies,
    buildingType: deriveBuildingType(projectType),
    projectLocation: wizard.step2.streetAddress || "Location not set",
    clientName,
    description: wizard.step2.description || "Generated from manual setup",
    sections: buildSections(wizard),
    activities: buildActivities(projectName),
    referenceDrawings: pickReferenceDrawings(wizard.drawings),
    createdAt: new Date().toISOString(),
  };
}

export function formatWorkspaceCurrency(value: number): string {
  return toMoney(value);
}
