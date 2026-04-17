"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  goBackStep,
  goNextStep,
  markDraftSaved,
  resetWizard,
  updateDrawings,
  updateFinishing,
  updateMetrics,
  updateScope,
  updateStep2,
} from "@/store/slices/manualWizardSlice";
import { WIZARD_STEPS } from "./constants";
import { buildWorkspaceProjectFromWizard } from "../workspace/workspaceMapper";
import { registerWorkspaceProject } from "@/store/slices/projectWorkspaceSlice";
import { StepDrawings }        from "./StepDrawings";
import { StepProjectDetails }  from "./StepProjectDetails";
import { StepScope }           from "./StepScope";
import { StepFinishing }       from "./StepFinishing";
import { StepMetrics }         from "./StepMetrics";

interface ManualSetupShellProps {
  basePath?: string; // "/projects" or "/enterprise/projects"
}

export function ManualSetupShell({ basePath = "/projects" }: ManualSetupShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.manualWizard.currentStep);
  const wizardState = useAppSelector((state) => state.manualWizard.wizard);

  useEffect(() => {
    dispatch(resetWizard());
  }, [dispatch]);

  const goNext = () => dispatch(goNextStep());
  const goBack = () => dispatch(goBackStep());

  function handleCancel() {
    router.push(basePath);
  }

  function handleSaveDraft() {
    dispatch(markDraftSaved());
    toast.success("Draft saved.");
  }

  function handleFinish() {
    const projectId = crypto.randomUUID();
    dispatch(registerWorkspaceProject(buildWorkspaceProjectFromWizard(projectId, wizardState)));
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
              onChange={(drawings) => dispatch(updateDrawings(drawings))}
              onNext={goNext}
              onSaveDraft={handleSaveDraft}
            />
          )}
          {currentStep === 2 && (
            <StepProjectDetails
              data={wizardState.step2}
              onChange={(step2) => dispatch(updateStep2(step2))}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepScope
              data={wizardState.scope}
              onChange={(scope) => dispatch(updateScope(scope))}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepFinishing
              data={wizardState.finishing}
              scopeConfig={wizardState.scope.scopeConfig}
              onChange={(finishing) => dispatch(updateFinishing(finishing))}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <StepMetrics
              data={wizardState.metrics}
              onChange={(metrics) => dispatch(updateMetrics(metrics))}
              onBack={goBack}
              onFinish={handleFinish}
            />
          )}
        </div>
      </main>
    </div>
  );
}
