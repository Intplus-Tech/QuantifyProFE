"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Superseded by the Figma AI flow (details → drawings → extract → report).
// Kept commented rather than deleted so the old BIM/PDF job wiring in
// AiAnalysisContent + ProcessingView can be revived if needed.
// import { AiAnalysisContent } from "./AiAnalysisContent";

interface NewProjectDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  basePath?: string; // "/projects" or "/enterprise/projects"
  hideTrigger?: boolean;
}

export function NewProjectDialog({
  open: controlledOpen,
  onOpenChange,
  basePath = "/projects",
}: NewProjectDialogProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [selectedMode, setSelectedMode] = useState<"ai" | "manual">("ai");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const cardBase =
    "flex-1 p-4 cursor-pointer transition-colors relative flex flex-col gap-3 select-none";
  const selectedCls = "ring-2 ring-primary bg-primary/5";
  const unselectedCls =
    "ring-1 ring-border hover:ring-primary/40 hover:bg-muted/30";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* {!hideTrigger && (
        <DialogTrigger asChild>
          <Card className="border-2 border-dashed border-border/60 bg-muted/5 hover:bg-muted/20 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[320px] shadow-none">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4 shadow-sm">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-1">
              Create New Project
            </h3>
            <p className="text-sm text-muted-foreground">
              Start from scratch or template
            </p>
          </Card>
        </DialogTrigger>
      )} */}

      <DialogContent className="sm:max-w-xl gap-5">
          {/* Header */}
          <DialogHeader className="text-center px-2">
            <DialogTitle className="text-base font-semibold text-center">
              Select Processing Mode
            </DialogTitle>
            <DialogDescription className="text-center">
              Choose how you&apos;d like to initiate your cost estimation
              project for maximum efficiency.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Cards */}
          <div className="flex gap-4">
            {/* AI-Powered Processing */}
            <Card
              className={`${cardBase} ${
                selectedMode === "ai" ? selectedCls : unselectedCls
              }`}
              onClick={() => setSelectedMode("ai")}
            >
              <span className="absolute top-2 right-2 bg-amber-400/90 text-amber-900 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full leading-none">
                RECOMMENDED
              </span>

              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>

              <p className="font-semibold text-sm text-foreground">
                AI-Powered Processing
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload CAD drawings or PDFs. Our AI extracts quantities and
                generates a draft BOQ automatically in minutes.
              </p>

              <a
                href="#"
                className="text-xs text-primary font-medium mt-auto inline-flex items-center gap-1 hover:underline"
              >
                Learn more about AI extraction →
              </a>
            </Card>

            {/* Manual Entry Mode */}
            <Card
              className={`${cardBase} ${
                selectedMode === "manual" ? selectedCls : unselectedCls
              }`}
              onClick={() => setSelectedMode("manual")}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <PenLine className="w-4 h-4 text-muted-foreground" />
              </div>

              <p className="font-semibold text-sm text-foreground">
                Manual Entry Mode
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Input measurements and line items manually using our
                step-by-step wizard for maximum precision and control.
              </p>

              <a
                href="#"
                className="text-xs text-muted-foreground font-medium mt-auto inline-flex items-center gap-1 hover:underline"
              >
                Standard wizard approach →
              </a>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex gap-3 sm:justify-start mt-1">
            <Button
              size="lg"
              className="flex-1 h-12"
              onClick={() => {
                handleOpenChange(false);
                router.push(
                  selectedMode === "manual"
                    ? `${basePath}/new`
                    : `${basePath}/ai/new`,
                );
              }}
            >
              Select and Continue
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center -mt-2">
            You can switch modes at any point before final submission.
          </p>
      </DialogContent>

      {/* Old in-dialog AI step — superseded by the /ai/new route above.
      {step === "ai" && (
        <AiAnalysisContent
          onCancel={() => handleOpenChange(false)}
          onSwitchMode={() => {
            handleOpenChange(false);
            router.push(`${basePath}/new`);
          }}
          basePath={basePath}
          onSubmitSuccess={(data) => {
            console.log("Success", data);
            handleOpenChange(false);
          }}
        />
      )} */}
    </Dialog>
  );
}
