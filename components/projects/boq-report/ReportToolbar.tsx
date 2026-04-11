"use client";

import { ArrowLeft, Pencil, Printer } from "lucide-react";
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
      // Map BoqResult to TemplateBoqResult structure
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
      link.setAttribute(
        "download",
        `BOQ_${reportRef.replace(/\s+/g, "_")}.pdf`,
      );
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-8"
          onClick={() => router.push(`${basePath}/${projectId}/processing`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Final BOQ Report Preview
          </h1>
          <p className="text-xs text-muted-foreground">
            {reportRef} · Generated from AI analysis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-12"
          size="sm"
          onClick={handleAddToTemplate}
          disabled={isCreatingTemplate}
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          {isCreatingTemplate ? "Adding..." : "Add to Template"}
        </Button>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white h-12 shadow-sm border border-amber-600/20"
          onClick={handleDownloadReport}
          disabled={isDownloading}
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          {isDownloading ? "Downloading..." : "Download Report"}
        </Button>
      </div>
    </div>
  );
}
