"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  Save,
  Settings2,
  SquareStack,
  Waves,
} from "lucide-react";

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
        active
          ? "bg-amber-500 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}

export function ProjectWorkspaceLayout({
  projectId,
  basePath,
  children,
}: ProjectWorkspaceLayoutProps) {
  const pathname = usePathname() || "";
  const project = useAppSelector(
    (state) => state.projectWorkspace.projectsById[projectId],
  );

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
    { href: workspaceBase, label: "Dashboard", icon: LayoutDashboard, match: "/" },
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

  return (
    <div className="min-h-screen bg-[#dbe3eb] flex">
      <aside className="w-[240px] shrink-0 border-r border-slate-200 bg-[#f8fafc] flex flex-col">
        <div className="px-4 py-4 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-800">QSCalc Pro Workspace</p>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            {project?.name ?? `Project ${projectId.slice(0, 8)}`}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-2">Dashboard</p>
              <WorkspaceNavItem
                href={dashboardPath}
                label="Dashboard"
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
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Substructure</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <SquareStack className="h-3.5 w-3.5" />
                    <span>Superstructure</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Waves className="h-3.5 w-3.5" />
                    <span>Finishing</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
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
          {(project?.referenceDrawings?.length
            ? project.referenceDrawings
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
