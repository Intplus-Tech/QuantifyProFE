"use client";

import {
  Anchor,
  AppWindow,
  ArrowRight,
  Blocks,
  Columns3,
  DoorOpen,
  Frame,
  GitCommitHorizontal,
  Grid2x2,
  Home,
  Landmark,
  Layers,
  Milestone,
  Minus,
  Square,
  SquareStack,
  TrendingUp,
  Triangle,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEASURE_TYPES } from "../mock-data";
import type { MeasureGroup, MeasureType } from "../types";

const ICONS: Record<string, LucideIcon> = {
  Anchor,
  AppWindow,
  Blocks,
  Columns3,
  DoorOpen,
  Frame,
  GitCommitHorizontal,
  Grid2x2,
  Home,
  Landmark,
  Layers,
  Milestone,
  Minus,
  Square,
  SquareStack,
  TrendingUp,
  Triangle,
  Waves,
};

const GROUP_LABELS: Record<MeasureGroup, string> = {
  foundations: "FOUNDATIONS",
  superstructure: "SUPERSTRUCTURE",
};

export function MeasureSelectPanel({
  selected,
  onToggle,
  onExtract,
}: {
  selected: string[];
  onToggle: (measureTypeId: string) => void;
  onExtract: () => void;
}) {
  const groups: MeasureGroup[] = ["foundations", "superstructure"];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="shrink-0 border-b border-[#d9eef1] px-5 py-4">
        <h2 className="font-mono text-[13px] font-bold uppercase leading-snug tracking-wide text-slate-800">
          What do you want to measure on this page?
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {groups.map((group) => (
          <section key={group} className="mb-4 last:mb-0">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#d9eef1]" />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                {GROUP_LABELS[group]}
              </span>
              <span className="h-px flex-1 bg-[#d9eef1]" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {MEASURE_TYPES.filter((m) => m.group === group).map((measure) => (
                <MeasureTile
                  key={measure.id}
                  measure={measure}
                  selected={selected.includes(measure.id)}
                  onToggle={() => onToggle(measure.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="shrink-0 border-t border-[#d9eef1] p-3">
        <Button
          className="h-12 w-full gap-2 text-sm"
          disabled={selected.length === 0}
          onClick={onExtract}
        >
          Extract Selected ({selected.length})
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MeasureTile({
  measure,
  selected,
  onToggle,
}: {
  measure: MeasureType;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[measure.icon] ?? Square;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border transition-all ${
        selected
          ? "border-amber-400 bg-amber-50/50 ring-1 ring-amber-300"
          : "border-[#d9eef1] bg-white hover:border-amber-200 hover:bg-amber-50/20"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${selected ? "text-amber-600" : "text-slate-400"}`}
        strokeWidth={1.75}
      />
      <span
        className={`px-1 text-center font-mono text-[9px] font-semibold uppercase leading-tight tracking-wide ${
          selected ? "text-amber-700" : "text-slate-500"
        }`}
      >
        {measure.label}
      </span>
    </button>
  );
}
