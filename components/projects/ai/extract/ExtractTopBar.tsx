"use client";

import Link from "next/link";
import { FileText, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExtractTopBar({
  title,
  dashboardHref,
  reportHref,
  continueLaterHref,
  reportLabel = "View Reports",
}: {
  title: string;
  dashboardHref: string;
  reportHref: string;
  continueLaterHref: string;
  reportLabel?: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
      <Link
        href={dashboardHref}
        className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>

      <span className="h-5 w-px shrink-0 bg-slate-200" />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
        <p className="truncate font-mono text-[11px] uppercase tracking-wide text-slate-600">
          {title}
        </p>
      </div>

      <Button asChild size="sm" className="h-8 shrink-0 text-[11px]">
        <Link href={reportHref}>{reportLabel}</Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 text-[11px] text-slate-500"
      >
        <Link href={continueLaterHref}>
          <X className="h-3.5 w-3.5" />
          Continue later
        </Link>
      </Button>
    </header>
  );
}
