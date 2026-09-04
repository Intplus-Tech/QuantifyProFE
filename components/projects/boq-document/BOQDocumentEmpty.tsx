"use client";

import Link from "next/link";
import { AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BOQDocumentEmptyProps {
  variant: "error" | "no-boq";
  workspaceHref: string;
  projectId?: string;
  projectName?: string;
}

export function BOQDocumentEmpty({
  variant,
  workspaceHref,
  projectId,
  projectName,
}: BOQDocumentEmptyProps) {
  const isError = variant === "error";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          isError ? "bg-red-50" : "bg-amber-50"
        }`}
      >
        {isError ? (
          <AlertTriangle className="h-6 w-6 text-red-500" />
        ) : (
          <FileSpreadsheet className="h-6 w-6 text-amber-500" />
        )}
      </div>

      <h1 className="mt-4 text-lg font-bold text-slate-900">
        {isError ? "Couldn't load the BOQ" : "No BOQ document yet"}
      </h1>

      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        {isError
          ? `We couldn't fetch the bill of quantities for project ${projectId ?? ""}. The request failed — try again in a moment.`
          : `${projectName ?? "This project"} has no BOQ document yet. Commit a takeoff calculation from the workspace to generate one.`}
      </p>

      <Button asChild variant="outline" size="sm" className="mt-6 h-9">
        <Link href={workspaceHref}>Back to Workspace</Link>
      </Button>
    </div>
  );
}
