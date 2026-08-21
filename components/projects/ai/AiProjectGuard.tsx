"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isValidObjectId } from "@/utils/apiError";

/**
 * Blocks the AI screens when the route carries something that is not a real
 * project id (an old `draft` link, a hand-typed URL). Without this the screens
 * render and every call fails with 400 "Invalid project ID" far from the cause.
 */
export function AiProjectGuard({
  projectId,
  basePath,
  children,
}: {
  projectId: string;
  basePath: string;
  children: ReactNode;
}) {
  if (isValidObjectId(projectId)) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <TriangleAlert className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="text-base font-semibold text-slate-900">
          This project was never created
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The address carries{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{projectId}</code>{" "}
          instead of a project id, so the AI takeoff has nothing to attach to.
          Start again from the project details.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href={`${basePath}/ai/new`}>Start a new AI project</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={basePath}>Back to Projects</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
