"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Loader2,
  Save,
  Settings2,
  SquareStack,
  Waves,
  Database,
  Grid,
  Table,
  Columns,
  LayoutTemplate,
  ArrowUpDown,
  LayoutGrid,
  Building2,
  Droplets,
} from "lucide-react";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";

interface ProjectWorkspaceLayoutProps {
  projectId: string;
  basePath: string;
  children: React.ReactNode;
}

function toTitle(value: string): string {
  if (!value) return "Dashboard";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function WorkspaceNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${active
        ? "bg-amber-500 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100"
        }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}

function TakeoffAccordionItem({
  title,
  icon: Icon,
  items,
  activeSegment,
  basePath,
  id,
}: {
  title: string;
  icon: any;
  items: { label: string; href: string; icon: any }[];
  activeSegment: string;
  basePath: string;
  id?: string;
}) {
  const isActiveSegmentChild = items.some((item) => activeSegment === item.href);
  const [isExpanded, setIsExpanded] = useState(isActiveSegmentChild);

  useEffect(() => {
    if (isActiveSegmentChild) {
      setIsExpanded(true);
    }
  }, [isActiveSegmentChild]);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors border ${
          isExpanded
            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
            : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span>{title}</span>
        </div>
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isExpanded ? "rotate-90 text-white/90" : "text-slate-400"
          }`}
        />
      </button>

      {isExpanded && items.length > 0 && (
        <div className="flex flex-col gap-1 pl-4 pt-1 pb-1 ml-3 border-l border-slate-200">
          {items.map((item) => {
            const isActive = activeSegment === item.href;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={`${basePath}${item.href}`}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ItemIcon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProjectWorkspaceLayout({
  projectId,
  basePath,
  children,
}: ProjectWorkspaceLayoutProps) {
  const pathname = usePathname() || "";
  const { data: projectResponse, isLoading: isLoadingProject } = useGetProjectByIdQuery(projectId);
  const backendProject = projectResponse?.data;

  const localSnapshot = useAppSelector(
    (state) => state.projectWorkspace.projectsById[projectId],
  );

  const projectName = backendProject?.name ?? localSnapshot?.name ?? `Project ${projectId.slice(0, 8)}`;
  const isAiProject = backendProject?.processingMode === "ai";

  const dashboardPath = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const projectIdx = parts.findIndex((p) => p === projectId);
    const tail = projectIdx >= 0 ? parts.slice(projectIdx + 1) : [];
    return ["Workspace", ...(tail.length ? tail.map(toTitle) : ["Dashboard"])];
  }, [pathname, projectId]);

  const workspaceBase = `${basePath}/${projectId}`;
  const activeSegment = pathname.replace(workspaceBase, "") || "/";

  const nav = [
    {
      href: workspaceBase,
      label: "Workspace Dashboard",
      icon: LayoutDashboard,
      match: "/",
    },
    {
      href: `${workspaceBase}/configuration`,
      label: "Configuration",
      icon: Settings2,
      match: "/configuration",
    },
    {
      href: `${workspaceBase}/library`,
      label: "Project Library",
      icon: FolderOpen,
      match: "/library",
    },
  ];

  const reportLinks = [
    {
      href: `${workspaceBase}/boq`,
      label: "BOQ Summary",
      icon: FileText,
      match: "/boq",
    },
  ];

  // ─── Derive structural parameters ────────────────────────────────────────────
  // foundationType comes from the backend as a normalised enum value:
  //   "pile" | "strip" | "raft" | "raft_pile_with_basement"
  // qsProjectType drives which major sections (substructure / superstructure / finishing) are visible:
  //   "piling_alone"           → substructure only (pile cap only)
  //   "piling_and_substructure"→ substructure only (pile cap + ground beam + column)
  //   "foundation_and_carcass" → substructure + superstructure (no finishing)
  //   "carcass_with_finishes"  → all three sections
  const foundationType =
    backendProject?.foundationTypes?.[0] || localSnapshot?.foundationType || "strip";
  const qsProjectType = backendProject?.qsProjectType || "";
  const numberOfFloors = backendProject?.numberOfFloors || localSnapshot?.floors || 0;
  const hasPool = backendProject?.hasSwimmingPool || localSnapshot?.hasPool || false;
  const poolLocations: string[] = backendProject?.poolLocations || (localSnapshot?.poolLocation ? [localSnapshot.poolLocation] : []);
  const poolInSubstructure = hasPool && poolLocations.includes("substructure");
  const poolInSuperstructure = hasPool && (!poolLocations.length || poolLocations.includes("external") || poolLocations.includes("superstructure"));
  const liftOption = backendProject?.liftOption || localSnapshot?.lift || "none";
  const hasLift = liftOption !== "none";

  // ─── Substructure routes — driven by foundationType ──────────────────────────
  //
  //  "pile" alone             → Pile Cap only
  //  "strip"                  → Strip Foundation, Ground Beam, Column In Foundation
  //  "raft"                   → Pile Cap, Ground Beam, Column In Foundation
  //  "raft_pile_with_basement"→ Pile Cap, Ground Beam, Column In Foundation
  const isPile = foundationType === "pile";
  const isStrip = foundationType === "strip";
  // raft and raft_pile_with_basement share the same route set
  const isRaftVariant = foundationType === "raft" || foundationType === "raft_pile_with_basement";

  const substructureItems = [
    ...(isPile || isRaftVariant
      ? [{ label: "Pile Cap", href: `/takeoff/substructure/foundation`, icon: Database }]
      : []),
    ...(isStrip
      ? [{ label: "Strip Foundation", href: `/takeoff/substructure/strip-foundation`, icon: LayoutGrid }]
      : []),
    ...(!isPile
      ? [
          { label: "Ground Beam", href: `/takeoff/substructure/ground-beam`, icon: Grid },
          { label: "Column In Foundation", href: `/takeoff/substructure/column`, icon: Table },
        ]
      : []),
    ...(poolInSubstructure
      ? [{ label: "Swimming Pool", href: `/takeoff/substructure/swimming-pool`, icon: Waves }]
      : []),
  ];

  // ─── Section visibility — driven by qsProjectType ────────────────────────────
  const showSuperstructure =
    qsProjectType === "foundation_and_carcass" ||
    qsProjectType === "carcass_with_finishes" ||
    // Fallback: if qsProjectType not yet set, show for non-pile-alone projects
    (!qsProjectType && !isPile);

  const showFinishing =
    qsProjectType === "carcass_with_finishes" ||
    // Fallback: if qsProjectType not yet set, show for non-pile projects
    (!qsProjectType && !isPile);

  // ─── Superstructure routes ────────────────────────────────────────────────────
  const superstructureItems = [
    { label: "Column", href: "/takeoff/superstructure/column", icon: Layers },
    { label: "Floor & Beam", href: "/takeoff/superstructure/floor-beam", icon: LayoutTemplate },
    { label: "Shear Wall", href: "/takeoff/superstructure/shear-wall", icon: Table },
  ];
  if (numberOfFloors > 0) {
    superstructureItems.push({ label: "Stairs", href: "/takeoff/superstructure/stairs", icon: Columns });
  }
  if (hasLift) {
    superstructureItems.push({ label: "Lift Shaft", href: "/takeoff/superstructure/lift-shaft", icon: ArrowUpDown });
  }
  if (poolInSuperstructure) {
    superstructureItems.push({ label: "Swimming Pool", href: "/takeoff/superstructure/swimming-pool", icon: Waves });
  }

  // ─── Finishing routes ─────────────────────────────────────────────────────────
  const finishingItems = [
    { label: "Roof Beam & Slab", href: "/takeoff/finishing/roof-beam-slab", icon: Database },
    { label: "Walls & Openings", href: "/takeoff/finishing/walls-openings", icon: LayoutGrid },
    { label: "Roof Structure & Covering", href: "/takeoff/finishing/roof-structure-covering", icon: Grid },
    { label: "Floor's & Ceiling's", href: "/takeoff/finishing/floors-ceilings", icon: Table },
  ];

  const takeoffSections = [
    {
      id: "substructure",
      title: "Substructure",
      icon: Layers,
      items: substructureItems,
    },
    ...(showSuperstructure
      ? [{
          id: "superstructure",
          title: "Superstructure",
          icon: Building2,
          items: superstructureItems,
        }]
      : []),
    ...(showFinishing
      ? [{
          id: "finishing",
          title: "Finishing",
          icon: Droplets,
          items: finishingItems,
        }]
      : []),
  ];

  if (isLoadingProject && !backendProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dbe3eb] text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  if (isAiProject) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#dbe3eb] flex">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-[#f8fafc] flex flex-col">
        <div className="px-4 py-4 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-800">QSCalc Pro Workspace</p>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {projectName}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Main App</p>
              <WorkspaceNavItem
                href={dashboardPath}
                label="Main Dashboard"
                icon={LayoutDashboard}
                active={false}
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Workspace</p>
              <div className="space-y-1">
                {nav.map((item) => (
                  <WorkspaceNavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={activeSegment === item.match}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Takeoff Section</p>
              <div className="space-y-2">
                {takeoffSections.map((section) => (
                  <TakeoffAccordionItem
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    icon={section.icon}
                    items={section.items}
                    activeSegment={activeSegment}
                    basePath={workspaceBase}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Reports</p>
              <div className="space-y-1">
                {reportLinks.map((item) => (
                  <WorkspaceNavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={activeSegment === item.match}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-slate-200 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 px-1">
            Reference Drawings
          </p>
          {(localSnapshot?.referenceDrawings?.length
            ? localSnapshot.referenceDrawings
            : ["No drawings uploaded"]
          ).slice(0, 2).map((name) => (
            <div
              key={name}
              className="text-[11px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600 truncate"
            >
              {name}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {crumbs.map((crumb, idx) => (
              <div key={`${crumb}-${idx}`} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={idx === crumbs.length - 1 ? "text-slate-800 font-semibold" : ""}>{crumb}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              UI only
            </Badge>
            <Button className="h-8 bg-amber-500 hover:bg-amber-600 text-white" size="sm">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Workspace
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
