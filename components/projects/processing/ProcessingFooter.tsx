"use client";

import {
  Pause,
  Play,
  X,
  ArrowRight,
  Box,
  Ruler,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProcessingState } from "./types";

interface ProcessingFooterProps {
  state: ProcessingState;
  onPause: () => void;
  onCancel: () => void;
  onReviewBOQ: () => void;
  onCreateProject?: () => void;
  isProjectCreated?: boolean;
  isCreatingProject?: boolean;
}

export function ProcessingFooter({
  state,
  onPause,
  onCancel,
  onReviewBOQ,
  onCreateProject,
  isProjectCreated,
  isCreatingProject,
}: ProcessingFooterProps) {
  const isCompleted = state.status === "completed";
  const isPaused = state.status === "paused";

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3 pr-8 border-r border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Box className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Objects Detected
              </p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                {state.objectsDetected}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-8 border-r border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Ruler className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Measurements
              </p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                {state.measurements}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-8 border-r border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Status
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                  }`}
                />
                {isCompleted ? "Analysis Complete" : "Processing Drawing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Estimated Time
              </p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                {state.estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && (
            <>
              <Button variant="outline" size="sm" onClick={onPause}>
                {isPaused ? (
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5 mr-1.5" />
                )}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={onCancel}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            </>
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

          {/* 
          {isCompleted && !isProjectCreated && (
            <Button
              size="sm"
              disabled={isCreatingProject}
              className="bg-emerald-600 px-6 hover:bg-emerald-700 text-white shadow-sm border border-emerald-700/20 disabled:opacity-40 h-12!"
              onClick={onCreateProject}
            >
              {isCreatingProject ? "Creating Project..." : "Create Project"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )} 
          */}
        </div>
      </div>
    </div>
  );
}
