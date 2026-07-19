"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BOQTopBarProps {
  workspaceHref: string;
  dashboardHref: string;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onSave: () => void;
  onExport: () => void;
}

export function BOQTopBar({
  workspaceHref,
  dashboardHref,
  isSaving,
  hasUnsavedChanges,
  onSave,
  onExport,
}: BOQTopBarProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md print:hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href={workspaceHref}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Workspace
          </Link>
          <Link
            href={dashboardHref}
            className="rounded-md bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-200 px-3 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={onExport}
          >
            Export
            <ChevronDown className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
