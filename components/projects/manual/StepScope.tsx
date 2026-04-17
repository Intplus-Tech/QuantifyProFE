"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SCOPE_PROJECT_TYPES,
  FOUNDATION_TYPE_MAP,
  LIFT_OPTIONS,
  POOL_LOCATIONS,
  CONCRETE_GRADES,
  CASTING_METHODS,
  CASTING_LABOUR,
  PLASTICIZERS,
  WATERPROOFING_OPTS,
  SUBSTRUCTURE_FORMWORK_TYPES,
  SUBSTRUCTURE_BLOCK_TYPES,
  SUBSTRUCTURE_BLOCKWORK_FILLINGS,
  SUBSTRUCTURE_STRIP_BLOCKWORK_FORMWORKS,
  SUBSTRUCTURE_CASTING_TYPES,
  SUBSTRUCTURE_CASTING_METHODS,
  getScopeTabs,
  getFirstTabLabel,
  TAB_LABELS,
  BLINDING_ELEMENTS_ALWAYS,
  SUBSTRUCTURE_ELEMENTS_ALWAYS,
  SUPERSTRUCTURE_ELEMENTS_ALWAYS,
  defaultBlindingElement,
  defaultConcreteElement,
  defaultSubstructureConcreteElement,
  defaultSubstructureData,
  defaultSubstructureFooting,
  defaultSubstructureFrameElement,
} from "./constants";
import type {
  Step3Data,
  ScopeConfig,
  PileSystem,
  BlindingElement,
  ConcreteElement,
  SubstructureData,
  SubstructureLayer,
  SubstructureFooting,
  SubstructureConcreteElement,
  SubstructureFrameElement,
} from "./types";

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Generic dropdown helper ──────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  labelClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  labelClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs font-medium text-muted-foreground ${labelClassName ?? ""}`}>
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-border/60 h-9 text-sm">
          <SelectValue placeholder={placeholder} />
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

function NumberField({
  label,
  value,
  onChange,
  placeholder = "",
  labelClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  labelClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs font-medium text-muted-foreground ${labelClassName ?? ""}`}>
        {label}
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-border/60 h-9 text-sm"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  labelClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  labelClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs font-medium text-muted-foreground ${labelClassName ?? ""}`}>
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-border/60 h-9 text-sm"
      />
    </div>
  );
}

// ─── Scope Config Modal ───────────────────────────────────────────────────────

interface ScopeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ScopeConfig;
  onApply: (config: ScopeConfig) => void;
}

function ScopeConfigModal({ open, onOpenChange, initial, onApply }: ScopeConfigModalProps) {
  const [local, setLocal] = useState<ScopeConfig>(initial);

  // Reset to initial when modal opens
  useEffect(() => {
    if (open) setLocal(initial);
  }, [open, initial]);

  function update<K extends keyof ScopeConfig>(key: K, value: ScopeConfig[K]) {
    setLocal((prev) => {
      const next = { ...prev, [key]: value };
      // When project type changes, reset foundationType to first available
      if (key === "projectType") {
        const available = FOUNDATION_TYPE_MAP[value as string] ?? [];
        next.foundationType = available[0] ?? "";
      }
      return next;
    });
  }

  const foundationOptions = FOUNDATION_TYPE_MAP[local.projectType] ?? [];

  function handleApply() {
    onApply(local);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold">
              Configure Structural Scope
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Scope & Foundation */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Scope &amp; Foundation
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Project Type"
                value={local.projectType}
                onChange={(v) => update("projectType", v)}
                options={SCOPE_PROJECT_TYPES}
                placeholder="Select project type"
              />
              <SelectField
                label="Foundation Type"
                value={local.foundationType}
                onChange={(v) => update("foundationType", v)}
                options={foundationOptions}
                placeholder="Select foundation type"
              />
              <NumberField
                label="No. of Floors"
                value={local.noOfFloors}
                onChange={(v) => update("noOfFloors", v)}
                placeholder="e.g. 5"
              />
              <SelectField
                label="Lift"
                value={local.lift}
                onChange={(v) => update("lift", v)}
                options={LIFT_OPTIONS}
              />
            </div>
          </div>

          {/* Swimming Pool */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Swimming Pool Configuration
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Swimming Pool
                </Label>
                <Select
                  value={local.hasPool ? "Yes" : "No"}
                  onValueChange={(v) => update("hasPool", v === "Yes")}
                >
                  <SelectTrigger className="w-full border-border/60 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Include swimming pool</SelectItem>
                    <SelectItem value="No">No swimming pool</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {local.hasPool && (
                <SelectField
                  label="Pool Location"
                  value={local.poolLocation}
                  onChange={(v) => update("poolLocation", v)}
                  options={POOL_LOCATIONS}
                  placeholder="Select pool location"
                />
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={handleApply}
            disabled={!local.projectType || !local.foundationType}
          >
            Apply to Scope Config.
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Pile System ─────────────────────────────────────────────────────────

function PileSystemTab({
  data,
  onChange,
}: {
  data: PileSystem;
  onChange: (d: PileSystem) => void;
}) {
  function upd<K extends keyof PileSystem>(key: K, val: PileSystem[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="space-y-6 py-4">
      {/* Concrete settings */}
      <div>
        {/* <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
          Concrete Settings
        </p> */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField label="Grade of Concrete" value={data.gradeOfConcrete} onChange={(v) => upd("gradeOfConcrete", v)} options={CONCRETE_GRADES} />
          <SelectField label="Casting Method" value={data.castingMethod} onChange={(v) => upd("castingMethod", v)} options={CASTING_METHODS} />
          <SelectField label="Casting Labour" value={data.castingLabour} onChange={(v) => upd("castingLabour", v)} options={CASTING_LABOUR} />
        </div>
      </div>

      {/* Pile Specification */}
      <div>
        <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
          Pile Specification
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NumberField label="Depth (m)" value={data.depth} onChange={(v) => upd("depth", v)} />
          <NumberField label="Diameter (mm)" value={data.diameter} onChange={(v) => upd("diameter", v)} />
          <NumberField label="Center to Center" value={data.centerToCenter} onChange={(v) => upd("centerToCenter", v)} />
          <SelectField label="Plasticizers" value={data.plasticizers} onChange={(v) => upd("plasticizers", v)} options={PLASTICIZERS} />
          <NumberField label="Main Bar: No." value={data.mainBarNo} onChange={(v) => upd("mainBarNo", v)} />
          <TextField label="Main Bar: Size" value={data.mainBarSize} onChange={(v) => upd("mainBarSize", v)} placeholder="e.g. Y16" />
          <TextField label="Ring Bar (Size)" value={data.ringBarSize} onChange={(v) => upd("ringBarSize", v)} placeholder="e.g. R10" />
          <NumberField label="Rebar Depth (m)" value={data.rebarDepth} onChange={(v) => upd("rebarDepth", v)} />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Blinding ────────────────────────────────────────────────────────────

function BlindingTab({
  data,
  onChange,
  hasPool,
  projectType,
  foundationType,
}: {
  data: Record<string, BlindingElement>;
  onChange: (d: Record<string, BlindingElement>) => void;
  hasPool: boolean;
  projectType: string;
  foundationType: string;
}) {
  const isFoundationCarcassRaft =
    projectType === "Foundation & Carcass Only" && foundationType === "Raft";
  const isCarcassRaft =
    projectType === "Carcass with finishes" && foundationType === "Raft";
  const isFoundationCarcassPile =
    projectType === "Foundation & Carcass Only" && foundationType === "Pile";
  const isCarcassPile =
    projectType === "Carcass with finishes" && foundationType === "Pile";
  const isFoundationCarcassStrip =
    projectType === "Foundation & Carcass Only" && foundationType === "Strip";
  const isCarcassStrip =
    projectType === "Carcass with finishes" && foundationType === "Strip";
  const isFoundationCarcassRPWB =
    projectType === "Foundation & Carcass Only" && foundationType === "Raft Pile with Basement";
  const isCarcassRPWB =
    projectType === "Carcass with finishes" && foundationType === "Raft Pile with Basement";
  const isPileFoundation = foundationType === "Pile";
  const isStripFoundation = foundationType === "Strip";
  const isRaftFoundation = foundationType === "Raft" || foundationType === "Raft Pile with Basement";

  const elements = isFoundationCarcassRaft || isCarcassRaft
    ? [
        "Raft Foundation",
        "Ground Beam",
        "Oversite Slab",
        "Pad Footing",
        ...(hasPool ? ["Swimming Pool"] : []),
      ]
    : isFoundationCarcassRPWB || isCarcassRPWB
      ? [
          "Pile Cap",
          "Ground Beam",
          "Oversite Slab",
          ...(hasPool ? ["Swimming Pool"] : []),
        ]
    : isFoundationCarcassPile || isCarcassPile
      ? ["Pile Cap", "Oversite Slab", ...(hasPool ? ["Swimming Pool"] : [])]
      : isFoundationCarcassStrip || isCarcassStrip
        ? ["Strip Foundation", "Oversite Slab", ...(hasPool ? ["Swimming Pool"] : [])]
        : isPileFoundation
          ? ["Pile Cap", "Oversite Slab", ...(hasPool ? ["Swimming Pool"] : [])]
          : hasPool
            ? [...BLINDING_ELEMENTS_ALWAYS, "Swimming Pool"]
            : BLINDING_ELEMENTS_ALWAYS;

  function updElement(name: string, key: keyof BlindingElement, val: string) {
    const current = data[name] ?? defaultBlindingElement();
    onChange({ ...data, [name]: { ...current, [key]: val } });
  }

  const blindingLabelClass = "block min-h-8 leading-4";

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {elements.map((el) => {
          const el_data = data[el] ?? defaultBlindingElement();
          const isStripFoundation = el === "Strip Foundation";
          const isRaftFoundation = el === "Raft Foundation";
          const hasSpecialFields = isStripFoundation || isRaftFoundation;
          return (
            <div key={el} className={`border border-border/50 rounded-xl p-4 space-y-3 ${hasSpecialFields ? "lg:col-span-2" : ""}`}>
              <p className="text-sm font-semibold text-foreground">{el}</p>
              <div className={`grid gap-3 ${hasSpecialFields ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
                <SelectField label="Grade of Concrete" value={el_data.gradeOfConcrete} onChange={(v) => updElement(el, "gradeOfConcrete", v)} options={CONCRETE_GRADES} labelClassName={blindingLabelClass} />
                {hasSpecialFields && (
                  <SelectField label="Plasticizers" value={el_data.plasticizers ?? ""} onChange={(v) => updElement(el, "plasticizers", v)} options={PLASTICIZERS} labelClassName={blindingLabelClass} />
                )}
                {hasSpecialFields && (
                  <SelectField label="Waterproof" value={el_data.waterproof ?? ""} onChange={(v) => updElement(el, "waterproof", v)} options={WATERPROOFING_OPTS} labelClassName={blindingLabelClass} />
                )}
                <SelectField label="Casting Method" value={el_data.castingMethod} onChange={(v) => updElement(el, "castingMethod", v)} options={CASTING_METHODS} labelClassName={blindingLabelClass} />
                {hasSpecialFields && (
                  <SelectField label="Casting Labour Method" value={el_data.castingLabourMethod ?? ""} onChange={(v) => updElement(el, "castingLabourMethod", v)} options={CASTING_LABOUR} labelClassName={blindingLabelClass} />
                )}
                <NumberField label="Waste (%)" value={el_data.wastePercent} onChange={(v) => updElement(el, "wastePercent", v)} labelClassName={blindingLabelClass} />
                <NumberField label="Blinding Thickness (mm)" value={el_data.blindingThickness} onChange={(v) => updElement(el, "blindingThickness", v)} labelClassName={blindingLabelClass} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Superstructure ──────────────────────────────────────────────────────

function SuperstructureTab({
  data,
  onChange,
  hasLift,
  noOfFloors,
}: {
  data: Record<string, ConcreteElement>;
  onChange: (d: Record<string, ConcreteElement>) => void;
  hasLift: boolean;
  noOfFloors: string;
}) {
  const hasStairs = Number(noOfFloors) > 0;
  const baseElements = SUPERSTRUCTURE_ELEMENTS_ALWAYS.filter(
    (el) => hasStairs || el !== "Stairs"
  );
  const elements = hasLift ? [...baseElements, "Lift Wall"] : baseElements;

  function updElement(name: string, key: keyof ConcreteElement, val: string) {
    const current = data[name] ?? defaultConcreteElement();
    onChange({ ...data, [name]: { ...current, [key]: val } });
  }

  return (
    <div className="space-y-4 py-4">
      <p className="text-xs text-muted-foreground mb-2">Columns, beams, slabs and walls</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {elements.map((el) => {
          const el_data = data[el] ?? defaultConcreteElement();
          return (
            <div key={el} className="border border-border/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{el}</p>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Grade of Concrete" value={el_data.gradeOfConcrete} onChange={(v) => updElement(el, "gradeOfConcrete", v)} options={CONCRETE_GRADES} />
                <SelectField label="Plasticizers" value={el_data.plasticizers} onChange={(v) => updElement(el, "plasticizers", v)} options={PLASTICIZERS} />
                <SelectField label="Waterproofing" value={el_data.waterproofing} onChange={(v) => updElement(el, "waterproofing", v)} options={WATERPROOFING_OPTS} />
                <SelectField label="Casting Method" value={el_data.castingMethod} onChange={(v) => updElement(el, "castingMethod", v)} options={CASTING_METHODS} />
                <SelectField label="Casting Labour Method" value={el_data.castingLabourMethod} onChange={(v) => updElement(el, "castingLabourMethod", v)} options={CASTING_LABOUR} />
                <NumberField label="Waste (%)" value={el_data.wastePercent} onChange={(v) => updElement(el, "wastePercent", v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Substructure ────────────────────────────────────────────────────────

function SubstructureLayerCard({
  title,
  data,
  onChange,
}: {
  title: string;
  data: SubstructureLayer;
  onChange: (d: SubstructureLayer) => void;
}) {
  function upd<K extends keyof SubstructureLayer>(key: K, val: SubstructureLayer[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="grid grid-cols-1 gap-3">
        <NumberField label="Thickness (mm)" value={data.thicknessMm} onChange={(v) => upd("thicknessMm", v)} />
        <NumberField label="Waste (%)" value={data.wastePercent} onChange={(v) => upd("wastePercent", v)} />
      </div>
    </div>
  );
}

function SubstructureFootingCard({
  data,
  onChange,
}: {
  data: SubstructureFooting;
  onChange: (d: SubstructureFooting) => void;
}) {
  function upd<K extends keyof SubstructureFooting>(key: K, val: SubstructureFooting[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Column Footing</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField label="Grade of Concrete" value={data.gradeOfConcrete} onChange={(v) => upd("gradeOfConcrete", v)} options={CONCRETE_GRADES} />
        <SelectField label="Plasticizers" value={data.plasticizers} onChange={(v) => upd("plasticizers", v)} options={PLASTICIZERS} />
        <SelectField label="Waterproof" value={data.waterproof} onChange={(v) => upd("waterproof", v)} options={WATERPROOFING_OPTS} />
        <SelectField label="Casting Type" value={data.castingType} onChange={(v) => upd("castingType", v)} options={SUBSTRUCTURE_CASTING_TYPES} />
        <SelectField label="Casting Labour Method" value={data.castingLabourMethod} onChange={(v) => upd("castingLabourMethod", v)} options={CASTING_LABOUR} />
        <NumberField label="Waste (%)" value={data.wastePercent} onChange={(v) => upd("wastePercent", v)} />
      </div>
    </div>
  );
}

function SubstructureConcreteCard({
  title,
  data,
  onChange,
  useCastingFillingMethod,
}: {
  title: string;
  data: SubstructureConcreteElement;
  onChange: (d: SubstructureConcreteElement) => void;
  useCastingFillingMethod?: boolean;
}) {
  function upd<K extends keyof SubstructureConcreteElement>(key: K, val: SubstructureConcreteElement[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField label="Grade of Concrete" value={data.gradeOfConcrete} onChange={(v) => upd("gradeOfConcrete", v)} options={CONCRETE_GRADES} />
        <SelectField label="Plasticizers" value={data.plasticizers} onChange={(v) => upd("plasticizers", v)} options={PLASTICIZERS} />
        <SelectField label="Waterproof" value={data.waterproof} onChange={(v) => upd("waterproof", v)} options={WATERPROOFING_OPTS} />
        <SelectField label="Formwork Type" value={data.formworkType} onChange={(v) => upd("formworkType", v)} options={SUBSTRUCTURE_FORMWORK_TYPES} />
        <SelectField label="Block Type of Formwork" value={data.blockTypeOfFormwork} onChange={(v) => upd("blockTypeOfFormwork", v)} options={SUBSTRUCTURE_BLOCK_TYPES} />
        <SelectField label="Blockwork Filling" value={data.blockworkFilling} onChange={(v) => upd("blockworkFilling", v)} options={SUBSTRUCTURE_BLOCKWORK_FILLINGS} />
        <SelectField label="Casting Method" value={data.castingMethod} onChange={(v) => upd("castingMethod", v)} options={SUBSTRUCTURE_CASTING_METHODS} />
        {useCastingFillingMethod ? (
          <SelectField label="Casting Filling Method" value={data.castingFillingMethod} onChange={(v) => upd("castingFillingMethod", v)} options={CASTING_LABOUR} />
        ) : (
          <SelectField label="Casting Labour Method" value={data.castingLabourMethod} onChange={(v) => upd("castingLabourMethod", v)} options={CASTING_LABOUR} />
        )}
        <NumberField label="Waste (%)" value={data.wastePercent} onChange={(v) => upd("wastePercent", v)} />
      </div>
    </div>
  );
}

function SubstructureBlockworkInStripFoundationCard({
  blockworkForFormwork,
  blockworkFilling,
  onChange,
}: {
  blockworkForFormwork: string;
  blockworkFilling: string;
  onChange: (next: { blockworkForFormwork: string; blockworkFilling: string }) => void;
}) {
  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Blockwork in Strip Foundation</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField
          label="Blockwork for Formwork"
          value={blockworkForFormwork}
          onChange={(v) => onChange({ blockworkForFormwork: v, blockworkFilling })}
          options={SUBSTRUCTURE_STRIP_BLOCKWORK_FORMWORKS}
        />
        <SelectField
          label="Blockwork Filling"
          value={blockworkFilling}
          onChange={(v) => onChange({ blockworkForFormwork, blockworkFilling: v })}
          options={SUBSTRUCTURE_BLOCKWORK_FILLINGS}
        />
      </div>
    </div>
  );
}

function SubstructureFrameCard({
  data,
  onChange,
}: {
  data: SubstructureFrameElement;
  onChange: (d: SubstructureFrameElement) => void;
}) {
  function upd<K extends keyof SubstructureFrameElement>(key: K, val: SubstructureFrameElement[K]) {
    onChange({ ...data, [key]: val });
  }

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Pile Cap Frames</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField label="Grade of Concrete" value={data.gradeOfConcrete} onChange={(v) => upd("gradeOfConcrete", v)} options={CONCRETE_GRADES} />
        <SelectField label="Plasticizers" value={data.plasticizers} onChange={(v) => upd("plasticizers", v)} options={PLASTICIZERS} />
        <SelectField label="Waterproof" value={data.waterproof} onChange={(v) => upd("waterproof", v)} options={WATERPROOFING_OPTS} />
        <SelectField label="Formwork Type" value={data.formworkType} onChange={(v) => upd("formworkType", v)} options={SUBSTRUCTURE_FORMWORK_TYPES} />
        <SelectField label="Casting Method" value={data.castingMethod} onChange={(v) => upd("castingMethod", v)} options={SUBSTRUCTURE_CASTING_METHODS} />
        <SelectField label="Casting Labour Method" value={data.castingLabourMethod} onChange={(v) => upd("castingLabourMethod", v)} options={CASTING_LABOUR} />
        <NumberField label="Waste (%)" value={data.wastePercent} onChange={(v) => upd("wastePercent", v)} />
      </div>
    </div>
  );
}

function SubstructureTab({
  data,
  onChange,
  hasLift,
  hasPool,
  projectType,
  foundationType,
}: {
  data: SubstructureData;
  onChange: (d: SubstructureData) => void;
  hasLift: boolean;
  hasPool: boolean;
  projectType: string;
  foundationType: string;
}) {
  const isFoundationCarcassRaft =
    projectType === "Foundation & Carcass Only" && foundationType === "Raft";
  const isFoundationCarcassStrip =
    projectType === "Foundation & Carcass Only" && foundationType === "Strip";
  const isCarcassStrip =
    projectType === "Carcass with finishes" && foundationType === "Strip";
  const isPileFoundation = foundationType === "Pile";
  const isStripFoundation = foundationType === "Strip";

  const baseElements = isFoundationCarcassRaft
    ? ["Ground Beam", "Oversite Slab", "Column in Foundation", "Shear Wall", ...(hasLift ? ["Lift Wall"] : []), "Column Footing (Upper Strip)", ...(hasPool ? ["Swimming Pool"] : [])]
    : isFoundationCarcassStrip || isCarcassStrip
      ? ["Ground Beam", "Oversite Slab", "Column in Foundation", "Shear Wall", ...(hasLift ? ["Lift Wall"] : []), "Column Footing (Upper Strip)", ...(hasPool ? ["Swimming Pool"] : [])]
      : isPileFoundation
        ? ["Pile Cap", "Oversite Slab", "Column in Foundation", "Shear Wall", ...(hasLift ? ["Lift Wall"] : []), ...(hasPool ? ["Swimming Pool"] : [])]
        : [...SUBSTRUCTURE_ELEMENTS_ALWAYS, ...(hasLift ? ["Lift Wall"] : []), ...(hasPool ? ["Swimming Pool"] : [])];

  function updLayer(key: keyof SubstructureData["layers"], value: SubstructureLayer) {
    onChange({ ...data, layers: { ...data.layers, [key]: value } });
  }

  function updColumnFooting(columnFooting: SubstructureFooting) {
    onChange({ ...data, columnFooting });
  }

  function updPileCapFrames(pileCapFrames: SubstructureFrameElement) {
    onChange({ ...data, pileCapFrames });
  }

  function updElement(name: string, elementData: SubstructureConcreteElement) {
    onChange({ ...data, elements: { ...data.elements, [name]: elementData } });
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SubstructureLayerCard
          title="Total Filling Thickness"
          data={data.layers.totalFillingThickness}
          onChange={(v) => updLayer("totalFillingThickness", v)}
        />
        <SubstructureLayerCard
          title="Laterite Thickness"
          data={data.layers.lateriteThickness}
          onChange={(v) => updLayer("lateriteThickness", v)}
        />
        <SubstructureLayerCard
          title="Hardcore Thickness"
          data={data.layers.hardcoreThickness}
          onChange={(v) => updLayer("hardcoreThickness", v)}
        />
      </div>

      <SubstructureFootingCard
        data={data.columnFooting ?? defaultSubstructureFooting()}
        onChange={updColumnFooting}
      />

      {!isStripFoundation && (
        <SubstructureConcreteCard
          title="Pile Cap"
          data={data.elements["Pile Cap"] ?? defaultSubstructureConcreteElement()}
          onChange={(v) => updElement("Pile Cap", v)}
        />
      )}

      {!isFoundationCarcassRaft && !isStripFoundation && (
        <SubstructureFrameCard
          data={data.pileCapFrames ?? defaultSubstructureFrameElement()}
          onChange={updPileCapFrames}
        />
      )}

      {baseElements
        .filter((name) => {
          if (isFoundationCarcassRaft || isStripFoundation) return name !== "Pile Cap";
          return name !== "Pile Cap";
        })
        .map((name) => (
          <SubstructureConcreteCard
            key={name}
            title={name}
            data={data.elements[name] ?? defaultSubstructureConcreteElement()}
            onChange={(v) => updElement(name, v)}
            useCastingFillingMethod={isFoundationCarcassRaft || isStripFoundation}
          />
        ))}

      {(isFoundationCarcassRaft || isStripFoundation) && (
        <SubstructureBlockworkInStripFoundationCard
          blockworkForFormwork={data.blockworkInStripFoundation?.blockworkForFormwork ?? ""}
          blockworkFilling={data.blockworkInStripFoundation?.blockworkFilling ?? ""}
          onChange={(next) =>
            onChange({
              ...data,
              blockworkInStripFoundation: next,
            })
          }
        />
      )}
    </div>
  );
}

// ─── Main Step 3 Component ────────────────────────────────────────────────────

interface StepScopeProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepScope({ data, onChange, onNext, onBack }: StepScopeProps) {
  const [modalOpen, setModalOpen] = useState(!data.scopeConfig.projectType);
  const [activeTab, setActiveTab] = useState<string>("");

  const scopeConfig = data.scopeConfig;
  const tabs = getScopeTabs(scopeConfig.projectType);
  const hasLift = scopeConfig.lift === "Yes";
  const hasPool = scopeConfig.hasPool;

  // Set initial active tab when config is applied
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  function applyConfig(config: ScopeConfig) {
    const newTabs = getScopeTabs(config.projectType);
    onChange({ ...data, scopeConfig: config });
    setActiveTab(newTabs[0] ?? "");
  }

  function updPileSystem(pileSystem: PileSystem) {
    onChange({ ...data, pileSystem });
  }

  function updBlinding(blinding: Record<string, BlindingElement>) {
    onChange({ ...data, blinding });
  }

  function updSubstructure(substructure: SubstructureData) {
    onChange({ ...data, substructure });
  }

  function updSuperstructure(superstructure: Record<string, ConcreteElement>) {
    onChange({ ...data, superstructure });
  }

  function getTabLabel(tabId: string): string {
    if (tabId === "pile-system" || tabId === "foundation-system") {
      return getFirstTabLabel(scopeConfig.foundationType);
    }
    return TAB_LABELS[tabId] ?? tabId;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Structural Scope</h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Configure the primary structural elements and geometry. These settings define how
            volumes and quantities are calculated.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setModalOpen(true)}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Reconfigure
        </Button>
      </div>

      {/* Scope Config Modal */}
      <ScopeConfigModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={scopeConfig}
        onApply={applyConfig}
      />

      {/* Scope summary badge row */}
      {scopeConfig.projectType && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
            {scopeConfig.projectType}
          </span>
          <span className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
            {scopeConfig.foundationType}
          </span>
          <span className="text-xs bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full">
            {scopeConfig.noOfFloors} Floor{Number(scopeConfig.noOfFloors) !== 1 ? "s" : ""}
          </span>
          {hasPool && (
            <span className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full">
              Pool: {scopeConfig.poolLocation}
            </span>
          )}
          {hasLift && (
            <span className="text-xs bg-amber-50 text-amber-700 font-medium px-3 py-1 rounded-full">
              Lift included
            </span>
          )}
        </div>
      )}

      {/* Tab content */}
      {tabs.length > 0 && activeTab ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-border/40 bg-transparent rounded-none h-auto p-0 gap-0">
            {tabs.map((tabId) => (
              <TabsTrigger
                key={tabId}
                value={tabId}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {getTabLabel(tabId)}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tabId) => (
            <TabsContent key={tabId} value={tabId} className="mt-0">
              {(tabId === "pile-system" || tabId === "foundation-system") && (
                <PileSystemTab data={data.pileSystem} onChange={updPileSystem} />
              )}
              {tabId === "blinding" && (
                <BlindingTab
                  data={data.blinding}
                  onChange={updBlinding}
                  hasPool={hasPool}
                  projectType={scopeConfig.projectType}
                  foundationType={scopeConfig.foundationType}
                />
              )}
              {tabId === "substructure" && (
                <SubstructureTab
                  data={data.substructure ?? defaultSubstructureData()}
                  onChange={updSubstructure}
                  hasLift={hasLift}
                  hasPool={hasPool}
                  projectType={scopeConfig.projectType}
                  foundationType={scopeConfig.foundationType}
                />
              )}
              {tabId === "superstructure" && (
                <SuperstructureTab
                  data={data.superstructure}
                  onChange={updSuperstructure}
                  hasLift={hasLift}
                  noOfFloors={scopeConfig.noOfFloors}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="border border-dashed border-border/60 rounded-xl py-16 text-center text-muted-foreground">
          <Settings2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Configure scope to see structural tabs</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setModalOpen(true)}
          >
            Configure Now
          </Button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          ← Back to Project Details
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={onNext}
          disabled={!scopeConfig.projectType}
        >
          Next Step →
        </Button>
      </div>
    </div>
  );
}
