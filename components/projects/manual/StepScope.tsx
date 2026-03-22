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
  getScopeTabs,
  getFirstTabLabel,
  TAB_LABELS,
  BLINDING_ELEMENTS_ALWAYS,
  SUPERSTRUCTURE_ELEMENTS_ALWAYS,
  defaultBlindingElement,
  defaultConcreteElement,
} from "./constants";
import type {
  Step3Data,
  ScopeConfig,
  PileSystem,
  BlindingElement,
  ConcreteElement,
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
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
        <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
          Concrete Settings
        </p>
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
}: {
  data: Record<string, BlindingElement>;
  onChange: (d: Record<string, BlindingElement>) => void;
  hasPool: boolean;
}) {
  const elements = hasPool
    ? [...BLINDING_ELEMENTS_ALWAYS, "Swimming Pool"]
    : BLINDING_ELEMENTS_ALWAYS;

  function updElement(name: string, key: keyof BlindingElement, val: string) {
    const current = data[name] ?? defaultBlindingElement();
    onChange({ ...data, [name]: { ...current, [key]: val } });
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {elements.map((el) => {
          const el_data = data[el] ?? defaultBlindingElement();
          return (
            <div key={el} className="border border-border/50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{el}</p>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Grade of Concrete" value={el_data.gradeOfConcrete} onChange={(v) => updElement(el, "gradeOfConcrete", v)} options={CONCRETE_GRADES} />
                <SelectField label="Casting Method" value={el_data.castingMethod} onChange={(v) => updElement(el, "castingMethod", v)} options={CASTING_METHODS} />
                <NumberField label="Waste (%)" value={el_data.wastePercent} onChange={(v) => updElement(el, "wastePercent", v)} />
                <NumberField label="Blinding Thickness (mm)" value={el_data.blindingThickness} onChange={(v) => updElement(el, "blindingThickness", v)} />
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
}: {
  data: Record<string, ConcreteElement>;
  onChange: (d: Record<string, ConcreteElement>) => void;
  hasLift: boolean;
}) {
  const elements = hasLift
    ? [...SUPERSTRUCTURE_ELEMENTS_ALWAYS, "Lift Wall"]
    : SUPERSTRUCTURE_ELEMENTS_ALWAYS;

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

function SubstructureTab() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <p className="text-sm">Substructure configuration coming soon.</p>
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
                <BlindingTab data={data.blinding} onChange={updBlinding} hasPool={hasPool} />
              )}
              {tabId === "substructure" && <SubstructureTab />}
              {tabId === "superstructure" && (
                <SuperstructureTab data={data.superstructure} onChange={updSuperstructure} hasLift={hasLift} />
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
