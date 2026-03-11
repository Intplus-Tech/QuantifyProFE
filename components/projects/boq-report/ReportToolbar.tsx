"use client";

import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ReportToolbarProps {
  projectId: string;
  basePath: string;
  reportRef: string;
}

export function ReportToolbar({ projectId, basePath, reportRef }: ReportToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`${basePath}/${projectId}/processing`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Final BOQ Report Preview</h1>
          <p className="text-xs text-muted-foreground">
            {reportRef} · Generated from AI analysis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit Report
        </Button>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm border border-amber-600/20"
          onClick={() => window.print()}
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print Report
        </Button>
      </div>
    </div>
  );
}
