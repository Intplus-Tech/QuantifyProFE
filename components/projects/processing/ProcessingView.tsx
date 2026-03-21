"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  useGetBimStatusQuery,
  useGetPdfBoqJobByIdQuery,
  useCreateProjectFromPdfBoqMutation,
} from "@/store/api/projectsApi";
import { ProcessingHeader } from "./ProcessingHeader";
import { DrawingViewer } from "./DrawingViewer";
import { DetectionLog } from "./DetectionLog";
import { ProcessingFooter } from "./ProcessingFooter";
import { useMockProcessing } from "./mock-data";
import { RootState } from "@/store";

interface ProcessingViewProps {
  projectId: string;
  basePath?: string; // e.g. "/projects" or "/enterprise/projects"
}

export function ProcessingView({
  projectId,
  basePath = "/projects",
}: ProcessingViewProps) {
  const router = useRouter();
  const { state, pause, cancel } = useMockProcessing("Structural_Plan_V2.cad");

  const newProjectDraft = useSelector(
    (state: RootState) => state.projects.newProjectDraft,
  );
  const sourceJobId = newProjectDraft?.sourceJobId || "";
  const uploadedFileType = newProjectDraft?.uploadedFileType || "";

  const [createPdfProject, { isLoading: isCreatingPdfProject }] =
    useCreateProjectFromPdfBoqMutation();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [bimPollStr, setBimPollStr] = useState(10000);
  const [pdfPollStr, setPdfPollStr] = useState(10000);

  const bimQuery = useGetBimStatusQuery(sourceJobId, {
    skip: !sourceJobId || uploadedFileType !== "bim",
    pollingInterval: bimPollStr,
  });

  const pdfQuery = useGetPdfBoqJobByIdQuery(sourceJobId, {
    skip: !sourceJobId || uploadedFileType !== "pdf",
    pollingInterval: pdfPollStr,
  });

  useEffect(() => {
    if (bimQuery.data?.data?.status === "completed") setBimPollStr(0);
  }, [bimQuery.data?.data?.status]);

  useEffect(() => {
    // Both user response samples mention "success" is conditionally true/false based on completion
    if (pdfQuery.data?.data?.status === "completed") setPdfPollStr(0);
  }, [pdfQuery.data?.data?.status]);

  const realStatus = pdfQuery.data?.data?.status || bimQuery.data?.data?.status;
  const mergedState = { ...state, status: realStatus as any };
  console.log(realStatus, "realStatus");

  const handleCreateProject = async () => {
    if (!newProjectDraft) return;

    if (uploadedFileType === "pdf" && pdfQuery.data?.success) {
      const payload = {
        name: newProjectDraft.projectTitle,
        description: newProjectDraft.description,
        clientName: newProjectDraft.clientName,
        projectCode: newProjectDraft.projectCode,
        projectType: newProjectDraft.projectType,
        projectLocation: newProjectDraft.location,
        drawingType: newProjectDraft.drawingType,
        source: uploadedFileType === "pdf" ? "pdf_boq" : "bim",
        sourceJobId: sourceJobId,
        // companyId: "string",
        libraryItems: ["string"],
        boqResult: pdfQuery.data?.data?.result,
      };

      try {
        const response = await createPdfProject({
          jobId: sourceJobId,
          body: payload,
        }).unwrap();
        if (response.success && response.data?._id) {
          setCreatedProjectId(response.data._id);
        }
      } catch (err) {
        console.error("Failed to create PDF Boq Project", err);
      }
    } else if (uploadedFileType === "bim" && bimQuery.data?.success) {
      // Pending BIM specific create-project API execution
      console.log("BIM Project Creation to be hooked up!");
    }
  };

  const handleCancel = () => {
    cancel();
    router.push(basePath);
  };

  const handleReviewBOQ = () => {
    router.push(`${basePath}/${projectId}/boq`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(basePath)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Processing</h1>
          <p className="text-xs text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>
      </div>

      {/* Header (progress + stages) */}
      <ProcessingHeader state={state} />

      {/* Main content: Drawing viewer + Detection log */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DrawingViewer detections={state.detections} />
        </div>
        <div className="lg:col-span-2">
          <DetectionLog logs={state.logs} />
        </div>
      </div>

      {/* Footer (stats + actions) */}
      <ProcessingFooter
        state={mergedState}
        onPause={pause}
        onCancel={handleCancel}
        onReviewBOQ={handleReviewBOQ}
        onCreateProject={handleCreateProject}
        isProjectCreated={!!createdProjectId}
        isCreatingProject={isCreatingPdfProject}
      />
    </div>
  );
}
