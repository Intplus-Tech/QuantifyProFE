"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, LayoutDashboard, PencilLine, SquareStack, Ruler, ChevronRight, FileText, Clock3, Activity, FolderOpen, Loader2 } from "lucide-react";
import { formatWorkspaceCurrency } from "./workspaceMapper";
import { useGetProjectByIdQuery, useGetProjectDashboardQuery, useGetProjectActivityQuery, useGetProjectStructuralScopesQuery } from "@/store/api/projectsApi";
import type { WorkspaceProjectSnapshot } from "./types";
import { formatDistanceToNow } from "date-fns";
import type { StructuralScopeDocument } from "@/types/manualProject";

interface ProjectWorkspaceViewProps {
  projectId: string;
  basePath: string;
  mode: "dashboard" | "configuration" | "library";
}

function SectionBadge({ status }: { status: WorkspaceProjectSnapshot["sections"][number]["status"] }) {
  const map = {
    done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    queued: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  } as const;

  return <Badge variant="outline" className={`capitalize ${map[status]}`}>{status.replace("-", " ")}</Badge>;
}

function StatCard({ icon: Icon, label, value, hint, accent = "text-foreground" }: { icon: any; label: string; value: string; hint?: string; accent?: string; }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
          <p className={`text-2xl font-extrabold mt-2 ${accent}`}>{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function MissingWorkspaceState({ basePath, projectId }: { basePath: string; projectId: string }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-8 md:p-10">
        <div className="max-w-xl space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Workspace unavailable
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-2">
              We could not find this project snapshot
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              The workspace for project {projectId} is missing from local state. Reload the page to
              try restoring the persisted snapshot, or go back to the project area and reopen the
              workspace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => window.location.reload()} className="sm:w-auto">
              Reload workspace
            </Button>
            <Button variant="outline" asChild className="sm:w-auto">
              <Link href={basePath}>Go back</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function describeStructuralScope(doc: StructuralScopeDocument): string {
  const sections: string[] = [];

  if (doc.pileSpecification) sections.push("Pile system");
  if (doc.blindingElements?.length) sections.push("Blinding");
  if (doc.substructureFilling || doc.substructureElements?.length) sections.push("Substructure");
  if (doc.superstructureElements?.length) sections.push("Superstructure");

  return sections.length ? sections.join(" · ") : "No structural sections detected";
}

function formatScopeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";

  if (Array.isArray(value)) {
    if (value.length === 0) return "Empty";
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    const fieldCount = Object.keys(value as Record<string, unknown>).length;
    return `${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
  }

  return String(value);
}

function formatScopeKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderScopeValueCell(label: string, value: unknown) {
  return (
    <div key={label} className="rounded-lg border border-border/50 bg-background px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-xs font-medium text-foreground mt-1">{formatScopeValue(value)}</p>
    </div>
  );
}

function renderScopeObjectSection(title: string, value: Record<string, unknown>) {
  return (
    <details key={title} className="group rounded-xl border border-border/50 bg-white shadow-sm overflow-hidden">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 border-b border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">Returned by the backend for this project</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(value).map(([key, entryValue]) => renderScopeValueCell(formatScopeKey(key), entryValue))}
      </div>
    </details>
  );
}

function renderScopeElementSection(
  title: string,
  elements: Array<Record<string, unknown>>,
  itemLabelKey: string,
) {
  return (
    <details key={title} className="group rounded-xl border border-border/50 bg-white shadow-sm overflow-hidden">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 border-b border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {elements.length} returned {elements.length === 1 ? "element" : "elements"}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <div className="p-4 grid grid-cols-1 gap-3">
        {elements.map((element, index) => {
          const itemLabel = String(element[itemLabelKey] ?? `item_${index + 1}`);
          return (
            <div key={`${title}-${itemLabel}-${index}`} className="rounded-lg border border-border/40 bg-slate-50/40 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/30 pb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatScopeKey(itemLabel)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Element returned by the backend</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-white">{title}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(element)
                  .filter(([key]) => key !== itemLabelKey)
                  .map(([key, entryValue]) => renderScopeValueCell(formatScopeKey(key), entryValue))}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

export function ProjectWorkspaceView({ projectId, basePath, mode }: ProjectWorkspaceViewProps) {
  const localSnapshot = useAppSelector((state) => state.projectWorkspace.projectsById[projectId]);
  const { data: projectResponse, isLoading: isLoadingProject } = useGetProjectByIdQuery(projectId);
  const { data: dashboardResponse, isLoading: isLoadingDashboard } = useGetProjectDashboardQuery(projectId);
  const { data: activityResponse, isLoading: isLoadingActivity } = useGetProjectActivityQuery({ projectId, limit: 5 });
  const { data: structuralScopeResponse, isLoading: isLoadingStructuralScopes } = useGetProjectStructuralScopesQuery(projectId);

  const backendProject = projectResponse?.data;
  const dashboardData = dashboardResponse?.data;
  const backendStructuralScopes = structuralScopeResponse?.data ?? [];

  // We require either a local snapshot or basic backend data to render
  if (!localSnapshot && !backendProject && !isLoadingProject) {
    return <MissingWorkspaceState basePath={basePath} projectId={projectId} />;
  }

  if (isLoadingProject || isLoadingDashboard || isLoadingStructuralScopes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading workspace...</p>
      </div>
    );
  }

  // Merge the backend data into the snapshot structure so the UI can render
  const isBackendLoaded = !!backendProject;

  const project: WorkspaceProjectSnapshot = {
    ...localSnapshot, // Start with local snapshot (contains detailed sections/activities if available)
    id: projectId,
    projectId,
    name: backendProject?.name ?? localSnapshot?.name ?? `Project ${projectId.slice(0, 8)}`,
    projectType: backendProject?.projectType ?? localSnapshot?.projectType ?? "Manual Project",
    buildingType: isBackendLoaded
      ? (backendProject.projectType || backendProject.buildingType || "Not set")
      : (localSnapshot?.buildingType ?? "Building"),
    grossFloorArea: isBackendLoaded
      ? (backendProject.grossFloorArea || 0)
      : (localSnapshot?.grossFloorArea ?? 0),
    estimateTotal: isBackendLoaded
      ? (backendProject.estimateTotal || dashboardData?.estimateTotal || 0)
      : (localSnapshot?.estimateTotal ?? 0),
    completionStatus: isBackendLoaded
      ? (backendProject.completionStatus || dashboardData?.completionStatus || 0)
      : (localSnapshot?.completionStatus ?? 0),
    clientName: isBackendLoaded
      ? (backendProject.clientName || "Not set")
      : (localSnapshot?.clientName ?? "Client name pending"),
    description: backendProject?.description ?? localSnapshot?.description ?? "Generated from manual setup",
    // Fields sourced from backend with fallbacks to local snapshot/defaults
    foundationType: isBackendLoaded
      ? (backendStructuralScopes[0]?.foundationType || backendProject.foundationTypes?.[0] || "Not set")
      : (localSnapshot?.foundationType ?? "Foundation"),
    floors: isBackendLoaded
      ? (backendProject.numberOfFloors || 1)
      : (localSnapshot?.floors ?? 1),
    hasPool: isBackendLoaded
      ? (backendProject.hasSwimmingPool || false)
      : (localSnapshot?.hasPool ?? false),
    lift: isBackendLoaded
      ? (backendProject.liftOption || "none")
      : (localSnapshot?.lift ?? "none"),
    costPerSqm: dashboardData ? (dashboardData.costPerSqm || 0) : (localSnapshot?.costPerSqm ?? 0),
    contingencies: isBackendLoaded
      ? (backendProject.metricsConfig?.contingency?.toString() || "0")
      : (localSnapshot?.contingencies ?? "5.0"),
    projectLocation: backendProject?.projectLocation ?? localSnapshot?.projectLocation ?? "Location not set",
    sections: localSnapshot?.sections ?? [],
    activities: localSnapshot?.activities ?? [],
    referenceDrawings: backendProject?.libraryItems ?? localSnapshot?.referenceDrawings ?? [],
    createdAt: backendProject?.createdAt ?? localSnapshot?.createdAt ?? new Date().toISOString(),
  };

  // Process Cost Breakdown from Dashboard Data
  let costBreakdown = [
    { label: "Structural Scope", value: 46, color: "bg-blue-500" },
    { label: "Finishes", value: 24, color: "bg-emerald-500" },
    { label: "MEP / Services", value: 18, color: "bg-amber-500" },
    { label: "Contingency", value: 12, color: "bg-violet-500" },
  ];

  if (dashboardData?.costDistribution && dashboardData.costDistribution.length > 0) {
    const totalAmount = dashboardData.costDistribution.reduce((sum, item) => sum + item.amount, 0);
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-pink-500", "bg-cyan-500"];

    if (totalAmount > 0) {
      costBreakdown = dashboardData.costDistribution.map((item, index) => ({
        label: item.sectionName,
        value: Math.round((item.amount / totalAmount) * 100),
        color: colors[index % colors.length],
      })).sort((a, b) => b.value - a.value);
    }
  }

  // Process Project Activity
  const backendActivities = activityResponse?.data ?? [];

  let displayActivities = project.activities;

  if (backendActivities && backendActivities.length > 0) {
    displayActivities = backendActivities.map((act: any) => ({
      label: act.action || "System Event",
      actor: act.performedByName || "System",
      time: formatDistanceToNow(new Date(act.timestamp || act.createdAt || new Date()), { addSuffix: true }),
      action: act.detail || act.description || "Activity recorded",
    }));
  }

  const isDashboard = mode === "dashboard";
  const isLibrary = mode === "library";

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span>{isDashboard ? "Dashboard" : isLibrary ? "Project Library" : "Configuration"}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.projectType} · {project.foundationType} · {project.floors} floor{project.floors === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="h-11">
            <Link href={mode === "dashboard" ? `${basePath}/${projectId}/configuration` : `${basePath}/${projectId}`}>
              {mode === "dashboard" ? (
                <>
                  <PencilLine className="w-4 h-4 mr-2" />
                  Open Configuration
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </>
              )}
            </Link>
          </Button>
          {!isLibrary && (
            <Button variant="outline" asChild className="h-11">
              <Link href={`${basePath}/${projectId}/library`}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Library
              </Link>
            </Button>
          )}
          <Button className="bg-amber-500 hover:bg-amber-600 text-white h-11 shadow-sm" asChild>
            <Link href={`${basePath}/${projectId}/boq`}>
              <FileText className="w-4 h-4 mr-2" />
              View BOQ
            </Link>
          </Button>
        </div>
      </div>

      {isDashboard ? (
        <DashboardView
          project={{ ...project, activities: displayActivities }}
          basePath={basePath}
          projectId={projectId}
          costBreakdown={costBreakdown}
        />
      ) : isLibrary ? (
        <LibraryView project={project} basePath={basePath} projectId={projectId} />
      ) : (
        <ConfigurationView project={project} structuralScopes={backendStructuralScopes} />
      )}
    </div>
  );
}

function LibraryView({
  project,
  basePath,
  projectId,
}: {
  project: WorkspaceProjectSnapshot;
  basePath: string;
  projectId: string;
}) {
  const hasDrawings = project.referenceDrawings.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
      <Card className="xl:col-span-2 border-border/50 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Reference Drawings</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Workspace assets generated from the manual setup flow.
            </p>
          </div>

          <div className="space-y-3">
            {!hasDrawings ? (
              <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 px-4 py-5">
                <p className="text-sm font-medium text-foreground">No reference drawings uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload drawings in the manual setup flow to populate this workspace.
                </p>
              </div>
            ) : (
              project.referenceDrawings.map((drawing, index) => (
                <div
                  key={`${drawing}-${index}`}
                  className="rounded-lg border border-border/50 bg-card px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{drawing}</p>
                    <p className="text-xs text-muted-foreground mt-1">Document {index + 1}</p>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">Ready</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Library Controls</h2>
            <p className="text-xs text-muted-foreground mt-1">Quick actions for workspace artifacts</p>
          </div>
          <Button className="w-full" variant="outline" asChild>
            <Link href={`${basePath}/${projectId}/configuration`}>Edit Setup Inputs</Link>
          </Button>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" asChild>
            <Link href={`${basePath}/${projectId}/processing`}>Open Processing Queue</Link>
          </Button>
          <div className="text-xs text-muted-foreground rounded-md bg-muted/40 p-3">
            Library persistence is UI-only for now; backend sync will be added in the next phase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardView({ project, basePath, projectId, costBreakdown }: { project: WorkspaceProjectSnapshot; basePath: string; projectId: string; costBreakdown: Array<{ label: string; value: number; color: string }>; }) {
  const activity = project.activities;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <StatCard icon={SquareStack} label="Total Estimate" value={formatWorkspaceCurrency(project.estimateTotal)} hint="Derived from manual scope" accent="text-foreground" />
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Completion Status</p>
                <p className="text-3xl font-extrabold text-foreground mt-2">{project.completionStatus}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <Progress value={project.completionStatus} className="h-2" />
            <p className="text-xs text-muted-foreground">Workspace readiness based on selected structural scope</p>
          </CardContent>
        </Card>
        <StatCard icon={Ruler} label="Contingencies" value={`${project.contingencies}%`} hint="Set in project details" accent="text-foreground" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <Card className="xl:col-span-2 border-border/50 shadow-sm ">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Cost Distribution by Category</h2>
                <p className="text-xs text-muted-foreground mt-1">Generated from the selected manual setup scope</p>
              </div>
              <Link href={`${basePath}/${projectId}/configuration`} className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline">
                View Configuration
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-14">
              {costBreakdown.map((item) => (
                <div key={item.label} className="grid grid-cols-[140px_minmax(0,1fr)_72px] items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-right text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-start-3 border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Project Data</h2>
              {/* {JSON.stringify(project.id, null, 2)} */}
              <p className="text-xs text-muted-foreground mt-1">Snapshot derived from manual setup</p>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Gross Floor Area" value={`${project.grossFloorArea.toLocaleString()} m²`} />
              <Row label="Cost per m²" value={formatWorkspaceCurrency(project.costPerSqm)} />
              <Row label="Foundation Type" value={project.foundationType} />
              <Row label="Building Type" value={project.buildingType} />
              <Row label="Client" value={project.clientName} />
            </div>

            <Button variant="outline" className="w-full h-11" asChild>
              <Link href={`${basePath}/${projectId}/configuration`}>Edit Project Details</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3 border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-1">Latest workspace events</p>
            </div>
            <div className="rounded-xl border border-border/50 overflow-hidden mt-4">
              <div className="block md:grid md:grid-cols-[2fr_3fr_1.5fr_1fr] gap-4 p-3 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground">
                <div>Event</div>
                <div>Details</div>
                <div>Performed By</div>
                <div className="text-right">Time</div>
              </div>
              <div className="divide-y divide-border/50">
                {activity.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No recent activity found</div>
                ) : (
                  activity.map((item) => (
                    <div key={`${item.label}-${item.time}`} className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1.5fr_1fr] gap-3 md:gap-4 p-4 md:p-3 items-center text-sm transition-colors hover:bg-muted/10">
                      <div className="font-medium text-foreground truncate">
                        <span className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Event</span>
                        {item.label}
                      </div>
                      <div className="text-muted-foreground truncate">
                        <span className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Details</span>
                        {item.action}
                      </div>
                      <div className="text-muted-foreground truncate">
                        <span className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Performed By</span>
                        {item.actor}
                      </div>
                      <div className="text-muted-foreground md:text-right whitespace-nowrap">
                        <span className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Time</span>
                        {item.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ConfigurationView({ project, structuralScopes }: { project: WorkspaceProjectSnapshot; structuralScopes: StructuralScopeDocument[] }) {
  const params = [
    { label: "Foundation Type", value: project.foundationType },
    { label: "Number of Floors", value: `${project.floors}` },
    { label: "Swimming Pool", value: project.hasPool ? "Yes (Superstructure)" : "No" },
    { label: "Lift Installation", value: project.lift },
  ];

  return (
    <div className="space-y-5">
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {params.map((item) => (
              <div key={item.label} className="min-w-45">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{item.label}</p>
                <p className="text-sm font-semibold text-foreground mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="w-full space-y-3">
        {structuralScopes.length > 0 && (
          <Card className="border-border/50 shadow-sm bg-slate-50/70">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Saved Structural Scope</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Only the sections returned by the backend are shown here
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-white">Backend</Badge>
              </div>
              <div className="space-y-4">
                {structuralScopes.map((scope) => {
                  const scopeSections = [
                    scope.pileSpecification
                      ? renderScopeObjectSection("Pile Specification", scope.pileSpecification)
                      : null,
                    scope.blindingElements?.length
                      ? renderScopeElementSection("Blinding Elements", scope.blindingElements, "elementType")
                      : null,
                    scope.substructureFilling
                      ? renderScopeObjectSection("Substructure Filling", scope.substructureFilling)
                      : null,
                    scope.substructureElements?.length
                      ? renderScopeElementSection("Substructure Elements", scope.substructureElements, "elementType")
                      : null,
                    scope.columnFooting
                      ? renderScopeObjectSection("Column Footing", scope.columnFooting)
                      : null,
                    scope.superstructureElements?.length
                      ? renderScopeElementSection("Superstructure Elements", scope.superstructureElements, "elementType")
                      : null,
                  ].filter(Boolean);

                  return (
                    <div
                      key={scope._id}
                      className="rounded-xl border border-border/40 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap px-4 py-3 bg-slate-50/80 border-b border-border/40">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 capitalize">
                            {scope.foundationType.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {describeStructuralScope(scope)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-white">
                          Backend
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 text-[11px] text-slate-500">
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 border border-border/40">
                          Created: {scope.createdAt ? new Date(scope.createdAt).toLocaleString() : "Unknown"}
                        </span>
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 border border-border/40">
                          Updated: {scope.updatedAt ? new Date(scope.updatedAt).toLocaleString() : "Unknown"}
                        </span>
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 border border-border/40">
                          ID: {scope._id.slice(0, 8)}
                        </span>
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 border border-border/40">
                          Project: {scope.projectId.slice(0, 8)}
                        </span>
                      </div>

                      <div className="space-y-3 px-4 pb-4">
                        {scopeSections.length > 0 ? (
                          scopeSections
                        ) : (
                          <div className="rounded-lg border border-dashed border-border/40 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                            No structural sections were returned for this scope.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {structuralScopes.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/40 bg-white p-4 text-sm text-slate-500">
                  No backend structural scope has been saved for this project yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}
