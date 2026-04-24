"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, PROJECT_TYPES, PROJECT_PHASES } from "./constants";
import type { Step2Data } from "./types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  projectName:    z.string().min(2, "Project name must be at least 2 characters"),
  clientName:     z.string().min(2, "Client name must be at least 2 characters"),
  projectRef:     z.string().optional(),
  streetAddress:  z.string().optional(),
  currency:       z.string().min(1, "Currency is required"),
  projectType:    z.string().min(1, "Project type is required"),
  projectPhase:   z.string().min(1, "Project phase is required"),
  durationMonths: z.string().optional(),
  description:    z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StepProjectDetailsProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
}

export function StepProjectDetails({ data, onChange, onNext }: StepProjectDetailsProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  function onSubmit(values: FormValues) {
    onChange(values as Step2Data);
    onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Project Details</h2>
        <p className="text-sm text-muted-foreground">
          Provide project information, classification, and location.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: General Information ── */}
          <div className="border border-border/50 rounded-xl p-5 space-y-5 bg-card">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-0.5">
                General Information
              </h3>
              <p className="text-xs text-muted-foreground">
                Basic identity of the project.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("projectName")}
                placeholder="e.g. Skyline Residency Phase 2"
                className="border-border/60"
              />
              <FieldError message={errors.projectName?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("clientName")}
                placeholder="e.g. Real Estate Development Corp."
                className="border-border/60"
              />
              <FieldError message={errors.clientName?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Project ID / Reference{" "}
                <span className="text-muted-foreground/60">— Optional</span>
              </Label>
              <Input
                {...register("projectRef")}
                placeholder="PRJ-2024-001"
                className="border-border/60"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-3">
                Location &amp; Address
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Street Address
                </Label>
                <Input
                  {...register("streetAddress")}
                  placeholder="e.g. 123 Victoria Island, Lagos"
                  className="border-border/60"
                />
              </div>
            </div>
          </div>

          {/* ── Right: Classification ── */}
          <div className="border border-border/50 rounded-xl p-5 space-y-5 bg-card">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-0.5">
                Classification
              </h3>
              <p className="text-xs text-muted-foreground">
                Project type, phase, and financial settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-border/60">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.currency?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Project Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="projectType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-border/60">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.projectType?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Project Phase <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="projectPhase"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-border/60">
                      <SelectValue placeholder="Select project phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_PHASES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.projectPhase?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Project Duration (months)
              </Label>
              <Input
                {...register("durationMonths")}
                type="number"
                min="1"
                placeholder="e.g. 18"
                className="border-border/60"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Description
              </Label>
              <Textarea
                {...register("description")}
                placeholder="Brief project overview..."
                className="border-border/60 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end pt-4 border-t border-border/40">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Next Step →
          </Button>
        </div>
      </form>
    </div>
  );
}
