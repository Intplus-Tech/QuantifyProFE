import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  defaultStep2,
  defaultStep3,
  defaultStep4,
  defaultStep5,
} from "@/components/projects/manual/constants";
import {
  normalizeFinishingState,
  normalizeScopeState,
} from "@/components/projects/manual/stateNormalization";
import type {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  WizardState,
} from "@/components/projects/manual/types";

interface ManualWizardState {
  currentStep: number;
  wizard: WizardState;
  draftSavedAt: number | null;
  createdProjectId: string | null;
}

const initialState: ManualWizardState = {
  currentStep: 1,
  draftSavedAt: null,
  createdProjectId: null,
  wizard: {
    step2: defaultStep2(),
    scope: defaultStep3(),
    finishing: defaultStep4(),
    metrics: defaultStep5(),
  },
};

const manualWizardSlice = createSlice({
  name: "manualWizard",
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = Math.max(1, Math.min(action.payload, 4));
    },
    goNextStep(state) {
      state.currentStep = Math.min(state.currentStep + 1, 4);
    },
    goBackStep(state) {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },
    updateStep2(state, action: PayloadAction<Step2Data>) {
      state.wizard.step2 = action.payload;
    },
    updateScope(state, action: PayloadAction<Step3Data>) {
      const normalizedScope = normalizeScopeState(action.payload);
      state.wizard.scope = normalizedScope;
      state.wizard.finishing = normalizeFinishingState(
        state.wizard.finishing,
        normalizedScope.scopeConfig,
      );
    },
    updateFinishing(state, action: PayloadAction<Step4Data>) {
      state.wizard.finishing = normalizeFinishingState(
        action.payload,
        state.wizard.scope.scopeConfig,
      );
    },
    updateMetrics(state, action: PayloadAction<Step5Data>) {
      state.wizard.metrics = action.payload;
    },
    markDraftSaved(state) {
      state.draftSavedAt = Date.now();
    },
    setCreatedProjectId(state, action: PayloadAction<string>) {
      state.createdProjectId = action.payload;
    },
    resetWizard(state) {
      state.currentStep = initialState.currentStep;
      state.draftSavedAt = initialState.draftSavedAt;
      state.createdProjectId = initialState.createdProjectId;
      state.wizard = {
        step2: defaultStep2(),
        scope: defaultStep3(),
        finishing: defaultStep4(),
        metrics: defaultStep5(),
      };
    },
  },
});

export const {
  setCurrentStep,
  goNextStep,
  goBackStep,
  updateStep2,
  updateScope,
  updateFinishing,
  updateMetrics,
  markDraftSaved,
  setCreatedProjectId,
  resetWizard,
} = manualWizardSlice.actions;

export default manualWizardSlice.reducer;
