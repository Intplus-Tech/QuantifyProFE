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
  setDetails,
  setCreatedProjectId,
} from "@/store/slices/manualWizardSlice";
import { StepProjectDetails } from "./StepProjectDetails";
import { StepDrawings } from "./StepDrawings";
import { SaveSetupModal } from "./SaveSetupModal";
import { useCreateProjectMutation } from "@/store/api/projectsApi";
import { buildCreateProjectPayload } from "./manualWizardTransformers";

const WIZARD_STEPS = [
  { id: 1, label: "Project Details", subtitle: "Info & location" },
  { id: 2, label: "Drawings", subtitle: "Upload files" },
] as const;

interface ManualSetupShellProps {
  basePath?: string;
}

export function ManualSetupShell({ basePath = "/projects" }: ManualSetupShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const currentStep = useAppSelector((state) => state.manualWizard.currentStep);
  const draftSavedAt = useAppSelector((state) => state.manualWizard.draftSavedAt);
  const details = useAppSelector((state) => state.manualWizard.details);
  const createdProjectId = useAppSelector((state) => state.manualWizard.createdProjectId);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [createProject] = useCreateProjectMutation();

  // Only reset when arriving fresh (no draft)
  useEffect(() => {
    if (!draftSavedAt) dispatch(resetWizard());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCancel() {
    dispatch(resetWizard());
    router.push(basePath);
  }

  function handleSaveDraft() {
    dispatch(markDraftSaved());
    toast.success("Draft saved.");
  }

  async function handleSaveAndProceed() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let projectId = createdProjectId;

      if (!projectId) {
        const payload = buildCreateProjectPayload(details);
        const result = await createProject(payload).unwrap();
        projectId = result.data?._id;
        if (!projectId) throw new Error("Project creation did not return a valid ID.");
        dispatch(setCreatedProjectId(projectId));
      }

      setSavedProjectId(projectId);
      setShowSaveModal(true);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as Error)?.message ??
        "Failed to save project. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleProceedToWorkspace() {
    const projectId = savedProjectId ?? createdProjectId;
    dispatch(resetWizard());
    router.push(`${basePath}/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background border-b border-border/50 flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={currentStep === 1 ? handleCancel : () => dispatch(goBackStep())}
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
      <div className="border-b border-border/40 bg-background px-6 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
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
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent || isDone ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{step.subtitle}</p>
                  </div>
                </div>
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          {currentStep === 1 && (
            <StepProjectDetails
              data={details}
              onChange={(d) => dispatch(setDetails(d))}
              onNext={() => dispatch(goNextStep())}
            />
          )}
          {currentStep === 2 && (
            <StepDrawings
              onBack={() => dispatch(goBackStep())}
              onSaveAndProceed={handleSaveAndProceed}
              isSaving={isSaving}
            />
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      <SaveSetupModal
        open={showSaveModal}
        onCancel={() => setShowSaveModal(false)}
        onProceed={handleProceedToWorkspace}
      />
    </div>
  );
}
