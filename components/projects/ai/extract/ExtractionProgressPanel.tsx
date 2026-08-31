"use client";

import { useState } from "react";
import { ArrowRight, Ban, Check, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { summariseNotes } from "../humanise";
import type { ExtractionStep } from "../types";

export function ExtractionProgressPanel({
  steps,
  complete,
  stepProgress,
  onCancel,
  onReview,
  onBackToDrawing,
}: {
  steps: ExtractionStep[];
  complete: boolean;
  /** 0–100 for the step currently running */
  stepProgress: number;
  onCancel: () => void;
  onReview: () => void;
  onBackToDrawing: () => void;
}) {
  return (
    // `overflow-hidden` on the column and `min-w-0` on every child below it is
    // what stops a long server note from widening the panel and pushing the
    // Review Results button off the side of the rail.
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-[#eefafb]">
      <div className="min-w-0 shrink-0 px-5 pb-3 pt-4">
        <h2 className="text-[15px] font-semibold text-slate-800">
          {complete ? "Extraction Complete" : "Extraction in Progress"}
        </h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-px w-3 shrink-0 bg-slate-300" />
          {complete
            ? "All foundational data has been extracted and classified."
            : "Foundational data will be extracted and classified."}
        </p>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-2">
        <div className="min-w-0 space-y-3 rounded-lg border border-[#d9eef1] bg-white p-4">
          {steps.map((step) => (
            <StepRow key={step.id} step={step} progress={stepProgress} />
          ))}
        </div>
      </div>

      <div className="min-w-0 shrink-0 p-4">
        {complete ? (
          <>
            <Button className="h-12 w-full gap-2 text-sm" onClick={onReview}>
              Review Results
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={onBackToDrawing}
              className="mt-3 w-full text-center text-[12px] text-slate-500 transition-colors hover:text-amber-600"
            >
              Back to drawing
            </button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
              className="h-12 w-full gap-2 border-red-300 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Ban className="h-4 w-4" />
              Cancel Processing
            </Button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-red-500">
              <TriangleAlert className="h-3 w-3" />
              (Your data will not be saved)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function StepRow({ step, progress }: { step: ExtractionStep; progress: number }) {
  const done = step.status === "done";
  const running = step.status === "running";
  const [expanded, setExpanded] = useState(false);

  // The last step carries whatever the server observed about the page, which
  // can run to several paragraphs of drawing references. Lead with a couple of
  // sentences and let the rest be opened, rather than spilling out of the rail.
  const { short, full, truncated } = summariseNotes(step.detail);

  return (
    <div className="flex min-w-0 gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-emerald-500 text-white"
            : running
              ? "bg-amber-500 text-white"
              : "bg-slate-200 text-slate-400"
        }`}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`break-words text-[13px] font-semibold ${
            step.status === "pending" ? "text-slate-400" : "text-slate-800"
          }`}
        >
          {step.title}
        </p>
        <p className="mt-0.5 break-words text-[11px] leading-relaxed text-slate-500">
          {expanded ? full : short}
        </p>
        {truncated && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 text-[11px] font-medium text-amber-600 hover:text-amber-700"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}

        {running && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
