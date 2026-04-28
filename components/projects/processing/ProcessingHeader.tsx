"use client";

import { Check, RefreshCw, Ruler } from "lucide-react";
import type { ProcessingState } from "./types";
import { PROCESSING_STAGES } from "./types";

interface ProcessingHeaderProps {
  state: ProcessingState;
}

export function ProcessingHeader({ state }: ProcessingHeaderProps) {
  const stageIndex = PROCESSING_STAGES.findIndex((s) => s.key === state.currentStage);

  const getDynamicTitle = () => {
    if (state.status === "completed") return "Processing Complete";
    if (state.status === "error") return "Processing Failed";
    if (stageIndex === 0) return "Uploading... / Polling...";
    if (stageIndex === 1) return "Pooling... / Interpreting...";
    return "Finalizing Results...";
  };

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-xs p-6">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getDynamicTitle()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Analyzing architectural layers and structural symbols...
          </p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
          state.status === "error"
            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
        }`}>
          <span className="text-sm font-bold">{Math.round(state.progress)}%</span>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {state.status === "error" ? "Failed" : "Processing"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-8">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-in-out ${
            state.status === "error"
              ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
          }`}
          style={{ width: `${state.progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex items-center gap-12 px-2">
        {PROCESSING_STAGES.map((stage, index) => {
          const isDone = index < stageIndex || state.status === "completed";
          const isActive = index === stageIndex && state.status !== "completed";

          return (
            <div key={stage.key} className="flex items-center gap-3">
              {index === 0 && (
                <div className={`flex items-center gap-2 ${isDone ? "text-emerald-500" : "text-muted-foreground"}`}>
                  <Check className={`w-4 h-4 ${isDone ? "stroke-3" : ""}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                </div>
              )}
              
              {index === 1 && (
                <div className={`flex items-center gap-2 ${isDone ? "text-emerald-500" : isActive ? "text-amber-500" : "text-muted-foreground"}`}>
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-3" />
                  ) : (
                    <RefreshCw className={`w-4 h-4 ${isActive ? "animate-spin" : ""}`} />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                </div>
              )}

              {index === 2 && (
                <div className={`flex items-center gap-2 ${isDone ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-3" />
                  ) : (
                    <Ruler className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
