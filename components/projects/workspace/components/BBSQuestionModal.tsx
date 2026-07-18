"use client";

import { Hash, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BBSQuestionModal({
  open,
  answer,
  onAnswerChange,
  onClose,
  onSkip,
  onContinue,
}: {
  open: boolean;
  answer: "yes" | "no";
  onAnswerChange: (v: "yes" | "no") => void;
  onClose: () => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Bar Bending Schedule
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <p className="text-[13px] text-slate-600">
            Does this drawing contain a Bar Bending Schedule (BBS) or Reinforcement Table?
          </p>
          <div className="space-y-2">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onAnswerChange(v)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                  answer === v ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    answer === v ? "border-amber-500" : "border-slate-300"
                  }`}
                >
                  {answer === v && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <span className={`text-[13px] font-semibold ${answer === v ? "text-amber-700" : "text-slate-600"}`}>
                  {v === "yes"
                    ? "Yes, this drawing has a Bending Schedule"
                    : "No, I will measure rebar manually"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <Button variant="outline" onClick={onSkip}>Skip</Button>
          <Button
            onClick={onContinue}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5"
          >
            Continue <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
