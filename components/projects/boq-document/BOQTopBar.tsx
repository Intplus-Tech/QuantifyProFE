"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SaveStatus = "idle" | "saving" | "saved";

interface BOQTopBarProps {
  workspaceHref: string;
  dashboardHref: string;
  /** When provided, an autosave chip replaces the manual Save button. */
  saveStatus?: SaveStatus;
  onExport: () => void;
}

function AutoSaveChip({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-slate-400">
      Changes save automatically
    </span>
  );
}

export function BOQTopBar({
  workspaceHref,
  dashboardHref,
  saveStatus = "idle",
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

        <div className="flex items-center gap-3">
          <AutoSaveChip status={saveStatus} />
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
