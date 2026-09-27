"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetBimJobByIdQuery } from "@/store/api/projectsApi";
import { ApsViewer } from "./viewers/ApsViewer";
import type { Project } from "@/types/projects";

interface BimProjectWorkspaceProps {
  project: Project;
  basePath: string;
}

/**
 * Workspace for a project created from the backend's /bim/* pipeline
 * (POST /bim/upload → /bim/boq/{urn} → /bim/jobs/{jobId}/create-project).
 * The BOQ already comes from Autodesk's Properties API (real Volume/Area/
 * Family/Type), not a manual measurement — so this renders the Autodesk
 * viewer straight from the job's already-translated urn (never re-uploads)
 * and links to the BOQ page, instead of the PDF/CAD takeoff canvas.
 */
export function BimProjectWorkspace({ project, basePath }: BimProjectWorkspaceProps) {
  const router = useRouter();
  const { data, isLoading } = useGetBimJobByIdQuery(project.sourceJobId ?? "", {
    skip: !project.sourceJobId,
  });
  const job = data?.data;

  return (
    <div className="relative flex flex-col h-screen bg-[#e8edf2]">
      <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(basePath)}
            className="gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
          <span className="text-sm font-semibold text-slate-700 truncate">
            {project.name}
          </span>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          onClick={() => router.push(`${basePath}/${project._id}/boq`)}
        >
          <FileBarChart className="w-4 h-4" /> View BOQ
        </Button>
      </div>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        )}
        {!isLoading && !job?.urn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-8">
            <p className="text-sm font-medium text-slate-600">
              Model reference not found
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              This project&apos;s original BIM/CAD model couldn&apos;t be
              located, but its Bill of Quantities is still available.
            </p>
          </div>
        )}
        {job?.urn && (
          <ApsViewer url="" fileName={job.originalFilename} urn={job.urn} />
        )}
      </div>
    </div>
  );
}
