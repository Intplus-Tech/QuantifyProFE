"use client";

import { useEffect, useState } from "react";
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
  updateFinishing as setFinishingState,
  updateMetrics as setMetricsState,
  updateScope,
  updateStep2,
  setCreatedProjectId,
} from "@/store/slices/manualWizardSlice";
import { WIZARD_STEPS } from "./constants";
import { buildWorkspaceProjectFromWizard } from "../workspace/workspaceMapper";
import {
  persistWorkspaceProjectSnapshot,
  registerWorkspaceProject,
} from "@/store/slices/projectWorkspaceSlice";
import { StepProjectDetails } from "./StepProjectDetails";
import { StepScope } from "./StepScope";
import { StepFinishing } from "./StepFinishing";
import { StepMetrics } from "./StepMetrics";
import { useCreateProjectMutation } from "@/store/api/projectsApi";
import {
  useUpdateQsConfigMutation,
  useUpsertStructuralScopeMutation,
  useUpdateFinishingMutation,
  useUpdateMetricsMutation,
} from "@/store/api/manualProjectApi";
import {
  buildCreateProjectPayload,
  buildQsConfigPayload,
  buildStructuralScopeBody,
  buildFinishingPayload,
  buildMetricsPayload,
  normaliseFoundationType,
} from "./manualWizardTransformers";

interface ManualSetupShellProps {
  basePath?: string; // "/projects" or "/enterprise/projects"
}

export function ManualSetupShell({ basePath = "/projects" }: ManualSetupShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.manualWizard.currentStep);
  const draftSavedAt = useAppSelector((state) => state.manualWizard.draftSavedAt);
  const createdProjectId = useAppSelector((state) => state.manualWizard.createdProjectId);
  const wizardState = useAppSelector((state) => state.manualWizard.wizard);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Manual-flow API mutations (isolated from AI flow) ──
  const [createProject] = useCreateProjectMutation();
  const [updateQsConfig] = useUpdateQsConfigMutation();
  const [upsertStructuralScope] = useUpsertStructuralScopeMutation();
  const [updateFinishing] = useUpdateFinishingMutation();
  const [updateMetrics] = useUpdateMetricsMutation();

  useEffect(() => {
    if (!draftSavedAt) {
      dispatch(resetWizard());
    }
  }, [dispatch, draftSavedAt]);

  const goNext = () => dispatch(goNextStep());
  const goBack = () => dispatch(goBackStep());

  function handleCancel() {
    dispatch(resetWizard());
    router.push(basePath);
  }

  function handleSaveDraft() {
    dispatch(markDraftSaved());
    toast.success("Draft saved.");
  }

  async function handleFinish() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    console.group("[ManualWizard] handleFinish — starting submission");
    console.log("Wizard state snapshot:", JSON.parse(JSON.stringify(wizardState)));

    try {
      // ── Step 1: Create the project shell ──────────────────────────────────
      let projectId = createdProjectId;
      if (!projectId) {
        const createPayload = buildCreateProjectPayload(wizardState.step2);
        console.group("[ManualWizard] Step 1 — POST /projects");
        console.log("Payload:", createPayload);
        const t1 = performance.now();
        const createResult = await createProject(createPayload).unwrap();
        console.log(`Response (${(performance.now() - t1).toFixed(0)}ms):`, createResult);
        console.groupEnd();

        projectId = createResult.data?._id;
        if (!projectId) {
          throw new Error("Project creation did not return a valid ID.");
        }
        dispatch(setCreatedProjectId(projectId));
        console.log("[ManualWizard] Project ID assigned:", projectId);
      } else {
        console.log("[ManualWizard] Step 1 skipped — reusing existing project ID:", projectId);
      }

      // ── Step 2: QS Configuration ──────────────────────────────────────────
      const qsPayload = buildQsConfigPayload(wizardState.scope.scopeConfig);
      console.group("[ManualWizard] Step 2 — PATCH /takeoff/:id/qs-config");
      console.log("Payload:", qsPayload);
      const t2 = performance.now();
      const qsResult = await updateQsConfig({ projectId, body: qsPayload }).unwrap();
      console.log(`Response (${(performance.now() - t2).toFixed(0)}ms):`, qsResult);
      console.groupEnd();

      // ── Step 3: Structural Scope ──────────────────────────────────────────
      const foundationType = normaliseFoundationType(wizardState.scope.scopeConfig.foundationType);
      const scopeBody = buildStructuralScopeBody(wizardState.scope);
      console.group(`[ManualWizard] Step 3 — PUT /takeoff/:id/structural-scope/${foundationType}`);
      console.log("Foundation type:", foundationType);
      console.log("Payload:", scopeBody);
      const t3 = performance.now();
      const scopeResult = await upsertStructuralScope({ projectId, foundationType, body: scopeBody }).unwrap();
      console.log(`Response (${(performance.now() - t3).toFixed(0)}ms):`, scopeResult);
      console.groupEnd();

      // ── Step 4: Finishing ─────────────────────────────────────────────────
      const finishingPayload = buildFinishingPayload(wizardState.finishing);
      console.group("[ManualWizard] Step 4 — PATCH /projects/:id/finishing");
      console.log("Payload:", finishingPayload);
      const t4 = performance.now();
      const finishingResult = await updateFinishing({ projectId, body: finishingPayload }).unwrap();
      console.log(`Response (${(performance.now() - t4).toFixed(0)}ms):`, finishingResult);
      console.groupEnd();

      // ── Step 5: Financial Metrics ─────────────────────────────────────────
      const metricsPayload = buildMetricsPayload(wizardState.metrics);
      console.group("[ManualWizard] Step 5 — PATCH /projects/:id/metrics");
      console.log("Payload:", metricsPayload);
      const t5 = performance.now();
      const metricsResult = await updateMetrics({ projectId, body: metricsPayload }).unwrap();
      console.log(`Response (${(performance.now() - t5).toFixed(0)}ms):`, metricsResult);
      console.groupEnd();

      // ── Persist workspace snapshot locally (legacy support) ───────────────
      const workspaceSnapshot = buildWorkspaceProjectFromWizard(projectId, wizardState);
      persistWorkspaceProjectSnapshot(workspaceSnapshot);

      dispatch(registerWorkspaceProject(workspaceSnapshot));

      dispatch(resetWizard());
      console.log("[ManualWizard] ✅ All steps complete — navigating to project:", projectId);
      console.groupEnd(); // outer group
      toast.success("Project created successfully!");
      router.push(`${basePath}/${projectId}`);
    } catch (err: unknown) {
      // Close any open step group that threw before its groupEnd
      console.groupEnd();

      const rtkError = err as { status?: number; data?: { message?: string; errors?: unknown } };
      const message =
        rtkError?.data?.message ??
        (err as Error)?.message ??
        "Failed to create project. Please try again.";

      console.error("[ManualWizard] ❌ Submission failed");
      console.error("  HTTP status :", rtkError?.status ?? "N/A");
      console.error("  Message     :", message);
      console.error("  Server body :", rtkError?.data ?? null);
      // Expand validation errors array so field-level failures are readable
      const validationErrors = (rtkError?.data as { errors?: { body?: unknown[] } })?.errors?.body;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        console.error("  Validation errors:");
        validationErrors.forEach((e, i) => console.error(`    [${i}]`, e));
      }
      console.error("  Raw error   :", err);
      console.groupEnd(); // outer group
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
            const isDone = currentStep > step.id;
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
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCurrent
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
            <StepProjectDetails
              data={wizardState.step2}
              onChange={(step2) => dispatch(updateStep2(step2))}
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <StepScope
              data={wizardState.scope}
              onChange={(scope) => dispatch(updateScope(scope))}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepFinishing
              data={wizardState.finishing}
              scopeConfig={wizardState.scope.scopeConfig}
              onChange={(finishing) => dispatch(setFinishingState(finishing))}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepMetrics
              data={wizardState.metrics}
              onChange={(metrics) => dispatch(setMetricsState(metrics))}
              onBack={goBack}
              onFinish={handleFinish}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}
