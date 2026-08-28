"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentType,
  type RefObject,
} from "react";
import { LayoutGrid, X } from "lucide-react";

const ONBOARDING_KEY = "qscalc_workspace_onboarding_seen_v1";

export function hasSeenWorkspaceOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function markWorkspaceOnboardingSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export interface OnboardingLegendItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
}

export interface OnboardingStep {
  title: string;
  body: string;
  /** Optional icon-by-icon legend rendered under the body — for a step that
   *  points at a cluster of small buttons (e.g. the zoom panel) where the
   *  anchored callout alone can't explain each one individually. */
  legend?: OnboardingLegendItem[];
  targetRef: RefObject<HTMLElement | null>;
  placement?: "right" | "left" | "top" | "bottom";
}

interface WorkspaceOnboardingProps {
  steps: OnboardingStep[];
  onFinish: () => void;
}

const TOOLTIP_WIDTH = 268;

export function WorkspaceOnboarding({ steps, onFinish }: WorkspaceOnboardingProps) {
  // -1 = welcome modal, 0..steps.length-1 = anchored coachmark steps
  const [stepIndex, setStepIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const current = stepIndex >= 0 ? steps[stepIndex] : null;

  useLayoutEffect(() => {
    if (!current) {
      setRect(null);
      return;
    }
    function update() {
      const el = current!.targetRef.current;
      setRect(el ? el.getBoundingClientRect() : null);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current, stepIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleSkip();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNext() {
    if (stepIndex + 1 >= steps.length) {
      markWorkspaceOnboardingSeen();
      onFinish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleSkip() {
    markWorkspaceOnboardingSeen();
    onFinish();
  }

  // ── Welcome modal ──────────────────────────────────────────────────────────
  if (stepIndex === -1) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 relative">
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center mb-4 shadow-sm">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">
            Welcome to your workspace
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Here&apos;s a quick tour of how to take off quantities from your
            drawing — takes about 20 seconds.
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Skip
            </button>
            <button
              onClick={() => setStepIndex(0)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
            >
              Start tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current || !rect) return null;

  // ── Anchored coachmark ───────────────────────────────────────────────────────
  const placement = current.placement ?? "right";
  const GAP = 14;
  let box: React.CSSProperties = {};
  if (placement === "right") {
    box = { left: rect.right + GAP, top: rect.top };
  } else if (placement === "left") {
    box = { left: rect.left - TOOLTIP_WIDTH - GAP, top: rect.top };
  } else if (placement === "bottom") {
    box = { left: rect.left, top: rect.bottom + GAP };
  } else {
    box = { left: rect.left, top: rect.top - GAP };
  }

  const arrowBase: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };
  let arrow: React.CSSProperties = {};
  if (placement === "right") {
    arrow = {
      ...arrowBase,
      left: -6,
      top: 18,
      borderWidth: "6px 6px 6px 0",
      borderColor: "transparent white transparent transparent",
    };
  } else if (placement === "left") {
    arrow = {
      ...arrowBase,
      right: -6,
      top: 18,
      borderWidth: "6px 0 6px 6px",
      borderColor: "transparent transparent transparent white",
    };
  } else if (placement === "bottom") {
    arrow = {
      ...arrowBase,
      top: -6,
      left: 18,
      borderWidth: "0 6px 6px 6px",
      borderColor: "transparent transparent white transparent",
    };
  } else {
    arrow = {
      ...arrowBase,
      bottom: -6,
      left: 18,
      borderWidth: "6px 6px 0 6px",
      borderColor: "white transparent transparent transparent",
    };
  }

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Spotlight ring around the target — box-shadow trick dims everything else */}
      <div
        className="absolute rounded-lg ring-2 ring-amber-400 pointer-events-none transition-all duration-200"
        style={{
          left: rect.left - 4,
          top: rect.top - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
        }}
      />

      <div
        className="fixed bg-white rounded-xl shadow-xl border border-slate-200 p-4"
        style={{ width: TOOLTIP_WIDTH, ...box }}
      >
        <div style={arrow} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{current.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {current.body}
        </p>
        {current.legend && (
          <div className="space-y-1.5 mb-3 -mt-1">
            {current.legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="text-xs text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors"
            >
              {stepIndex + 1 === steps.length ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
