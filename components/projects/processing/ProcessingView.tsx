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
import { toast } from "sonner";

interface ProcessingViewProps {
  projectId: string;
  basePath?: string; // e.g. "/projects" or "/enterprise/projects"
}

export function ProcessingView({
  projectId,
  basePath = "/projects",
}: ProcessingViewProps) {
  const router = useRouter();
  const newProjectDraft = useSelector(
    (state: RootState) => state.projects.newProjectDraft,
  );
  const { state, pause, cancel } = useMockProcessing(
    newProjectDraft?.fileName || "",
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
    if (!newProjectDraft) {
      router.push(basePath);
    }
  }, [newProjectDraft]);

  useEffect(() => {
    if (
      bimQuery.data?.data?.status === "completed" ||
      bimQuery.data?.data?.status === "failed"
    )
      setBimPollStr(0);
  }, [bimQuery.data?.data?.status]);

  useEffect(() => {
    if (
      pdfQuery.data?.data?.status === "completed" ||
      pdfQuery.data?.data?.status === "failed"
    )
      setPdfPollStr(0);
  }, [pdfQuery.data?.data?.status]);

  const apiStatus = pdfQuery.data?.data?.status || bimQuery.data?.data?.status;

  // Dynamic progress calculation based on polling status
  const getProgress = () => {
    if (apiStatus === "completed") return 100;
    if (apiStatus === "processing") return 65;
    if (apiStatus === "pending") return 30;
    if (apiStatus === "failed") return 100;
    return state.progress; // Default to mock progress if status is unknown/initial
  };

  const computedProgress = getProgress();

  // Map API status to ProcessingStatus union
  const mappedStatus: any =
    apiStatus === "pending"
      ? "processing"
      : apiStatus === "failed"
        ? "error"
        : apiStatus;

  const mergedState: any = {
    ...state,
    status: mappedStatus || state.status,
    progress: computedProgress,
    logs:
      apiStatus === "completed"
        ? state.logs.map((log) => ({ ...log, type: "success" as const }))
        : state.logs,
  };
  console.log(apiStatus, "realStatus");

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
          toast.success(
            response.message || "Project created successfully from PDF BOQ!",
          );
        }
      } catch (err: any) {
        console.error("Failed to create PDF Boq Project", err);
        toast.error(
          err?.data?.message || "Failed to create project. Please try again.",
        );
      }
    } else if (uploadedFileType === "bim" && bimQuery.data?.success) {
      console.log("BIM Project Creation to be hooked up!");
      toast.info("BIM Project creation is coming soon.");
    }
  };

  const handleCancel = () => {
    cancel();
    router.push(basePath);
  };

  const handleReviewBOQ = () => {
    const finalId = createdProjectId || projectId;
    router.push(`${basePath}/${finalId}/boq`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Header (progress + stages) */}
      <ProcessingHeader state={mergedState} />

      {/* Main content: Drawing viewer + Detection log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        <div className="lg:col-span-8 h-full">
          <DrawingViewer
            detections={mergedState.detections}
            fileUrl={newProjectDraft?.fileUrl}
            fileType={uploadedFileType}
          />
        </div>
        <div className="lg:col-span-4 h-full">
          <DetectionLog logs={mergedState.logs} />
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
