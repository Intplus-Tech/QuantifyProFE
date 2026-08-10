"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AiFlowShell({
  backHref,
  backLabel = "Back to Project",
  action,
  children,
}: {
  backHref: string;
  backLabel?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        {action && <div className="ml-auto">{action}</div>}
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
    </div>
  );
}

export function AiFlowCard({
  title,
  description,
  action,
  children,
  footer,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
        {action}
      </div>

      <div className="px-6 py-5">{children}</div>

      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
