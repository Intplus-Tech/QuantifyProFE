"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WIZARD_STEPS, defaultStep2, defaultStep3, defaultStep4, defaultStep5, defaultSubstructureData, defaultSubstructureFooting, defaultSubstructureFrameElement, defaultBlindingElement } from "./constants";
import type { WizardState, UploadedFile, Step2Data, Step3Data, Step4Data, Step5Data, ConcreteElement, SubstructureData, BlindingElement } from "./types";
import { StepDrawings }        from "./StepDrawings";
import { StepProjectDetails }  from "./StepProjectDetails";
import { StepScope }           from "./StepScope";
import { StepFinishing }       from "./StepFinishing";
import { StepMetrics }         from "./StepMetrics";

interface ManualSetupShellProps {
  basePath?: string; // "/projects" or "/enterprise/projects"
}

function normalizeScopeState(scope: Step3Data): Step3Data {
  const hasPool = scope.scopeConfig.hasPool;
  const hasLift = scope.scopeConfig.lift === "Yes";
  const hasStairs = Number(scope.scopeConfig.noOfFloors) > 0;
  const projectType = scope.scopeConfig.projectType;
  const foundationType = scope.scopeConfig.foundationType;

  // For Piling Alone, clear Blinding and Substructure entirely
  if (projectType === "Piling Alone") {
    return {
      ...scope,
      blinding: {},
      substructure: defaultSubstructureData(),
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  // For Foundation & Carcass Only + Pile, clear Substructure entirely
  if (projectType === "Foundation & Carcass Only" && foundationType === "Pile") {
    return {
      ...scope,
      blinding: {
        ...(hasPool ? { "Swimming Pool": scope.blinding["Swimming Pool"] ?? defaultBlindingElement() } : {}),
        "Pile Cap": scope.blinding["Pile Cap"] ?? defaultBlindingElement(),
        "Oversite Slab": scope.blinding["Oversite Slab"] ?? defaultBlindingElement(),
      },
      substructure: defaultSubstructureData(),
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  // For Carcass with finishes (all foundation types), clear Substructure entirely
  if (projectType === "Carcass with finishes") {
    const blindingElements: Record<string, BlindingElement> = {};
    if (hasPool) {
      blindingElements["Swimming Pool"] = scope.blinding["Swimming Pool"] ?? defaultBlindingElement();
    }
    
    if (foundationType === "Pile") {
      blindingElements["Pile Cap"] = scope.blinding["Pile Cap"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] = scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    } else if (foundationType === "Raft") {
      blindingElements["Raft Foundation"] = scope.blinding["Raft Foundation"] ?? defaultBlindingElement();
      blindingElements["Ground Beam"] = scope.blinding["Ground Beam"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] = scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
      blindingElements["Pad Footing"] = scope.blinding["Pad Footing"] ?? defaultBlindingElement();
    } else if (foundationType === "Strip") {
      blindingElements["Strip Foundation"] = scope.blinding["Strip Foundation"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] = scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    } else if (foundationType === "Raft Pile with Basement") {
      blindingElements["Pile Cap"] = scope.blinding["Pile Cap"] ?? defaultBlindingElement();
      blindingElements["Ground Beam"] = scope.blinding["Ground Beam"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] = scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    }
    
    return {
      ...scope,
      blinding: blindingElements,
      substructure: defaultSubstructureData(),
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  const nextBlinding = { ...scope.blinding };
  if (!hasPool) {
    delete nextBlinding["Swimming Pool"];
  }
  if (foundationType === "Pile") {
    delete nextBlinding["Ground Beam"];
  }
  if (projectType !== "Foundation & Carcass Only" && projectType !== "Carcass with finishes") {
    delete nextBlinding["Pad Footing"];
    delete nextBlinding["Strip Foundation"];
  }
  if ((projectType === "Foundation & Carcass Only" || projectType === "Carcass with finishes") && foundationType !== "Raft") {
    delete nextBlinding["Pad Footing"];
  }
  if ((projectType === "Foundation & Carcass Only" || projectType === "Carcass with finishes") && foundationType !== "Strip" && foundationType !== "Raft") {
    delete nextBlinding["Strip Foundation"];
  }

  const nextSuperstructure = filterSuperstructure(scope.superstructure, hasLift, hasStairs);

  const nextSubstructureElements = { ...scope.substructure.elements };
  if (!hasLift) {
    delete nextSubstructureElements["Lift Wall"];
  }
  if (!hasPool) {
    delete nextSubstructureElements["Swimming Pool"];
  }
  if (foundationType === "Pile") {
    delete nextSubstructureElements["Ground Beam"];
  }
  if ((projectType === "Foundation & Carcass Only" || projectType === "Carcass with finishes") && foundationType !== "Raft" && foundationType !== "Strip") {
    delete nextSubstructureElements["Column Footing (Upper Strip)"];
  }

  const nextBlockworkInStripFoundation =
    (projectType === "Foundation & Carcass Only" || projectType === "Carcass with finishes") && (foundationType === "Raft" || foundationType === "Strip")
      ? scope.substructure.blockworkInStripFoundation
      : { blockworkForFormwork: "", blockworkFilling: "" };

  return {
    ...scope,
    blinding: nextBlinding,
    substructure: {
      ...scope.substructure,
      elements: nextSubstructureElements,
      blockworkInStripFoundation: nextBlockworkInStripFoundation,
    },
    superstructure: nextSuperstructure,
  };
}

function filterSuperstructure(superstructure: Record<string, ConcreteElement>, hasLift: boolean, hasStairs: boolean): Record<string, ConcreteElement> {
  const nextSuperstructure = { ...superstructure };
  if (!hasLift) {
    delete nextSuperstructure["Lift Wall"];
  }
  if (!hasStairs) {
    delete nextSuperstructure["Stairs"];
  }
  return nextSuperstructure;
}

function normalizeFinishingState(finishing: Step4Data, scopeConfig: Step3Data["scopeConfig"]): Step4Data {
  const hasPool = scopeConfig.hasPool;
  const hasLift = scopeConfig.lift === "Yes";
  const hasStairs = Number(scopeConfig.noOfFloors) > 0;

  return {
    ...finishing,
    specifications: {
      ...finishing.specifications,
      riserHeightForStairs: hasStairs ? finishing.specifications.riserHeightForStairs : "",
    },
    floorTiles: {
      ...finishing.floorTiles,
      stairsArea: hasStairs ? finishing.floorTiles.stairsArea : [],
      swimmingPool: hasPool ? finishing.floorTiles.swimmingPool : [],
      liftWalls: hasLift ? finishing.floorTiles.liftWalls : [],
    },
  };
}

export function ManualSetupShell({ basePath = "/projects" }: ManualSetupShellProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [wizardState, setWizardState] = useState<WizardState>({
    drawings: [],
    step2: defaultStep2(),
    scope: defaultStep3(),
    finishing: defaultStep4(),
    metrics: defaultStep5(),
  });

  // ── Updaters passed to each step ──────────────────────────────────────────
  const updateDrawings = useCallback((drawings: UploadedFile[]) => {
    setWizardState((prev) => ({ ...prev, drawings }));
  }, []);

  const updateStep2 = useCallback((step2: Step2Data) => {
    setWizardState((prev) => ({ ...prev, step2 }));
  }, []);

  const updateScope = useCallback((scope: Step3Data) => {
    setWizardState((prev) => {
      const normalizedScope = normalizeScopeState(scope);
      const normalizedFinishing = normalizeFinishingState(
        prev.finishing,
        normalizedScope.scopeConfig
      );

      return {
        ...prev,
        scope: normalizedScope,
        finishing: normalizedFinishing,
      };
    });
  }, []);

  const updateFinishing = useCallback((finishing: Step4Data) => {
    setWizardState((prev) => ({ ...prev, finishing }));
  }, []);

  const updateMetrics = useCallback((metrics: Step5Data) => {
    setWizardState((prev) => ({ ...prev, metrics }));
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = useCallback(() => setCurrentStep((s) => Math.min(s + 1, 5)), []);
  const goBack = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 1)), []);

  function handleCancel() {
    router.push(basePath);
  }

  function handleSaveDraft() {
    toast.success("Draft saved.");
  }

  function handleFinish() {
    const projectId = crypto.randomUUID();
    router.push(`${basePath}/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Fixed Header ── */}
      <header className="sticky top-0 z-30 bg-background border-b border-border/50 flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={currentStep === 1 ? handleCancel : goBack}
            className="h-8 w-8 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-foreground text-sm">New Project Setup</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            className="text-muted-foreground gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save draft
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* ── Stepper ── */}
      <div className="border-b border-border/40 bg-background p-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isDone    = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center gap-2 flex-1 min-w-0">
                {/* Step pill */}
                <div className="flex items-center gap-2 min-w-0">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.id}
                    </div>
                  )}
                  <div className="min-w-0 hidden sm:block">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{step.subtitle}</p>
                  </div>
                </div>
                {/* Connector line */}
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 ${isDone ? "bg-primary" : "bg-border/60"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {currentStep === 1 && (
            <StepDrawings
              drawings={wizardState.drawings}
              onChange={updateDrawings}
              onNext={goNext}
              onSaveDraft={handleSaveDraft}
            />
          )}
          {currentStep === 2 && (
            <StepProjectDetails
              data={wizardState.step2}
              onChange={updateStep2}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepScope
              data={wizardState.scope}
              onChange={updateScope}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepFinishing
              data={wizardState.finishing}
              scopeConfig={wizardState.scope.scopeConfig}
              onChange={updateFinishing}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <StepMetrics
              data={wizardState.metrics}
              onChange={updateMetrics}
              onBack={goBack}
              onFinish={handleFinish}
            />
          )}
        </div>
      </main>
    </div>
  );
}
