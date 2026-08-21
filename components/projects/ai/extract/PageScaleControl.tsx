"use client";

import { useDispatch, useSelector } from "react-redux";
import { Ruler } from "lucide-react";
import { setAiScale } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import type { MeasurementUnit } from "@/types/aiTakeoff";

const UNITS: MeasurementUnit[] = ["mm", "cm", "m", "ft", "in"];

/**
 * Page scale, in real-world units per pixel.
 *
 * `POST /ai-takeoff/sessions/:id/pages` answers 400 "Missing scale" without it,
 * and the design has no calibration step in the AI flow, so it is captured here
 * rather than guessed. Lengths, areas and perimeters are all derived from this
 * server-side, so a wrong value silently scales every quantity.
 */
export function PageScaleControl() {
  const dispatch = useDispatch();
  const { unit, scale } = useSelector((state: RootState) => state.aiFlow.session);

  return (
    <div className="border-t border-[#d9eef1] bg-white/60 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Ruler className="h-3 w-3 text-amber-500" />
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Page Scale
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          min={0}
          value={scale ?? ""}
          placeholder="units / pixel"
          onChange={(event) => {
            const next = event.target.value;
            dispatch(setAiScale({ scale: next === "" ? null : Number(next) }));
          }}
          className="h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs tabular-nums text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        <select
          value={unit}
          aria-label="Scale unit"
          onChange={(event) =>
            dispatch(
              setAiScale({
                scale: scale ?? null,
                unit: event.target.value as MeasurementUnit,
              }),
            )
          }
          className="h-8 shrink-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-amber-400"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
        Real-world {unit} per pixel of the uploaded page image.
        {scale === 1 && (
          <span className="text-amber-600"> Using the default — calibrate before trusting quantities.</span>
        )}
      </p>
    </div>
  );
}
