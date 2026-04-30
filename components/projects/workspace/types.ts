export interface WorkspaceProjectSection {
  id: string;
  title: string;
  description: string;
  status: "done" | "in-progress" | "queued";
  summary: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
}

export interface WorkspaceProjectActivity {
  label: string;
  actor: string;
  time: string;
  action: string;
}

export interface WorkspaceProjectSnapshot {
  id: string;
  projectId: string;
  name: string;
  projectType: string;
  foundationType: string;
  floors: number;
  hasPool: boolean;
  poolLocation?: string;
  lift: string;
  grossFloorArea: number;
  estimateTotal: number;
  costPerSqm: number;
  completionStatus: number;
  contingencies: string;
  buildingType: string;
  projectLocation: string;
  clientName: string;
  description: string;
  sections: WorkspaceProjectSection[];
  activities: WorkspaceProjectActivity[];
  referenceDrawings: string[];
  createdAt: string;
}
