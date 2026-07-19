"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BOQReportErrorProps {
  onRetry?: () => void;
}

export function BOQReportError({ onRetry }: BOQReportErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Failed to load BOQ preview
      </h2>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
        There was an error fetching the report data. Please try again later.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
