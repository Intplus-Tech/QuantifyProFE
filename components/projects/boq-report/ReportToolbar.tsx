"use client";

import { ArrowLeft, BookmarkPlus, Download, Loader2, Printer, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useGetProjectByIdQuery,
  useLazyGetPdfBoqJobPdfQuery,
} from "@/store/api/projectsApi";
import { useCreateTemplateMutation } from "@/store/api/templatesApi";
import { TemplateBoqResult } from "@/types/templates";
import { toast } from "sonner";

interface ReportToolbarProps {
  projectId: string;
  basePath: string;
  reportRef: string;
}

export function ReportToolbar({
  projectId,
  basePath,
  reportRef,
}: ReportToolbarProps) {
  const router = useRouter();
  const { data: projectResponse } = useGetProjectByIdQuery(projectId);
  const [triggerDownload, { isLoading: isDownloading }] =
    useLazyGetPdfBoqJobPdfQuery();
  const [createTemplate, { isLoading: isCreatingTemplate }] =
    useCreateTemplateMutation();

  const handleAddToTemplate = async () => {
    const project = projectResponse?.data;

    if (!project || !project.boqResult) {
      toast.error("Project data or BOQ result missing.");
      return;
    }

    try {
      const templateBoqResult: TemplateBoqResult = {
        projectTitle: project.boqResult.projectTitle || project.name,
        sections: project.boqResult.sections.map((section) => ({
          sectionName: section.sectionName,
          workItems: section.workItems.map((item: any) => ({
            item: item.item,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate || 0,
            total: item.total || 0,
          })),
        })),
      };

      await createTemplate({
        sourceProjectId: projectId,
        name: project.name,
        description: project.description,
        icon: "🏠",
        boqResult: templateBoqResult,
        keyFeatures: ["Foundation", "Structure", "MEP"],
        tags: ["standard", "project-derived"],
      }).unwrap();

      toast.success("Template created successfully from this project!");
    } catch (error: any) {
      console.error("Failed to create template:", error);
      toast.error(
        error?.data?.message || "Failed to create template. Please try again.",
      );
    }
  };

  const handleDownloadReport = async () => {
    const sourceJobId = projectResponse?.data?.sourceJobId;

    if (!sourceJobId) {
      toast.error("No source job found for this project's PDF.");
      return;
    }

    try {
      const blob = await triggerDownload(sourceJobId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BOQ_${reportRef.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to processing"
            className="h-9 w-9 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => router.push(`${basePath}/${projectId}/processing`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Final BOQ Report Preview
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                {reportRef}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Print report"
            className="h-9 w-9 rounded-lg p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={handleAddToTemplate}
            disabled={isCreatingTemplate}
          >
            {isCreatingTemplate ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save as Template
          </Button>

          <Button
            size="sm"
            className="h-9 rounded-lg bg-amber-500 text-white shadow-sm hover:bg-amber-600"
            onClick={handleDownloadReport}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
