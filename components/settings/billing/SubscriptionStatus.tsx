"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useGetBillingInfoQuery, useCancelSubscriptionMutation } from "@/store/api/billingApi";
import { toast } from "sonner";
import { useState } from "react";
import { ChangePlanModal } from "@/components/settings/ChangePlanModal";

export function SubscriptionStatus() {
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const { data: billingResponse, isLoading } = useGetBillingInfoQuery();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  const billingInfo = billingResponse?.data;

  const handleCancelPlan = async () => {
    try {
      await cancelSubscription({ status: "cancelled" }).unwrap();
      toast.success("Subscription cancelled successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel subscription.");
    }
  };

  if (isLoading) return (
    <Card className="shadow-sm border-border/50 animate-pulse">
      <div className="h-40 bg-slate-100 rounded-xl m-6" />
    </Card>
  );

  return (
    <>
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            Current Subscription
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-5 border border-border/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-10 h-7 rounded flex items-center justify-center ${
                billingInfo?.plan?.name === "Pro" ? "bg-linear-to-br from-red-500 to-yellow-400" : "bg-emerald-100"
              }`}></div>
              <h3 className="text-xl font-bold text-foreground">
                {billingInfo?.plan?.name || "No Active Plan"}
              </h3>
              <Badge className={`border-0 font-medium text-xs ${
                billingInfo?.subscriptionStatus === "active" 
                ? "bg-green-100 text-green-600" 
                : "bg-primary/10 text-primary"
              }`}>
                {billingInfo?.subscriptionStatus 
                  ? billingInfo.subscriptionStatus.charAt(0).toUpperCase() + billingInfo.subscriptionStatus.slice(1) 
                  : "Inactive"}
              </Badge>
            </div>
            {billingInfo && billingInfo.plan && (
              <p className="text-muted-foreground text-sm">
                ₦{billingInfo.plan.monthlyPrice.toLocaleString()}/{billingInfo.billingInterval === "monthly" ? "month" : "year"} · 
                Renews {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelPlan}
              disabled={isCancelling || !billingInfo || billingInfo.subscriptionStatus === "cancelled"}
              className="border-red-200 text-red-500 hover:bg-red-50 font-medium"
            >
              {isCancelling ? "Cancelling..." : "Cancel Plan"}
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/80 text-white font-medium"
              onClick={() => setChangePlanOpen(true)}
            >
              Upgrade Plan
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <ChangePlanModal
      open={changePlanOpen}
      onOpenChange={setChangePlanOpen}
      currentPlan={billingInfo?.plan?.name?.toLowerCase()}
    />
    </>
  );
}
