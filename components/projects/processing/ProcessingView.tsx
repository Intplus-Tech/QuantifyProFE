"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  useGetBimStatusQuery,
  useGetBimJobByIdQuery,
  useSubmitBimBoqJobMutation,
  useCreateProjectFromBimBoqMutation,
  useGetPdfBoqJobByIdQuery,
  useCreateProjectFromPdfBoqMutation,
  useGetMultiBoqJobByIdQuery,
  useCreateProjectFromMultiBoqMutation,
} from "@/store/api/projectsApi";
import { ProcessingHeader } from "./ProcessingHeader";
import { DrawingViewer } from "./DrawingViewer";
import { DetectionLog } from "./DetectionLog";
import { ProcessingFooter } from "./ProcessingFooter";
import { ReviewBOQModal } from "./ReviewBOQModal";
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
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { state, pause, cancel } = useMockProcessing(
    newProjectDraft?.fileName || "",
  );
  const sourceJobId = newProjectDraft?.sourceJobId || "";
  const uploadedFileType = newProjectDraft?.uploadedFileType || "";

  const [createPdfProject, { isLoading: isCreatingPdfProject }] =
    useCreateProjectFromPdfBoqMutation();
  const [createBimProject, { isLoading: isCreatingBimProject }] =
    useCreateProjectFromBimBoqMutation();
  const [createMultiProject, { isLoading: isCreatingMultiProject }] =
    useCreateProjectFromMultiBoqMutation();
  const [submitBimBoqJob] = useSubmitBimBoqJobMutation();

  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [bimJobId, setBimJobId] = useState<string | null>(null);
  const [bimPollStr, setBimPollStr] = useState(10000);
  const [bimJobPollStr, setBimJobPollStr] = useState(10000);
  const [pdfPollStr, setPdfPollStr] = useState(10000);
  const [multiPollStr, setMultiPollStr] = useState(10000);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const bimQuery = useGetBimStatusQuery(sourceJobId, {
    skip: !sourceJobId || uploadedFileType !== "bim" || !!bimJobId,
    pollingInterval: bimPollStr,
  });

  const bimJobQuery = useGetBimJobByIdQuery(bimJobId || "", {
    skip: !bimJobId || uploadedFileType !== "bim",
    pollingInterval: bimJobPollStr,
  });

  const pdfQuery = useGetPdfBoqJobByIdQuery(sourceJobId, {
    skip: !sourceJobId || uploadedFileType !== "pdf",
    pollingInterval: pdfPollStr,
  });

  const multiQuery = useGetMultiBoqJobByIdQuery(sourceJobId, {
    skip: !sourceJobId || uploadedFileType !== "multi",
    pollingInterval: multiPollStr,
  });

  useEffect(() => {
    if (!newProjectDraft) {
      router.push(basePath);
    }
  }, [newProjectDraft]);

  useEffect(() => {
    if (
      bimQuery.data?.data?.status === "completed" ||
      bimQuery.data?.data?.status === "failed" ||
      bimQuery.data?.data?.status === "success"
    ) {
      setBimPollStr(0);
      if (
        uploadedFileType === "bim" &&
        bimQuery.data?.data?.status === "success" &&
        !bimJobId
      ) {
        const invokeSubmitJob = async () => {
          try {
            const response = await submitBimBoqJob(sourceJobId).unwrap();
            if (response.success && response.data?.jobId) {
              setBimJobId(response.data.jobId);
            }
          } catch (err) {
            console.error("Failed to submit BIM BOQ job", err);
            toast.error("Failed to submit BIM processing job");
          }
        };

        invokeSubmitJob();
      }
    }
  }, [
    bimQuery.data?.data?.status,
    uploadedFileType,
    bimJobId,
    sourceJobId,
    submitBimBoqJob,
  ]);

  useEffect(() => {
    if (
      bimJobQuery.data?.data?.status === "completed" ||
      bimJobQuery.data?.data?.status === "failed"
    )
      setBimJobPollStr(0);
  }, [bimJobQuery.data?.data?.status]);

  useEffect(() => {
    if (
      pdfQuery.data?.data?.status === "completed" ||
      pdfQuery.data?.data?.status === "failed"
    )
      setPdfPollStr(0);
  }, [pdfQuery.data?.data?.status]);

  useEffect(() => {
    if (
      multiQuery.data?.data?.status === "completed" ||
      multiQuery.data?.data?.status === "failed"
    )
      setMultiPollStr(0);
  }, [multiQuery.data?.data?.status]);

  const apiStatus =
    uploadedFileType === "pdf"
      ? pdfQuery.data?.data?.status
      : uploadedFileType === "multi"
        ? multiQuery.data?.data?.status
        : uploadedFileType === "bim"
          ? bimJobQuery.data?.data?.status ||
            (bimQuery.data?.data?.status === "success"
              ? "processing"
              : bimQuery.data?.data?.status)
          : state.status;

  const getProgress = () => {
    if (apiStatus === "completed") return 100;
    if (apiStatus === "failed") return 0;
    if (apiStatus === "generating") return 85;
    if (apiStatus === "embedding") return 65;
    if (apiStatus === "extracting") return 30;
    if (apiStatus === "processing") return 65;
    if (apiStatus === "success") return 65;
    if (apiStatus === "pending") return 15;
    return state.progress;
  };

  const computedProgress = getProgress();

  // Map API status to ProcessingStatus union
  const mappedStatus: any = [
    "pending",
    "success",
    "processing",
    "extracting",
    "embedding",
    "generating",
  ].includes(apiStatus as string)
    ? "processing"
    : apiStatus === "failed"
      ? "error"
      : apiStatus;

  const mergedState: any = {
    ...state,
    status: mappedStatus || state.status,
    progress: computedProgress,
    logs:
      apiStatus === "completed" || apiStatus === "success"
        ? state.logs.map((log: any) => ({ ...log, type: "success" as const }))
        : state.logs,
  };

  const handleCreateProject = async (updatedResult?: any) => {
    if (!newProjectDraft) return;

    if (uploadedFileType === "pdf" && pdfQuery.data?.success) {
      const payload = {
        name: newProjectDraft.projectTitle,
        description: newProjectDraft.description,
        companyId: currentUser?._id || "",
        clientId: newProjectDraft.clientId || "",
        clientName: newProjectDraft.clientName,
        projectCode: newProjectDraft.projectCode,
        projectType: newProjectDraft.projectType,
        projectLocation: newProjectDraft.location,
        drawingType: [newProjectDraft.drawingType.toLowerCase()],
        // These might be internal to the project service
        source: "pdf_boq",
        sourceJobId: sourceJobId,
        libraryItems: [""],
        boqResult: updatedResult || pdfQuery.data?.data?.result,
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
    } else if (uploadedFileType === "bim" && bimJobQuery.data?.success) {
      const payload = {
        name: newProjectDraft.projectTitle,
        description: newProjectDraft.description,
        companyId: currentUser?._id || "",
        clientId: newProjectDraft.clientId || "",
        clientName: newProjectDraft.clientName,
        projectCode: newProjectDraft.projectCode,
        projectType: newProjectDraft.projectType,
        projectLocation: newProjectDraft.location,
        drawingType: [newProjectDraft.drawingType.toLowerCase()],
        source: "bim",
        sourceJobId: bimJobId || sourceJobId,
        libraryItems: [""],
        boqResult: updatedResult || bimJobQuery.data?.data?.result,
      };

      try {
        const response = await createBimProject({
          jobId: bimJobId || sourceJobId,
          body: payload as any,
        }).unwrap();
        if (response.success && response.data?._id) {
          setCreatedProjectId(response.data._id);
          toast.success(
            response.message || "Project created successfully from BIM BOQ!",
          );
        }
      } catch (err: any) {
        console.error("Failed to create BIM Boq Project", err);
        toast.error(
          err?.data?.message || "Failed to create project. Please try again.",
        );
      }
    } else if (uploadedFileType === "multi" && multiQuery.data?.success) {
      const payload = {
        name: newProjectDraft.projectTitle,
        description: newProjectDraft.description,
        companyId: currentUser?._id || "",
        clientId: newProjectDraft.clientId || "",
        clientName: newProjectDraft.clientName,
        projectCode: newProjectDraft.projectCode,
        projectType: newProjectDraft.projectType,
        projectLocation: newProjectDraft.location,
        drawingType: [newProjectDraft.drawingType.toLowerCase()],
        source: "multi",
        sourceJobId: sourceJobId,
        libraryItems: [""],
        boqResult: updatedResult || multiQuery.data?.data?.result,
      };

      try {
        const response = await createMultiProject({
          jobId: sourceJobId,
          body: payload as any,
        }).unwrap();
        if (response.success && response.data?._id) {
          setCreatedProjectId(response.data._id);
          toast.success(
            response.message ||
              "Project created successfully from multi files!",
          );
        }
      } catch (err: any) {
        console.error("Failed to create multi files Project", err);
        toast.error(
          err?.data?.message || "Failed to create project. Please try again.",
        );
      }
    }
  };

  const handleCancel = () => {
    cancel();
    router.push(basePath);
  };

  const handleTryAgain = () => {
    router.push(basePath);
  };

  const handleReviewBOQ = () => {
    setIsReviewOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Header (progress + stages) */}
      <ProcessingHeader state={mergedState} />

      {/* Main content: Drawing viewer + Detection log */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]"> */}
      <div className="w-full gap-6 min-h-[600px]">
        <div className="w-full h-full">
          <DrawingViewer
            detections={mergedState.detections}
            fileUrl={newProjectDraft?.fileUrl}
            fileType={uploadedFileType}
            fileName={newProjectDraft?.fileName}
          />
        </div>
        {/* <div className="lg:col-span-4 h-full">
          <DetectionLog logs={mergedState.logs} />
        </div> */}
      </div>

      {/* Footer (stats + actions) */}
      <ProcessingFooter
        apiStatus={apiStatus as string}
        state={mergedState}
        onPause={pause}
        onCancel={handleCancel}
        onTryAgain={handleTryAgain}
        onReviewBOQ={handleReviewBOQ}
        onCreateProject={handleCreateProject}
        isProjectCreated={!!createdProjectId}
        isCreatingProject={
          isCreatingPdfProject || isCreatingBimProject || isCreatingMultiProject
        }
      />

      <ReviewBOQModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        data={
          pdfQuery.data?.data || bimJobQuery.data?.data || multiQuery.data?.data
        }
        jobType={uploadedFileType}
        onCreateProject={handleCreateProject}
        isCreatingProject={
          isCreatingPdfProject || isCreatingBimProject || isCreatingMultiProject
        }
        isProjectCreated={!!createdProjectId}
        previewBoq={() => router.push(`${basePath}/${createdProjectId}/boq`)}
      />
    </div>
  );
}
