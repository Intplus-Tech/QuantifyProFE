"use client";

import Link from "next/link";
import { FileText, Home, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExtractTopBar({
  title,
  dashboardHref,
  reportHref,
  continueLaterHref,
  reportLabel = "View Reports",
  /**
   * Extraction is running. Leaving the page abandons the run without saving
   * it, so every way off this screen is held shut until it finishes or the
   * user cancels it explicitly.
   */
  locked = false,
}: {
  title: string;
  dashboardHref: string;
  reportHref: string;
  continueLaterHref: string;
  reportLabel?: string;
  locked?: boolean;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
      <NavLink
        href={dashboardHref}
        locked={locked}
        className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </NavLink>

      <span className="h-5 w-px shrink-0 bg-slate-200" />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
        <p className="truncate font-mono text-[11px] uppercase tracking-wide text-slate-600">
          {title}
        </p>
      </div>

      {locked && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
          <Loader2 className="h-3 w-3 animate-spin" />
          Extraction running
        </span>
      )}

      {locked ? (
        <Button size="sm" className="h-8 shrink-0 text-[11px]" disabled>
          {reportLabel}
        </Button>
      ) : (
        <Button asChild size="sm" className="h-8 shrink-0 text-[11px]">
          <Link href={reportHref}>{reportLabel}</Link>
        </Button>
      )}

      <NavLink
        href={continueLaterHref}
        locked={locked}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-[11px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-3.5 w-3.5" />
        Continue later
      </NavLink>
    </header>
  );
}

/** A link that becomes inert text while the page is locked. */
function NavLink({
  href,
  locked,
  className,
  children,
}: {
  href: string;
  locked: boolean;
  className: string;
  children: React.ReactNode;
}) {
  if (locked) {
    return (
      <span
        aria-disabled
        title="Available once extraction finishes"
        className={`${className} pointer-events-none opacity-40`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
