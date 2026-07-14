"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SCALE_MEASURE_OPTIONS } from "./constants";

export function ScaleSetupModal({
  open,
  measure,
  onMeasureChange,
  onCancel,
  onYes,
}: {
  open: boolean;
  measure: string;
  onMeasureChange: (v: string) => void;
  onCancel: () => void;
  onYes: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-5 py-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-amber-600">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="3" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="16.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="12" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16.5" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800">Page Scale Setup</h3>
            <p className="text-[12px] text-slate-500 mt-1">Would you like to scale for this page?</p>
          </div>

          <div className="w-full space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              What do you want to measure?
            </p>
            <Select value={measure} onValueChange={onMeasureChange}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCALE_MEASURE_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button onClick={onYes} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
              Yes, I want to Scale
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
