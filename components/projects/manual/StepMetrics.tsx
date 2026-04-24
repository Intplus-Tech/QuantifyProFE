"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Step5Data } from "./types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  advancePayment: z.string().optional(),
  fxRate:         z.string().optional(),
  markup:         z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  retention:      z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  contingency:    z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  preliminaries:  z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
});

type FormValues = z.infer<typeof schema>;

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Percent input ────────────────────────────────────────────────────────────

function PercentInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-border/60 pr-8"
          step="0.1"
          min="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
          %
        </span>
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StepMetricsProps {
  data: Step5Data;
  onChange: (data: Step5Data) => void;
  onBack: () => void;
  onFinish: () => void;
  isSubmitting?: boolean;
}

export function StepMetrics({ data, onChange, onBack, onFinish, isSubmitting = false }: StepMetricsProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  function onSubmit(values: FormValues) {
    onChange(values as Step5Data);
    onFinish();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Currency &amp; Measurement</h2>
        <p className="text-sm text-muted-foreground">
          Define the project currency, measurement system, and global exchange rates.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Section A: Currency cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Advance Payment */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">Advance Payment</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    ₦
                  </span>
                  <Input
                    {...register("advancePayment")}
                    placeholder="0.00"
                    className="border-border/60 pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Exchange */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">Currency Exchange</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">FX Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    ₦
                  </span>
                  <Input
                    {...register("fxRate")}
                    placeholder="1,234.56"
                    className="border-border/60 pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Section B: Base Rates & Markups ── */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-1">Base Rates &amp; Markups</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set global default values for estimations. These can be overridden per item.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Financials */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-bold text-foreground">Financials</p>
                <PercentInput
                  label="Markup (Across All Elements)"
                  value={watch("markup")}
                  onChange={(v) => setValue("markup", v)}
                  error={errors.markup?.message}
                />
                <PercentInput
                  label="Retention"
                  value={watch("retention")}
                  onChange={(v) => setValue("retention", v)}
                  error={errors.retention?.message}
                />
              </CardContent>
            </Card>

            {/* Allowances */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-bold text-foreground">Allowances</p>
                <PercentInput
                  label="Contingency"
                  value={watch("contingency")}
                  onChange={(v) => setValue("contingency", v)}
                  error={errors.contingency?.message}
                />
                <PercentInput
                  label="Preliminaries"
                  value={watch("preliminaries")}
                  onChange={(v) => setValue("preliminaries", v)}
                  error={errors.preliminaries?.message}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Button type="button" variant="outline" onClick={onBack}>
            ← Back to Finishing
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Project…
              </>
            ) : (
              "Go to Workspace →"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
