import type { Step2Data } from "@/components/projects/manual/types";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";
import type { WorkspaceProjectSnapshot } from "./types";

export function buildWorkspaceProjectFromDetails(
  projectId: string,
  details: Step2Data,
  drawings: DrawingFile[],
): WorkspaceProjectSnapshot {
  const projectName = details.projectName || `Project ${projectId.slice(0, 8)}`;
  const clientName = details.clientName || "Client name pending";

  return {
    id: projectId,
    projectId,
    name: projectName,
    projectType: details.projectType || "Residential",
    foundationType: "—",
    floors: 0,
    hasPool: false,
    lift: "none",
    grossFloorArea: 0,
    estimateTotal: 0,
    costPerSqm: 0,
    completionStatus: 0,
    contingencies: "0",
    buildingType: details.projectType || "Building",
    projectLocation: details.streetAddress || "Location not set",
    clientName,
    description: details.description || "",
    sections: [],
    activities: [
      {
        label: "Project Created",
        actor: "System",
        time: "Just now",
        action: `Created project: ${projectName}`,
      },
    ],
    referenceDrawings: drawings.filter((d) => d.status === "complete").map((d) => d.name),
    createdAt: new Date().toISOString(),
  };
}

export function formatWorkspaceCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}
