"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmAssignmentModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Confirm Assignment</DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-slate-600">You are about to add 12 columns to the existing element:</p>

        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0" />
            <span className="text-sm font-semibold text-slate-800">Piles</span>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Current items</span>
              <span className="text-slate-700">15 Piles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adding</span>
              <span className="text-amber-600 font-semibold">+ 2 Piles</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">New total</span>
              <span className="text-slate-800">27 items</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-amber-500 hover:bg-amber-600 text-white">
            Confirm Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
