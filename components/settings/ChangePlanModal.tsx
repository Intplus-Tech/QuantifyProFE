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
import { useGetPlansQuery } from "@/store/api/plansApi";
import { useSubscribeMutation } from "@/store/api/billingApi";
import { Loader2 } from "lucide-react";

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

const planDetails: Record<string, any> = {
  standard: {
    description: "Best for early career QS residential projects",
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
  premium: {
    description: "High volume freelance consultants",
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
};

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

export function ChangePlanModal({ open, onOpenChange, currentPlan }: ChangePlanModalProps) {
  const { data: plansResponse, isLoading: plansLoading } = useGetPlansQuery();
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const plans = plansResponse?.data || [];

  async function handleSelectPlan(planId: string, planName: string) {
    if (planId === currentPlan || plansLoading) return;
    setProcessingId(planId);
    try {
      const response = await subscribe({
        planId,
        billingInterval: "monthly", // Defaulting to monthly for now
      }).unwrap();

      if (response.success && response.data.authorizationUrl) {
        toast.info("Redirecting to payment gateway...");
        window.location.href = response.data.authorizationUrl;
      } else {
        toast.success(`Plan updated to ${planName} successfully.`);
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change plan. Please try again.");
    } finally {
      setProcessingId(null);
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

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-5 min-h-[400px]">
          {plansLoading ? (
            <div className="col-span-2 flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            plans.map((plan: any) => {
              const details = planDetails[plan.slug] || planDetails["standard"];
              const isCurrent = plan.slug === currentPlan || plan._id === currentPlan;
              const isProcessing = processingId === plan._id || processingId === plan.id;

              return (
                <div
                  key={plan._id || plan.id}
                  className={`relative rounded-2xl border-2 p-6 flex flex-col gap-5 transition-colors ${
                    details.popular ? "border-amber-400" : "border-border"
                  }`}
                >
                  {details.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-400 text-slate-900 font-semibold text-xs px-3 py-0.5 rounded-full border-0">
                      Most Popular
                    </Badge>
                  )}

                  {/* Plan header */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {details.description || plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground">₦</span>
                      <span className="text-4xl font-bold text-foreground">
                        {(plan.monthlyPrice || plan.price || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">/Month</span>
                    </div>
                    {(plan.yearlyPrice || plan.annualPrice) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ₦{(plan.yearlyPrice || plan.annualPrice).toLocaleString()} Billed Yearly
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1">
                    {(details.features || []).map((feature: any, i: number) => (
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
                    className={`w-full font-semibold mt-2 ${details.buttonClass}`}
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleSelectPlan(plan._id || plan.id, plan.name)}
                  >
                    {isCurrent ? (
                      "Current Plan"
                    ) : isProcessing ? (
                      "Processing…"
                    ) : (
                      "Get Started →"
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
