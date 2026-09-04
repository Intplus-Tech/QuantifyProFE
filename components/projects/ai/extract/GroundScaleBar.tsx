"use client";

import { Check, Ruler, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SCALE_UNITS = ["mm", "cm", "m", "ft", "in"] as const;
export type ScaleUnit = (typeof SCALE_UNITS)[number];

export const METRES_PER_UNIT: Record<ScaleUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  ft: 0.3048,
  in: 0.0254,
};

/**
 * Ground-scale calibration for the AI canvas — the same two-click, known-
 * distance step the manual workspace uses, so a drawing run through either
 * flow is measured against the same number.
 */
export function GroundScaleBar({
  picking,
  pointsPlaced,
  knownDistance,
  unit,
  calibrated,
  scaleInfo,
  disabled,
  onStartPicking,
  onKnownDistanceChange,
  onUnitChange,
  onApply,
  onReset,
}: {
  picking: boolean;
  pointsPlaced: number;
  knownDistance: string;
  unit: ScaleUnit;
  calibrated: boolean;
  scaleInfo: string | null;
  disabled?: boolean;
  onStartPicking: () => void;
  onKnownDistanceChange: (value: string) => void;
  onUnitChange: (unit: ScaleUnit) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  if (calibrated && !picking) {
    return (
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#d9eef1] bg-emerald-50/70 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Ground scale set
        </span>
        {scaleInfo && (
          <span className="font-mono text-[11px] tabular-nums text-emerald-800">
            {scaleInfo}
          </span>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Recalibrate this page
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-amber-200 bg-amber-50/70 px-4 py-2.5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="min-w-[240px] flex-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            <Ruler className="h-3.5 w-3.5" />
            {calibrated ? "Recalibrating" : "Set the ground scale"}
          </p>
          <ol className="mt-1 space-y-0.5">
            <Step index={1} done={pointsPlaced >= 2} active={picking && pointsPlaced < 2}>
              Click two points on the drawing across a distance you know
              {pointsPlaced === 1 && " — one more point"}
            </Step>
            <Step index={2} done={false} active={pointsPlaced >= 2}>
              Type what that distance really is, then apply
            </Step>
          </ol>
        </div>

        {!picking && pointsPlaced < 2 ? (
          <Button
            size="sm"
            variant="outline"
            className="h-9 shrink-0 border-amber-300 bg-white text-[11px] text-amber-700 hover:bg-amber-100"
            disabled={disabled}
            onClick={onStartPicking}
          >
            Pick two points
          </Button>
        ) : (
          <>
            <div className="min-w-[180px] flex-1">
              <label className="font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-500">
                Known distance on plan
              </label>
              <input
                type="number"
                step="any"
                min={0}
                inputMode="decimal"
                value={knownDistance}
                disabled={disabled}
                placeholder="0"
                onChange={(event) => onKnownDistanceChange(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && onApply()}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs tabular-nums text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-50"
              />
            </div>

            <select
              value={unit}
              aria-label="Distance unit"
              disabled={disabled}
              onChange={(event) => onUnitChange(event.target.value as ScaleUnit)}
              className="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-amber-400 disabled:opacity-50"
            >
              {SCALE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u === "m" ? "Meters" : u === "mm" ? "Millimeters" : u}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              className="h-9 shrink-0 text-[11px]"
              disabled={disabled || pointsPlaced < 2 || !knownDistance}
              onClick={onApply}
            >
              Apply Scale
            </Button>

            <button
              type="button"
              disabled={disabled}
              onClick={onReset}
              className="h-9 shrink-0 text-[11px] text-slate-500 transition-colors hover:text-amber-600 disabled:opacity-40"
            >
              Start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Step({
  index,
  done,
  active,
  children,
}: {
  index: number;
  done: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
          done
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-amber-500 text-white"
              : "bg-white text-amber-600 ring-1 ring-amber-300"
        }`}
      >
        {done ? "✓" : index}
      </span>
      <span
        className={`text-[11px] leading-tight ${
          done ? "text-slate-400 line-through" : "text-slate-600"
        }`}
      >
        {children}
      </span>
    </li>
  );
}
