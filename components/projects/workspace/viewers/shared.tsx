"use client";

import { Loader2, AlertTriangle } from "lucide-react";

export function ViewerLoadingOverlay({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function ViewerErrorOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
      <div className="flex flex-col items-center gap-3 text-center px-8">
        <AlertTriangle className="w-8 h-8 text-destructive" />
        <p className="text-sm font-semibold text-slate-700">Failed to load file</p>
        <p className="text-xs text-slate-400 max-w-xs">{message}</p>
      </div>
    </div>
  );
}
