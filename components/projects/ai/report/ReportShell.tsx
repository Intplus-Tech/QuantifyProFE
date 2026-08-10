"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  BarChart3,
  Frame,
  Home,
  LayoutDashboard,
  ReceiptText,
  Search,
  Waypoints,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/store";

const NAV = [
  { slug: "", label: "Overview", icon: LayoutDashboard },
  { slug: "boq", label: "Bill of Quantity", icon: ReceiptText },
  { slug: "materials", label: "Material Schedule", icon: BarChart3 },
  { slug: "bbs", label: "Bar Bending Schedule", icon: Waypoints },
  { slug: "formwork", label: "Formwork Schedule", icon: Frame },
];

export function ReportShell({
  projectId,
  basePath = "/projects",
  children,
}: {
  projectId: string;
  basePath?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const siteRef = useSelector((state: RootState) => state.aiFlow.projectMeta.siteRef);
  const projectCode = useSelector(
    (state: RootState) => state.aiFlow.details.projectCode,
  );

  const reportRoot = `${basePath}/ai/${projectId}/report`;
  const dashboardHref = basePath.startsWith("/enterprise")
    ? "/enterprise/dashboard"
    : "/dashboard";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f1fbfc]">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#dbeef1] bg-white px-4 print:hidden">
        <Link
          href={dashboardHref}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        <span className="h-5 w-px shrink-0 bg-slate-200" />

        <label className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-[#dbeef1] bg-[#fbfeff] px-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <input
            placeholder="Search..."
            aria-label="Search the report"
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button asChild size="sm" className="h-8 text-[11px]">
            <Link href={`${basePath}/ai/${projectId}/extract`}>Continue to Drawing</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-[11px] text-slate-500"
          >
            <Link href={basePath}>
              <X className="h-3.5 w-3.5" />
              Continue later
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left nav */}
        <nav className="flex w-[210px] shrink-0 flex-col border-r border-[#dbeef1] bg-white print:hidden">
          <div className="border-b border-[#dbeef1] px-4 py-4">
            <p className="text-[13px] font-semibold text-slate-800">Project Audit</p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
              Site: {projectCode || siteRef}
            </p>
          </div>

          <ul className="flex-1 space-y-0.5 p-2">
            {NAV.map((item) => {
              const href = item.slug ? `${reportRoot}/${item.slug}` : reportRoot;
              const active = item.slug
                ? pathname?.startsWith(href)
                : pathname === reportRoot;
              const Icon = item.icon;

              return (
                <li key={item.slug || "overview"}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-colors ${
                      active
                        ? "bg-[#e8f6f8] font-semibold text-slate-800"
                        : "text-slate-500 hover:bg-[#f4fbfc] hover:text-slate-700"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        active ? "text-amber-500" : "text-slate-400"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-4 p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
