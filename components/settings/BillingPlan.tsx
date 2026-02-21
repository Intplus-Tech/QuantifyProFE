"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Building2,
  ArrowUpRight,
  Download,
  Sparkles,
  HardDrive,
  BarChart3,
  FolderOpen,
  Users,
} from "lucide-react";

const billingHistory = [
  {
    id: "INV-2024-011",
    date: "Nov 1, 2024",
    amount: "₦15,000",
    status: "Paid",
  },
  {
    id: "INV-2024-010",
    date: "Oct 1, 2024",
    amount: "₦15,000",
    status: "Paid",
  },
];

export default function BillingPlan() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Current Subscription */}
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
                  <h3 className="text-xl font-bold text-foreground">
                    Solo Plan
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-0 font-medium text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  ₦15,000/month · Renews Dec 1, 2024
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-500 hover:bg-red-50 font-medium"
                >
                  Cancel Plan
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-white font-medium"
                >
                  Upgrade Plan
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-foreground">
                Payment Methods
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mastercard */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Mastercard ••••4242
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires 08/2027
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium">
                PRIMARY
              </Badge>
            </div>

            {/* Bank Account */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Bank Account ••••9012
                  </p>
                  <p className="text-xs text-muted-foreground">
                    First Bank of Nigeria
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
              >
                Set as Primary
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed border-border/50 text-muted-foreground font-medium"
            >
              + Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Plan Usage */}
      <div className="space-y-6">
        <Card className="shadow-sm border-border/50 bg-slate-50/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Plan Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Active Projects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">
                    Active Projects
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">3/5</span>
              </div>
              <Progress
                value={60}
                className="h-2 bg-gray-200 [&>div]:bg-orange-500"
              />
            </div>

            {/* BOQ Extractions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">
                    BOQ Extractions
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">12/20</span>
              </div>
              <Progress
                value={60}
                className="h-2 bg-gray-200 [&>div]:bg-blue-500"
              />
            </div>

            {/* Cloud Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">
                    Cloud Storage
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  2.4GB/5GB
                </span>
              </div>
              <Progress
                value={48}
                className="h-2 bg-gray-200 [&>div]:bg-emerald-500"
              />
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              Need more resources?{" "}
              <span className="text-orange-500 font-medium cursor-pointer hover:underline">
                Upgrade your plan
              </span>{" "}
              to unlock higher limits and premium features.
            </p>
          </CardContent>
        </Card>

        {/* Invite a Colleague */}
        <Card className="shadow-none bg-slate-800 border-0 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Invite a Colleague</h3>
                <p className="text-sm text-slate-300">
                  Both of you get 20% off for 3 months when they subscribe
                </p>
              </div>
            </div>
            <Button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold">
              Send Invite
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="shadow-sm border-border/50 w-full lg:col-span-3">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-lg font-bold text-foreground">
              Billing History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border/20 last:border-0"
                  >
                    <td className="py-4 text-sm font-semibold text-foreground">
                      {invoice.id}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {invoice.date}
                    </td>
                    <td className="py-4 text-sm font-medium text-foreground">
                      {invoice.amount}
                    </td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-600 border-0 text-xs font-medium">
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-500 hover:text-orange-600 text-xs font-medium gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
