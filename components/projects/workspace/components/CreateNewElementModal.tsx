"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
import { toast } from "sonner";
import type { PileRow } from "./types";

export function CreateNewElementModal({
  open,
  onClose,
  onUseExisting,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onUseExisting: () => void;
  onCreate: (data: { categoryFolder: string; rows: PileRow[] }) => void;
}) {
  const [categoryFolder, setCategoryFolder] = useState("Substructure / Pile");
  const [measurementUnit, setMeasurementUnit] = useState("Counts");
  const [pileRows, setPileRows] = useState<PileRow[]>([
    { id: "1", name: "Bored Pile - 750mm", count: "18", volume: "4.50" },
    { id: "2", name: "Bored Pile - 600mm", count: "4", volume: "4.50" },
    { id: "3", name: "Bored Pile - 450mm", count: "4", volume: "4.50" },
  ]);

  function updatePileRow(id: string, field: keyof PileRow, value: string) {
    setPileRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function handleCreate() {
    toast.success("Element created");
    onCreate({ categoryFolder, rows: pileRows });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl! max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base font-bold">Create New Element</DialogTitle>
          <p className="text-[12px] text-slate-500">Define custom parameters and sub-items</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Basic Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">Category folder</label>
                <Select value={categoryFolder} onValueChange={setCategoryFolder}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Substructure / Pile">Substructure / Pile</SelectItem>
                    <SelectItem value="Substructure / Pile Caps">Substructure / Pile Caps</SelectItem>
                    <SelectItem value="Substructure / Ground Beams">Substructure / Ground Beams</SelectItem>
                    <SelectItem value="Superstructure / Columns">Superstructure / Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">Measurement Unit</label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Counts">Counts</SelectItem>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                    <SelectItem value="m">m (linear)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parameters table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Assign Pile Parameters
              </p>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 bg-white">
              {["Pile", "Count", "Volume Per Pile"].map((h) => (
                <div key={h} className="px-4 py-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  {h}
                </div>
              ))}
            </div>
            {pileRows.map((row) => (
              <div key={row.id} className="grid grid-cols-3 border-b border-slate-50 last:border-0">
                <div className="px-4 py-3 text-[13px] text-slate-600 flex items-center">{row.name}</div>
                <div className="px-3 py-2 flex items-center">
                  <Input
                    value={row.count}
                    onChange={(e) => updatePileRow(row.id, "count", e.target.value)}
                    className="h-8 text-sm w-20"
                  />
                </div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <Input
                    value={row.volume}
                    onChange={(e) => updatePileRow(row.id, "volume", e.target.value)}
                    className="h-8 text-sm w-24"
                  />
                  <span className="text-[11px] text-slate-500">m³</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onUseExisting}
            className="text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Use Existing Element
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5">
              Create Element <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
