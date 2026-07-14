"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ELEMENT_CONFIGS, BAR_SIZE_OPTIONS } from "./constants";
import type { RebarBar } from "./types";

export function ElementDetailPanel({
  measure = "Pile",
  showRebarTab = false,
  onClose,
  onAssignElement,
  onApplyAndContinue,
  onSaveMeasurement,
}: {
  measure?: string;
  showRebarTab?: boolean;
  onClose: () => void;
  onAssignElement: () => void;
  onApplyAndContinue: () => void;
  onSaveMeasurement?: (data: Record<string, string>) => void;
}) {
  const cfg = ELEMENT_CONFIGS[measure] ?? ELEMENT_CONFIGS["Pile"];
  const [activeTab, setActiveTab] = useState<"concrete" | "rebar">("concrete");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = { tag: "" };
    cfg.rows.forEach((row) => row.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    return init;
  });

  useEffect(() => {
    const newCfg = ELEMENT_CONFIGS[measure] ?? ELEMENT_CONFIGS["Pile"];
    const init: Record<string, string> = { tag: "" };
    newCfg.rows.forEach((row) => row.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    setFieldValues(init);
  }, [measure]);

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  const [rebarMethod, setRebarMethod] = useState<"read" | "manual">("manual");
  const [mainBars, setMainBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "4", depth: "0.45" },
  ]);
  const [additionBars, setAdditionBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "4", depth: "0.45" },
  ]);
  const [inclStirrupsLocal, setInclStirrupsLocal] = useState(true);
  const [stirrupSize, setStirrupSize] = useState("Y8");
  const [stirrupSpacing, setStirrupSpacing] = useState("150");

  function updateBar(
    arr: RebarBar[],
    setArr: (v: RebarBar[]) => void,
    id: string,
    field: keyof RebarBar,
    value: string,
  ) {
    setArr(arr.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  function handleApply() {
    onSaveMeasurement?.({ ...fieldValues });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    onApplyAndContinue();
  }

  return (
    <div className="w-[290px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{measure}</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-slate-200">
        {(showRebarTab ? (["concrete", "rebar"] as const) : (["concrete"] as const)).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab ? "text-amber-600 border-b-2 border-amber-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "concrete" ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{cfg.sectionHeader}</p>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">{cfg.tagLabel}</label>
              <Input
                value={fieldValues.tag ?? ""}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder={cfg.tagPlaceholder}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">{cfg.measureLabel}</label>
              <p className="text-base font-bold text-slate-800">
                {cfg.mockMeasureValue}
                {cfg.measureUnit && (
                  <span className="text-sm font-normal text-slate-500 ml-1">{cfg.measureUnit}</span>
                )}
              </p>
            </div>

            {cfg.rows.map((row, i) => (
              <div key={i} className="space-y-2">
                {row.sectionLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{row.sectionLabel}</p>
                )}
                <div className={row.fields.length === 2 ? "grid grid-cols-2 gap-3" : ""}>
                  {row.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[11px] text-slate-500">{field.label}</label>
                      {field.type === "select" ? (
                        <Select
                          value={fieldValues[field.key] ?? field.defaultValue}
                          onValueChange={(v) => setField(field.key, v)}
                        >
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {field.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={fieldValues[field.key] ?? ""}
                          onChange={(e) => setField(field.key, e.target.value)}
                          className="h-8 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Color</label>
              <div className="h-8 rounded-lg overflow-hidden border border-slate-200 bg-green-400 cursor-pointer" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Pile: Bored Pile - 750mm</span>
              <span className="text-[11px] text-amber-600 font-semibold">Concrete Volume: 0.81 m³</span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rebar Input Method</p>
              <p className="text-[11px] text-slate-600">How would you like to add rebar details?</p>
              <div className="space-y-1.5">
                {(["read", "manual"] as const).map((m) => (
                  <button key={m} onClick={() => setRebarMethod(m)} className="w-full flex items-center gap-2 text-left">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${rebarMethod === m ? "border-amber-500" : "border-slate-300"}`}>
                      {rebarMethod === m && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    </div>
                    <span className={`text-[11px] ${rebarMethod === m ? "text-amber-600 font-semibold" : "text-slate-500"}`}>
                      {m === "read"
                        ? "Read from drawing (click on rebar details on the page)"
                        : "Enter manually (I know the rebar specifications)"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Main Bars</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Rebars:</p>
              {mainBars.map((bar) => (
                <div key={bar.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bars Size:</label>
                      <Select value={bar.size} onValueChange={(v) => updateBar(mainBars, setMainBars, bar.id, "size", v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Number of bars:</label>
                      <Input value={bar.count} onChange={(e) => updateBar(mainBars, setMainBars, bar.id, "count", e.target.value)} className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Rebar Depth (m)</label>
                    <Input value={bar.depth} onChange={(e) => updateBar(mainBars, setMainBars, bar.id, "depth", e.target.value)} className="h-7 text-xs" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Addition Bars:</p>
              {additionBars.map((bar) => (
                <div key={bar.id} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bars Size:</label>
                      <Select value={bar.size} onValueChange={(v) => updateBar(additionBars, setAdditionBars, bar.id, "size", v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Number of bars:</label>
                      <Input value={bar.count} onChange={(e) => updateBar(additionBars, setAdditionBars, bar.id, "count", e.target.value)} className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Rebar Depth (m)</label>
                    <Input value={bar.depth} onChange={(e) => updateBar(additionBars, setAdditionBars, bar.id, "depth", e.target.value)} className="h-7 text-xs" />
                  </div>
                </div>
              ))}
              <button className="text-amber-600 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Bar
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stirrups (Links/Ties)</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inclStirrupsLocal}
                  onChange={(e) => setInclStirrupsLocal(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500"
                />
                <span className="text-[11px] text-slate-600">Include Stirrups</span>
              </label>
              {inclStirrupsLocal && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Bar size:</label>
                    <Select value={stirrupSize} onValueChange={setStirrupSize}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BAR_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Spacing (mm c/c):</label>
                    <Input value={stirrupSpacing} onChange={(e) => setStirrupSpacing(e.target.value)} className="h-7 text-xs" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Color</label>
              <div className="h-8 rounded-lg overflow-hidden border border-slate-200 bg-blue-500 cursor-pointer" />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-3 flex gap-2">
        <Button
          onClick={handleApply}
          className={`flex-1 text-xs py-2 transition-colors ${
            savedFeedback ? "bg-green-500 hover:bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {savedFeedback ? "✓ Saved" : "Apply & Continue"}
        </Button>
        <Button variant="outline" onClick={onAssignElement} className="flex-1 text-xs py-2">
          + Assign Element
        </Button>
      </div>
    </div>
  );
}
