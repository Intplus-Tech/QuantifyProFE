"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Loader2,
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
import { useAppSelector } from "@/store/hooks";

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
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        active ? "bg-amber-500 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
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
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
  activeSegment: string;
  basePath: string;
}) {
  const isActiveChild = items.some((item) => activeSegment === item.href);
  const [isExpanded, setIsExpanded] = useState(isActiveChild);

  useEffect(() => {
    if (isActiveChild) setIsExpanded(true);
  }, [isActiveChild]);

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
                <item.icon className="h-3.5 w-3.5" />
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
  const { data: projectResponse, isLoading } = useGetProjectByIdQuery(projectId);
  const backendProject = projectResponse?.data;

  const localSnapshot = useAppSelector(
    (state) => state.projectWorkspace.projectsById?.[projectId],
  );

  const projectName =
    backendProject?.name ?? localSnapshot?.name ?? `Project ${projectId.slice(0, 8)}`;

  const workspaceBase = `${basePath}/${projectId}`;
  const activeSegment = pathname.replace(workspaceBase, "") || "/";

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const projectIdx = parts.findIndex((p) => p === projectId);
    const tail = projectIdx >= 0 ? parts.slice(projectIdx + 1) : [];
    return ["Workspace", ...(tail.length ? tail.map(toTitle) : ["Dashboard"])];
  }, [pathname, projectId]);

  // The main workspace page (root path) renders its own full-screen layout — don't wrap it
  const isRootWorkspace = activeSegment === "/";
  if (isRootWorkspace) return <>{children}</>;

  // The BOQ document renders its own full-screen layout — don't wrap it
  if (activeSegment.startsWith("/boq")) return <>{children}</>;

  // AI projects also bypass the sidebar
  if (backendProject?.processingMode === "ai") return <>{children}</>;

  if (isLoading && !backendProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dbe3eb] text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  const dashboardPath = basePath.startsWith("/enterprise") ? "/enterprise/dashboard" : "/dashboard";

  // ── Structural params ────────────────────────────────────────────────────────
  const foundationType =
    backendProject?.foundationTypes?.[0] ?? localSnapshot?.foundationType ?? "strip";
  const qsProjectType = backendProject?.qsProjectType ?? "";
  const numberOfFloors = backendProject?.numberOfFloors ?? localSnapshot?.floors ?? 0;
  const hasPool = backendProject?.hasSwimmingPool ?? localSnapshot?.hasPool ?? false;
  const poolLocations: string[] = backendProject?.poolLocations ?? [];
  const poolInSubstructure = hasPool && poolLocations.includes("substructure");
  const poolInSuperstructure =
    hasPool && (!poolLocations.length || poolLocations.includes("external") || poolLocations.includes("superstructure"));
  const liftOption = backendProject?.liftOption ?? localSnapshot?.lift ?? "none";
  const hasLift = liftOption !== "none";

  const isPile = foundationType === "pile";
  const isStrip = foundationType === "strip";
  const isRaftVariant =
    foundationType === "raft" || foundationType === "raft_pile_with_basement";

  const substructureItems = [
    ...(isPile || isRaftVariant
      ? [{ label: "Pile Cap", href: "/takeoff/substructure/foundation", icon: Database }]
      : []),
    ...(isStrip
      ? [{ label: "Strip Foundation", href: "/takeoff/substructure/strip-foundation", icon: LayoutGrid }]
      : []),
    ...(!isPile
      ? [
          { label: "Ground Beam", href: "/takeoff/substructure/ground-beam", icon: Grid },
          { label: "Column In Foundation", href: "/takeoff/substructure/column", icon: Table },
        ]
      : []),
    ...(poolInSubstructure
      ? [{ label: "Swimming Pool", href: "/takeoff/substructure/swimming-pool", icon: Waves }]
      : []),
  ];

  const showSuperstructure =
    qsProjectType === "foundation_and_carcass" ||
    qsProjectType === "carcass_with_finishes" ||
    (!qsProjectType && !isPile);

  const showFinishing =
    qsProjectType === "carcass_with_finishes" || (!qsProjectType && !isPile);

  const superstructureItems = [
    { label: "Column", href: "/takeoff/superstructure/column", icon: Layers },
    { label: "Floor & Beam", href: "/takeoff/superstructure/floor-beam", icon: LayoutTemplate },
    { label: "Shear Wall", href: "/takeoff/superstructure/shear-wall", icon: Table },
    ...(numberOfFloors > 0
      ? [{ label: "Stairs", href: "/takeoff/superstructure/stairs", icon: Columns }]
      : []),
    ...(hasLift
      ? [{ label: "Lift Shaft", href: "/takeoff/superstructure/lift-shaft", icon: ArrowUpDown }]
      : []),
    ...(poolInSuperstructure
      ? [{ label: "Swimming Pool", href: "/takeoff/superstructure/swimming-pool", icon: Waves }]
      : []),
  ];

  const finishingItems = [
    { label: "Roof Beam & Slab", href: "/takeoff/finishing/roof-beam-slab", icon: Database },
    { label: "Walls & Openings", href: "/takeoff/finishing/walls-openings", icon: LayoutGrid },
    { label: "Roof Structure & Covering", href: "/takeoff/finishing/roof-structure-covering", icon: Grid },
    { label: "Floor's & Ceiling's", href: "/takeoff/finishing/floors-ceilings", icon: Table },
  ];

  const takeoffSections = [
    { title: "Substructure", icon: Layers, items: substructureItems },
    ...(showSuperstructure ? [{ title: "Superstructure", icon: Building2, items: superstructureItems }] : []),
    ...(showFinishing ? [{ title: "Finishing", icon: Droplets, items: finishingItems }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#dbe3eb] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-[#f8fafc] flex flex-col">
        <div className="px-4 py-4 border-b border-slate-200">
          <Link
            href={workspaceBase}
            className="block text-xs font-semibold text-slate-800 hover:text-amber-600 transition-colors"
          >
            ← Workspace
          </Link>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{projectName}</p>
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
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Takeoff</p>
              <div className="space-y-2">
                {takeoffSections.map((section) => (
                  <TakeoffAccordionItem
                    key={section.title}
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
              <WorkspaceNavItem
                href={`${workspaceBase}/boq`}
                label="BOQ Summary"
                icon={FileText}
                active={activeSegment === "/boq"}
              />
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {crumbs.map((crumb, idx) => (
              <div key={`${crumb}-${idx}`} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={idx === crumbs.length - 1 ? "text-slate-800 font-semibold" : ""}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
          <Button asChild size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white">
            <Link href={workspaceBase}>← Back to Workspace</Link>
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-5 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
