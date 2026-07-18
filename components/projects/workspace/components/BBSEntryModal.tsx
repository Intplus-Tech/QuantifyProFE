"use client";

import { Hash, Plus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { BBSRow } from "./types";
import { BAR_SIZE_OPTIONS } from "./constants";

export function BBSEntryModal({
  open,
  rows,
  onRowChange,
  onAddRow,
  onCancel,
  onSave,
}: {
  open: boolean;
  rows: BBSRow[];
  onRowChange: (id: string, field: keyof BBSRow, value: string) => void;
  onAddRow: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-3xl!">
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

        <p className="text-[13px] text-slate-600">Enter the Bar Bending Schedule as shown on the drawing:</p>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200">
            {["Bar Mark", "Bar Size", "Length (mm)", "Quantity"].map((h) => (
              <div key={h} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {h}
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-4">
                <div className="px-2 py-2">
                  <Input value={row.mark} onChange={(e) => onRowChange(row.id, "mark", e.target.value)} className="h-8 text-sm" placeholder="B1" />
                </div>
                <div className="px-2 py-2">
                  <Select value={row.size} onValueChange={(v) => onRowChange(row.id, "size", v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BAR_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-2 py-2">
                  <Input value={row.length} onChange={(e) => onRowChange(row.id, "length", e.target.value)} className="h-8 text-sm" placeholder="5,400" />
                </div>
                <div className="px-2 py-2">
                  <Input value={row.quantity} onChange={(e) => onRowChange(row.id, "quantity", e.target.value)} className="h-8 text-sm" placeholder="8" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2.5 border-t border-slate-100">
            <button
              onClick={onAddRow}
              className="text-amber-600 hover:text-amber-700 text-[12px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} className="h-10!">Cancel</Button>
          <Button onClick={onSave} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 h-10!">
            <Save className="w-3.5 h-3.5" /> Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
