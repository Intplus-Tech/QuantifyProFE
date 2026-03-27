"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: { label: string; sub?: string; included: boolean }[];
  buttonClass: string;
}

const plans: Plan[] = [
  {
    id: "standard",
    name: "Standard Plan",
    description: "Best for early career QS residential projects",
    monthlyPrice: 25000,
    yearlyPrice: 250000,
    features: [
      { label: "1 User seats", included: true },
      { label: "Manual + Limited AI", sub: "10 Drawing per month", included: true },
      { label: "BOQ with Excel and PDF only", included: true },
      { label: "Naira currency support Only", included: true },
      { label: "Multi currency Support", included: false },
      { label: "NIQS standard formats", included: false },
    ],
    buttonClass: "bg-foreground hover:bg-foreground/90 text-background",
  },
  {
    id: "premium",
    name: "Premium Plan",
    description: "High volume freelance consultants",
    monthlyPrice: 55000,
    yearlyPrice: 550000,
    popular: true,
    features: [
      { label: "1 User seats", included: true },
      { label: "Unlimited AI powered takeoff", included: true },
      { label: "Excel pdf, NIQS standard formats", sub: "Templates included", included: true },
      { label: "Multi currency Support", included: true },
      { label: "Priority support", included: true },
      { label: "Advanced reporting", included: true },
    ],
    buttonClass: "bg-amber-400 hover:bg-amber-500 text-slate-900",
  },
];

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

export function ChangePlanModal({ open, onOpenChange, currentPlan }: ChangePlanModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelectPlan(planId: string, planName: string) {
    if (planId === currentPlan) return;
    setLoading(planId);
    try {
      // TODO: wire to real subscription API
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Switched to ${planName} successfully.`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-180 p-6 sm:p-8 gap-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Select the perfect plan for your quantity surveying needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col gap-5 transition-colors ${
                  plan.popular
                    ? "border-amber-400"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-400 text-slate-900 font-semibold text-xs px-3 py-0.5 rounded-full border-0">
                    Most Popular
                  </Badge>
                )}

                {/* Plan header */}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">₦</span>
                    <span className="text-4xl font-bold text-foreground">
                      {plan.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/Month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₦{plan.yearlyPrice.toLocaleString()} Billed Yearly
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            feature.included ? "text-foreground" : "text-muted-foreground/50"
                          }`}
                        >
                          {feature.label}
                        </span>
                        {feature.sub && (
                          <p className="text-xs text-muted-foreground">{feature.sub}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full font-semibold mt-2 ${plan.buttonClass}`}
                  disabled={isCurrent || loading === plan.id}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                >
                  {isCurrent
                    ? "Current Plan"
                    : loading === plan.id
                    ? "Processing…"
                    : "Get Started →"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
