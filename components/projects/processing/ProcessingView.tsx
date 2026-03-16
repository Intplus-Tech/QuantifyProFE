"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProcessingHeader } from "./ProcessingHeader";
import { DrawingViewer } from "./DrawingViewer";
import { DetectionLog } from "./DetectionLog";
import { ProcessingFooter } from "./ProcessingFooter";
import { useMockProcessing } from "./mock-data";

interface ProcessingViewProps {
  projectId: string;
  basePath?: string; // e.g. "/projects" or "/enterprise/projects"
}

export function ProcessingView({ projectId, basePath = "/projects" }: ProcessingViewProps) {
  const router = useRouter();
  const { state, pause, cancel } = useMockProcessing("Structural_Plan_V2.cad");

  const handleCancel = () => {
    cancel();
    router.push(basePath);
  };

  const handleReviewBOQ = () => {
    router.push(`${basePath}/${projectId}/boq`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(basePath)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Processing</h1>
          <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
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
        state={state}
        onPause={pause}
        onCancel={handleCancel}
        onReviewBOQ={handleReviewBOQ}
      />
    </div>
  );
}
