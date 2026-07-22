"use client";

import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ELEMENT_CONFIGS, BAR_SIZE_OPTIONS, PALETTE, PALETTE_LABELS } from "./constants";
import type { RebarBar } from "./types";
import type { VariantRebar } from "../workspaceSession";

// ─── Prop types ───────────────────────────────────────────────────────────────

export interface SaveMeasurementPayload {
  tag: string;
  concreteFields: Record<string, string>;
  rebar: VariantRebar | null;
  canvas: {
    tool: "count" | "length" | "area";
    count: number;
    length: number;
    area: number;
    unit: string;
  };
}

interface ElementDetailPanelProps {
  measure?: string;
  /** Only meaningful when the category's tool is "choice" (Stud Column / Columns). */
  measureChoice?: "count" | "area" | null;
  showRebarTab?: boolean;
  activeMeasureTool?: "length" | "area" | "count" | null;
  liveCount?: number;
  liveLength?: number;
  liveArea?: number;
  /** Length drawn on canvas while the Rebar tab is active — fills "read" bar depths. */
  liveRebarLength?: number | null;
  distanceUnit?: string;
  hasMeasurements?: boolean;
  activeColor?: string;
  onColorChange?: (color: string) => void;
  onClose: () => void;
  onAssignElement: () => void;
  onApplyAndContinue: () => void;
  onSaveMeasurement?: (payload: SaveMeasurementPayload) => void;
  onFormChange?: (payload: SaveMeasurementPayload) => void;
  onResetMeasurements?: () => void;
  onTabChange?: (tab: "concrete" | "rebar") => void;
  /** Pointer handlers from the parent's drag logic — spread onto the header to make it a drag handle. */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ElementDetailPanel({
  measure = "Piles",
  measureChoice = null,
  showRebarTab = false,
  activeMeasureTool = null,
  liveCount = 0,
  liveLength = 0,
  liveArea = 0,
  liveRebarLength = null,
  distanceUnit = "Meters",
  hasMeasurements = false,
  activeColor,
  onColorChange,
  onClose,
  onAssignElement,
  onApplyAndContinue,
  onSaveMeasurement,
  onFormChange,
  onResetMeasurements,
  onTabChange,
  dragHandleProps,
}: ElementDetailPanelProps) {
  const cfg = ELEMENT_CONFIGS[measure] ?? ELEMENT_CONFIGS["Piles"];
  const rows =
    cfg.tool === "choice" && cfg.rowsByChoice
      ? cfg.rowsByChoice[measureChoice ?? "count"]
      : cfg.rows;
  const [activeTab, setActiveTab] = useState<"concrete" | "rebar">("concrete");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // ── Concrete form ───────────────────────────────────────────────────────────

  const buildDefaultFields = (m: string, choice: "count" | "area" | null): Record<string, string> => {
    const c = ELEMENT_CONFIGS[m] ?? ELEMENT_CONFIGS["Piles"];
    const r = c.tool === "choice" && c.rowsByChoice ? c.rowsByChoice[choice ?? "count"] : c.rows;
    const init: Record<string, string> = { tag: "" };
    r.forEach((row) => row.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    return init;
  };

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    () => buildDefaultFields(measure, measureChoice),
  );

  useEffect(() => {
    setFieldValues(buildDefaultFields(measure, measureChoice));
  }, [measure, measureChoice]);

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  // ── Rebar form ──────────────────────────────────────────────────────────────

  const [rebarMethod, setRebarMethod] = useState<"read" | "manual">("manual");
  const [mainBars, setMainBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "0", depth: "0" },
  ]);
  const [additionBars, setAdditionBars] = useState<RebarBar[]>([
    { id: "1", size: "Y16", count: "0", depth: "0" },
  ]);
  const [inclStirrupsLocal, setInclStirrupsLocal] = useState(true);
  const [stirrupSize, setStirrupSize] = useState("Y8");
  const [stirrupSpacing, setStirrupSpacing] = useState("0");

  // "Read from drawing": one length drawn on canvas fills every bar row's depth.
  useEffect(() => {
    if (rebarMethod !== "read" || liveRebarLength == null) return;
    const depth = liveRebarLength.toFixed(2);
    setMainBars((prev) => prev.map((b) => ({ ...b, depth })));
    setAdditionBars((prev) => prev.map((b) => ({ ...b, depth })));
  }, [liveRebarLength, rebarMethod]);

  function resetRebarToDefaults() {
    setRebarMethod("manual");
    setMainBars([{ id: "1", size: "Y16", count: "0", depth: "0" }]);
    setAdditionBars([{ id: "1", size: "Y16", count: "0", depth: "0" }]);
    setInclStirrupsLocal(true);
    setStirrupSize("Y8");
    setStirrupSpacing("0");
  }

  function updateBar(
    arr: RebarBar[],
    setArr: (v: RebarBar[]) => void,
    id: string,
    field: keyof RebarBar,
    value: string,
  ) {
    setArr(arr.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  function addMainBar() {
    setMainBars((prev) => [
      ...prev,
      { id: crypto.randomUUID(), size: "Y16", count: "0", depth: "0" },
    ]);
  }

  function removeMainBar(id: string) {
    setMainBars((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  }

  function addAdditionBar() {
    setAdditionBars((prev) => [
      ...prev,
      { id: crypto.randomUUID(), size: "Y16", count: "0", depth: "0" },
    ]);
  }

  function removeAdditionBar(id: string) {
    setAdditionBars((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const concreteFormFilled =
    fieldValues.tag.trim() !== "" ||
    rows.some((row) =>
      row.fields.some((f) => {
        if (f.type === "select") return false;
        const v = fieldValues[f.key] ?? "";
        return v !== "" && v !== "0";
      }),
    );

  const rebarFormFilled =
    !showRebarTab ||
    rebarMethod === "read" ||
    mainBars.some((b) => {
      const n = parseFloat(b.count);
      return !isNaN(n) && n > 0;
    });

  const canSubmit = hasMeasurements && concreteFormFilled && rebarFormFilled;

  // ── Debounced form auto-save ─────────────────────────────────────────────────
  // Fires 700 ms after any form field changes so the parent can persist the
  // current form state without waiting for an explicit "Apply & Continue".
  // Canvas measurement values (liveCount/liveLength/liveArea) are excluded from
  // the deps — those are handled by the canvas-mark auto-save in the parent.
  const onFormChangeRef = useRef(onFormChange);
  useEffect(() => { onFormChangeRef.current = onFormChange; });

  useEffect(() => {
    if (!onFormChangeRef.current) return;
    const timer = setTimeout(() => {
      const { tag = "", ...restFields } = fieldValues;
      const rebarPayload: VariantRebar | null = showRebarTab
        ? {
            method: rebarMethod,
            mainBars: mainBars.map((b) => ({ id: b.id, size: b.size, count: b.count, depth: b.depth })),
            additionBars: additionBars.map((b) => ({ id: b.id, size: b.size, count: b.count, depth: b.depth })),
            includeStirups: inclStirrupsLocal,
            stirrupSize,
            stirrupSpacing,
          }
        : null;
      const tool: "count" | "length" | "area" = activeMeasureTool ?? "count";
      onFormChangeRef.current?.({
        tag,
        concreteFields: { tag, ...restFields },
        rebar: rebarPayload,
        canvas: { tool, count: liveCount, length: liveLength, area: liveArea, unit: distanceUnit ?? "Meters" },
      });
    }, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValues, mainBars, additionBars, inclStirrupsLocal, stirrupSize, stirrupSpacing, rebarMethod, showRebarTab]);


  // ── Apply & Continue ────────────────────────────────────────────────────────

  function handleApply() {
    // Capture all data BEFORE any state reset
    const { tag = "", ...restFields } = fieldValues;

    const rebarPayload: VariantRebar | null = showRebarTab
      ? {
          method: rebarMethod,
          mainBars: mainBars.map((b) => ({ id: b.id, size: b.size, count: b.count, depth: b.depth })),
          additionBars: additionBars.map((b) => ({ id: b.id, size: b.size, count: b.count, depth: b.depth })),
          includeStirups: inclStirrupsLocal,
          stirrupSize,
          stirrupSpacing,
        }
      : null;

    const tool: "count" | "length" | "area" = activeMeasureTool ?? "count";

    onSaveMeasurement?.({
      tag,
      concreteFields: { tag, ...restFields },
      rebar: rebarPayload,
      canvas: {
        tool,
        count: liveCount,
        length: liveLength,
        area: liveArea,
        unit: distanceUnit,
      },
    });

    onApplyAndContinue();

    // Reset both forms to defaults for the next variant
    setFieldValues(buildDefaultFields(measure, measureChoice));
    resetRebarToDefaults();
    setActiveTab("concrete");
    onTabChange?.("concrete");

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header — also the drag handle when floating */}
      <div
        {...dragHandleProps}
        style={{ touchAction: "none", ...dragHandleProps?.style }}
        className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0 cursor-grab active:cursor-grabbing"
      >
        <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{measure}</span>
        <button
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          title="Minimize"
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-slate-200">
        {(showRebarTab ? (["concrete", "rebar"] as const) : (["concrete"] as const)).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); onTabChange?.(tab); }}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-600"
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {cfg.sectionHeader}
            </p>

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
              {activeMeasureTool ? (
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-amber-600 tabular-nums">
                    {activeMeasureTool === "count" && liveCount}
                    {activeMeasureTool === "length" && liveLength.toFixed(2)}
                    {activeMeasureTool === "area" && liveArea.toFixed(2)}
                  </p>
                  <span className="text-sm text-slate-500">
                    {activeMeasureTool === "count" && "placed"}
                    {activeMeasureTool === "length" && distanceUnit}
                    {activeMeasureTool === "area" &&
                      (distanceUnit === "Meters" ? "m²" : `${distanceUnit}²`)}
                  </span>
                </div>
              ) : (
                <p className="text-base font-bold text-slate-800">
                  {cfg.mockMeasureValue}
                  {cfg.measureUnit && (
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      {cfg.measureUnit}
                    </span>
                  )}
                </p>
              )}
            </div>

            {rows.map((row, i) => (
              <div key={i} className="space-y-2">
                {row.sectionLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {row.sectionLabel}
                  </p>
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
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
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
              <label className="text-[11px] text-slate-500">Measurement Color</label>
              <div className="flex gap-1.5 flex-wrap py-1">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onColorChange?.(c)}
                    title={PALETTE_LABELS[c] ?? c}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      (activeColor ?? PALETTE[0]) === c
                        ? "border-white ring-2 ring-slate-400 scale-110"
                        : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {measure}: {fieldValues.tag || "—"}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Rebar Input Method
              </p>
              <p className="text-[11px] text-slate-600">How would you like to add rebar details?</p>
              <div className="space-y-1.5">
                {(["read", "manual"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setRebarMethod(m)}
                    className="w-full flex items-center gap-2 text-left"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        rebarMethod === m ? "border-amber-500" : "border-slate-300"
                      }`}
                    >
                      {rebarMethod === m && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] ${
                        rebarMethod === m ? "text-amber-600 font-semibold" : "text-slate-500"
                      }`}
                    >
                      {m === "read"
                        ? "Read from drawing (click on rebar details on the page)"
                        : "Enter manually (I know the rebar specifications)"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Main Bars
              </p>
              {mainBars.map((bar) => (
                <div
                  key={bar.id}
                  className="space-y-2 pb-2 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Bar entry</span>
                    {mainBars.length > 1 && (
                      <button
                        onClick={() => removeMainBar(bar.id)}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bars Size:</label>
                      <Select
                        value={bar.size}
                        onValueChange={(v) => updateBar(mainBars, setMainBars, bar.id, "size", v)}
                      >
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Number of bars:</label>
                      <Input
                        value={bar.count}
                        onChange={(e) => updateBar(mainBars, setMainBars, bar.id, "count", e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Rebar Depth (m)</label>
                    <Input
                      value={bar.depth}
                      onChange={(e) => updateBar(mainBars, setMainBars, bar.id, "depth", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
              {rebarMethod === "manual" && (
                <button
                  onClick={addMainBar}
                  className="text-amber-600 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Bar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Addition Bars:
              </p>
              {additionBars.map((bar) => (
                <div
                  key={bar.id}
                  className="space-y-2 pb-2 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Bar entry</span>
                    {additionBars.length > 1 && (
                      <button
                        onClick={() => removeAdditionBar(bar.id)}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bars Size:</label>
                      <Select
                        value={bar.size}
                        onValueChange={(v) =>
                          updateBar(additionBars, setAdditionBars, bar.id, "size", v)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BAR_SIZE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Number of bars:</label>
                      <Input
                        value={bar.count}
                        onChange={(e) =>
                          updateBar(additionBars, setAdditionBars, bar.id, "count", e.target.value)
                        }
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Rebar Depth (m)</label>
                    <Input
                      value={bar.depth}
                      onChange={(e) =>
                        updateBar(additionBars, setAdditionBars, bar.id, "depth", e.target.value)
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
              {rebarMethod === "manual" && (
                <button
                  onClick={addAdditionBar}
                  className="text-amber-600 hover:text-amber-700 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Bar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Stirrups (Links/Ties)
              </p>
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
                        {BAR_SIZE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Spacing (mm c/c):</label>
                    <Input
                      value={stirrupSpacing}
                      onChange={(e) => setStirrupSpacing(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Measurement Color</label>
              <div className="flex gap-1.5 flex-wrap py-1">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onColorChange?.(c)}
                    title={PALETTE_LABELS[c] ?? c}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      (activeColor ?? PALETTE[0]) === c
                        ? "border-white ring-2 ring-slate-400 scale-110"
                        : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-3 space-y-2">
        {!canSubmit && (
          <p className="text-center text-[10px] text-slate-400 leading-snug">
            {!hasMeasurements
              ? "Take a measurement on the drawing to enable these actions."
              : !concreteFormFilled
                ? "Fill in the Concrete tab details to continue."
                : "Fill in the Rebar tab details to continue."}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={!canSubmit}
            className={`flex-1 text-xs py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              savedFeedback
                ? "bg-green-500 hover:bg-green-500 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {savedFeedback ? "✓ Saved" : "Apply & Continue"}
          </Button>
          <Button
            variant="outline"
            onClick={onAssignElement}
            disabled={!canSubmit}
            className="flex-1 text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Assign Element
          </Button>
        </div>
      </div>
    </div>
  );
}
