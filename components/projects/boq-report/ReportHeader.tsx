"use client";

import { Building2 } from "lucide-react";
import type { ReportMeta } from "./types";

interface ReportHeaderProps {
  meta: ReportMeta;
}

export function ReportHeader({ meta }: ReportHeaderProps) {
  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Company Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-inner">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{meta.companyName}</h2>
            <p className="text-xs text-muted-foreground">{meta.companySubtitle}</p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground space-y-0.5">
          <p>
            <span className="font-medium text-foreground">Date:</span> {meta.dateGenerated}
          </p>
          <p>
            <span className="font-medium text-foreground">Ref:</span> {meta.ref}
          </p>
          <p>
            <span className="font-medium text-foreground">Location:</span> {meta.location}
          </p>
        </div>
      </div>

      {/* Document Title */}
      <div className="px-6 pb-6">
        <div className="border-t border-border/50 pt-5">
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
            {meta.reportTitle}
          </h3>
          <p className="text-sm font-medium text-amber-500 mt-1">{meta.reportSubtitle}</p>
          <div className="h-1 w-20 bg-linear-to-r from-amber-500 to-amber-400 rounded-full mt-3" />
        </div>
      </div>
    </div>
  );
}
