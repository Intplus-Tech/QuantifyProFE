"use client";

import {
  ArrowRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProcessingState } from "./types";

interface ProcessingFooterProps {
  apiStatus?: string;
  state: ProcessingState;
  onPause: () => void;
  onCancel: () => void;
  onTryAgain: () => void;
  onReviewBOQ: () => void;
  onCreateProject?: () => void;
  isProjectCreated?: boolean;
  isCreatingProject?: boolean;
}

export function ProcessingFooter({
  apiStatus,
  state,
  onPause,
  onCancel,
  onTryAgain,
  onReviewBOQ,
  onCreateProject,
  isProjectCreated,
  isCreatingProject,
}: ProcessingFooterProps) {
  const isCompleted =
    state.status === "completed" ||
    apiStatus === "completed";

  const getStatusText = () => {
    switch (apiStatus) {
      case "pending":
        return "Job Queued...";
      case "extracting":
        return "Extracting Drawings...";
      case "embedding":
        return "Vectorizing Details...";
      case "generating":
        return "Generating BOQ via AI...";
      case "success":
        return "Drawings Processed";
      case "completed":
        return "Analysis Complete";
      case "failed":
        return "Processing Failed";
      case "processing":
        return "Processing Drawing...";
      default:
        return apiStatus ? apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1) : "Processing Component...";
    }
  };

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm p-4">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* We leave the left side empty to align the right side, or we can just have a clean layout */}
        <div className="flex-1"></div>

        {/* Actions / Status Box */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 pr-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
              <Activity className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-orange-500'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Status
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                  }`}
                />
                {getStatusText()}
              </p>
            </div>
          </div>

          {apiStatus === "failed" && (
            <Button
              size="sm"
              variant="outline"
              className="h-12! border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 px-6 font-bold uppercase tracking-wider"
              onClick={onTryAgain}
            >
              Try Again
            </Button>
          )}

          {isCompleted && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 px-6 text-white shadow-sm border border-amber-600/20 h-12!"
              onClick={onReviewBOQ}
            >
              Review BOQ
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}

          {isCompleted && isProjectCreated && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 px-6 text-white shadow-sm border border-amber-600/20 h-12!"
              onClick={onReviewBOQ}
            >
              Review BOQ
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
