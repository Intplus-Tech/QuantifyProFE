"use client";

import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AssignmentCompleteModal({
  open,
  onClose,
  onViewElement,
}: {
  open: boolean;
  onClose: () => void;
  onViewElement: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Assignment Complete
          </DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-slate-600">Successfully added 12 Piles to:</p>

        <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Piles</span>
          </div>
          <p className="text-[12px] text-slate-500 pl-7">Now contains: 15 Piles + 2 Piles = 17 items</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onViewElement} className="bg-amber-500 hover:bg-amber-600 text-white">
            View Element
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
