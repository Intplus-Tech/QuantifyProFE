"use client";

import { Pause, Play, X, ArrowRight, Box, Ruler, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProcessingState } from "./types";

interface ProcessingFooterProps {
  state: ProcessingState;
  onPause: () => void;
  onCancel: () => void;
  onReviewBOQ: () => void;
}

export function ProcessingFooter({ state, onPause, onCancel, onReviewBOQ }: ProcessingFooterProps) {
  const isCompleted = state.status === "completed";
  const isPaused = state.status === "paused";

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Box className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Objects</p>
              <p className="text-sm font-bold text-foreground">{state.objectsDetected}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Measurements</p>
              <p className="text-sm font-bold text-foreground">{state.measurements}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isPaused
                      ? "bg-yellow-500"
                      : "bg-amber-500 animate-pulse"
                  }`}
                />
                {isCompleted ? "Completed" : isPaused ? "Paused" : "Processing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Est. Time</p>
              <p className="text-sm font-bold text-foreground">{state.estimatedTime}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && (
            <>
              <Button variant="outline" size="sm" onClick={onPause}>
                {isPaused ? <Play className="w-3.5 h-3.5 mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={onCancel}>
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            </>
          )}
          <Button
            size="sm"
            disabled={!isCompleted}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm border border-amber-600/20 disabled:opacity-40"
            onClick={onReviewBOQ}
          >
            Review BOQ
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
