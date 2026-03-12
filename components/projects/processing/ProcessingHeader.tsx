"use client";

import { Check, Loader2 } from "lucide-react";
import type { ProcessingState } from "./types";
import { PROCESSING_STAGES } from "./types";

interface ProcessingHeaderProps {
  state: ProcessingState;
}

export function ProcessingHeader({ state }: ProcessingHeaderProps) {
  const stageIndex = PROCESSING_STAGES.findIndex((s) => s.key === state.currentStage);

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm p-6">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{state.fileName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{state.description}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${
            state.status === "completed"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : state.status === "paused"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {state.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
          {Math.round(state.progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${state.progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex items-center justify-between gap-2">
        {PROCESSING_STAGES.map((stage, index) => {
          const isDone = index < stageIndex || state.status === "completed";
          const isActive = index === stageIndex && state.status !== "completed";

          return (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              {/* Dot / check */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </div>
              <span
                className={`text-xs font-medium truncate ${
                  isDone
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>

              {/* Connector */}
              {index < PROCESSING_STAGES.length - 1 && (
                <div
                  className={`hidden sm:block flex-1 h-px ${
                    isDone ? "bg-emerald-400" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
