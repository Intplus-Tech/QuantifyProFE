"use client";

import { 
  SubscriptionStatus, 
  PaymentMethods, 
  PlanUsage, 
  BillingHistory 
} from "./billing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function BillingPlan() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <SubscriptionStatus />
        <PaymentMethods />
      </div>

      {/* Right Column - Plan Usage */}
      <div className="space-y-6">
        <PlanUsage />

        {/* Invite a Colleague */}
        <Card className="shadow-none bg-slate-800 border-0 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Invite a Colleague</h3>
                <p className="text-sm text-slate-300">
                  Both of you get 20% off for 3 months when they subscribe
                </p>
              </div>
            </div>
            <Button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold shrink-0 ml-4">
              Send Invite
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <BillingHistory />
    </div>
  );
}
