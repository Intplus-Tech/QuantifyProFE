"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SCREEDING_OPTIONS,
  MESH_TYPES,
  CEILING_TYPES,
  PARAPET_WALL_OPTIONS,
  PAINT_TYPES,
  RISER_HEIGHTS,
  SKIRTING_THICKNESSES,
} from "./constants";
import type { Step4Data, ScopeConfig, TileTypeRow, FinishingSpecifications } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-border/60 h-9 text-sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Tile group section ───────────────────────────────────────────────────────

function getSequentialTypeCode(index: number): string {
  let value = index + 1;
  let code = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    code = String.fromCharCode(65 + remainder) + code;
    value = Math.floor((value - 1) / 26);
  }

  return code;
}

interface TileGroupProps {
  title: string;
  rows: TileTypeRow[];
  onChange: (rows: TileTypeRow[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

function TileGroup({ title, rows, onChange, disabled, disabledMessage }: TileGroupProps) {
  function withSequentialTypeCodes(inputRows: TileTypeRow[]): TileTypeRow[] {
    return inputRows.map((row, idx) => ({
      ...row,
      typeCode: getSequentialTypeCode(idx),
    }));
  }

  function updateRow(idx: number, description: string) {
    const updated = rows.map((r, i) => (i === idx ? { ...r, description } : r));
    onChange(withSequentialTypeCodes(updated));
  }

  function addRow() {
    onChange(withSequentialTypeCodes([...rows, { description: "" }] as TileTypeRow[]));
  }

  function removeRow(idx: number) {
    const updated = rows.filter((_, i) => i !== idx);
    onChange(withSequentialTypeCodes(updated));
  }

  return (
    <div className={`border border-border/50 rounded-xl overflow-hidden ${disabled ? "opacity-60" : ""}`}>
      {/* Group header */}
      <div className="bg-muted/30 px-4 py-2.5 flex items-center justify-between border-b border-border/40">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
          {title}
        </p>
        {disabled && disabledMessage && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60 font-medium">
            {disabledMessage}
          </Badge>
        )}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-xs font-bold text-muted-foreground w-14 shrink-0 whitespace-nowrap">
              Type {row.typeCode}
            </span>
            <Input
              value={row.description}
              onChange={(e) => updateRow(idx, e.target.value)}
              placeholder="Enter description..."
              className="border-border/60 h-8 text-sm flex-1"
              disabled={disabled}
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                aria-label={`Delete Type ${row.typeCode}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new line */}
      {!disabled && (
        <div className="px-4 py-2.5 border-t border-border/30">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <Plus className="w-3 h-3" />
            Add New Line
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StepFinishingProps {
  data: Step4Data;
  scopeConfig: ScopeConfig;
  onChange: (data: Step4Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepFinishing({ data, scopeConfig, onChange, onNext, onBack }: StepFinishingProps) {
  const hasPool = scopeConfig.hasPool;
  const hasLift = scopeConfig.lift === "Yes";
  const hasStairs = Number(scopeConfig.noOfFloors) > 0;

  function updSpec(key: keyof FinishingSpecifications, value: string) {
    onChange({
      ...data,
      specifications: { ...data.specifications, [key]: value },
    });
  }

  function updFloorGroup(
    group: keyof Step4Data["floorTiles"],
    rows: TileTypeRow[]
  ) {
    onChange({ ...data, floorTiles: { ...data.floorTiles, [group]: rows } });
  }

  function updWallGroup(
    group: keyof Step4Data["wallTiles"],
    rows: TileTypeRow[]
  ) {
    onChange({ ...data, wallTiles: { ...data.wallTiles, [group]: rows } });
  }

  const spec = data.specifications;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Finishing Specifications</h2>
        <p className="text-sm text-muted-foreground">
          Define finishing materials, tile types, and surface specifications.
        </p>
      </div>

      {/* ── Section A: Finishing Specifications ── */}
      <div className="border border-border/50 rounded-xl p-5">
        <p className="text-sm font-bold text-foreground mb-4">Finishing Specifications</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Screeding on DPM" value={spec.screedingOnDPM} onChange={(v) => updSpec("screedingOnDPM", v)} options={SCREEDING_OPTIONS} />
          <SelectField label="Mesh Type" value={spec.meshType} onChange={(v) => updSpec("meshType", v)} options={MESH_TYPES} />
          <SelectField label="Ceiling Type" value={spec.ceilingType} onChange={(v) => updSpec("ceilingType", v)} options={CEILING_TYPES} />
          <SelectField label="Roof Parapet Wall" value={spec.roofParapetWall} onChange={(v) => updSpec("roofParapetWall", v)} options={PARAPET_WALL_OPTIONS} />
          <SelectField label="Paint Type Internally" value={spec.paintTypeInternally} onChange={(v) => updSpec("paintTypeInternally", v)} options={PAINT_TYPES} />
          <SelectField label="Paint Type Externally" value={spec.paintTypeExternally} onChange={(v) => updSpec("paintTypeExternally", v)} options={PAINT_TYPES} />
          {hasStairs && (
            <SelectField label="Riser Height for Stairs" value={spec.riserHeightForStairs} onChange={(v) => updSpec("riserHeightForStairs", v)} options={RISER_HEIGHTS} />
          )}
          <SelectField label="Skirting Landing Thickness" value={spec.skirtingLandingThickness} onChange={(v) => updSpec("skirtingLandingThickness", v)} options={SKIRTING_THICKNESSES} />
        </div>
      </div>

      {/* ── Section B: Type of Floor Tiles ── */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Type of Floor Tiles</p>

        <TileGroup
          title="General Areas"
          rows={data.floorTiles.generalAreas}
          onChange={(rows) => updFloorGroup("generalAreas", rows)}
        />
        <TileGroup
          title="Wet Areas / Bathrooms / Kitchens"
          rows={data.floorTiles.wetAreas}
          onChange={(rows) => updFloorGroup("wetAreas", rows)}
        />
        {hasStairs && (
          <TileGroup
            title="Stairs Area"
            rows={data.floorTiles.stairsArea}
            onChange={(rows) => updFloorGroup("stairsArea", rows)}
          />
        )}
        {hasPool && (
          <TileGroup
            title="Swimming Pool"
            rows={data.floorTiles.swimmingPool}
            onChange={(rows) => updFloorGroup("swimmingPool", rows)}
          />
        )}
        {hasLift && (
          <TileGroup
            title="Lift Walls"
            rows={data.floorTiles.liftWalls}
            onChange={(rows) => updFloorGroup("liftWalls", rows)}
          />
        )}
      </div>

      {/* ── Section C: Type of Wall Tiles ── */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Type of Wall Tiles</p>

        <TileGroup
          title="Internal Walls"
          rows={data.wallTiles.internalWalls}
          onChange={(rows) => updWallGroup("internalWalls", rows)}
        />
        <TileGroup
          title="External Walls"
          rows={data.wallTiles.externalWalls}
          onChange={(rows) => updWallGroup("externalWalls", rows)}
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          ← Back to Scope
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={onNext}
        >
          Next Step →
        </Button>
      </div>
    </div>
  );
}
