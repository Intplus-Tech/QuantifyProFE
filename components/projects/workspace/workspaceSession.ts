export interface WsBBSRow {
  id: string;
  mark: string;
  size: string;
  length: string;
  quantity: string;
}

export interface WsConcreteMeasurement {
  id: string;
  measureType: string;
  tag: string;
  fields: Record<string, string>;
  savedAt: number;
}

export interface WsElementAssignment {
  id: string;
  elementId: string;
  elementName: string;
  assignedAt: number;
}

export interface WorkspaceSession {
  showRebarTab: boolean;
  bbsAnswer: "yes" | "no";
  bbsRows: WsBBSRow[];
  scaleWhat: string;
  knownDistance: string;
  distanceUnit: string;
  scaleInfo: string | null;
  scaleLocked: boolean;
  scaleFlowActive: boolean;
  concreteMeasurements: WsConcreteMeasurement[];
  elementAssignments: WsElementAssignment[];
}

const storageKey = (projectId: string) => `qs-ws-${projectId}`;

export function loadSession(projectId: string): Partial<WorkspaceSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    return raw ? (JSON.parse(raw) as Partial<WorkspaceSession>) : {};
  } catch {
    return {};
  }
}

export function saveSession(
  projectId: string,
  patch: Partial<WorkspaceSession>,
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSession(projectId);
    localStorage.setItem(
      storageKey(projectId),
      JSON.stringify({ ...existing, ...patch }),
    );
  } catch {}
}

export function clearSession(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(projectId));
  } catch {}
}
