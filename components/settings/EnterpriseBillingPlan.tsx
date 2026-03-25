"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building2,
  Download,
  MoreVertical,
  FileText,
  Headphones,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupportTicketModal } from "./SupportTicketModal";
import { ChangePlanModal } from "./ChangePlanModal";

// ─── Dummy API handlers ───────────────────────────────────────────────────────

async function removePaymentMethod(id: string): Promise<void> {
  // TODO: Replace with real API call e.g. await api.delete(`/payment-methods/${id}`)
  await new Promise((r) => setTimeout(r, 600));
  console.log("[API] removePaymentMethod →", id);
}

async function makePrimaryMethod(id: string): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch(`/payment-methods/${id}/primary`)
  await new Promise((r) => setTimeout(r, 600));
  console.log("[API] makePrimaryMethod →", id);
}

// ─── Static data ─────────────────────────────────────────────────────────────

const billingHistory = [
  { id: "#INV-2024-001", date: "Oct 13, 2024", amount: "₦1,240,000.00", status: "Paid" },
  { id: "#INV-2023-082", date: "Oct 13, 2023", amount: "₦1,150,000.00", status: "Paid" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function EnterpriseBillingPlan() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  async function handleRemove(methodId: string, label: string) {
    try {
      await removePaymentMethod(methodId);
      toast.success(`${label} removed.`);
    } catch {
      toast.error("Failed to remove payment method.");
    }
  }

  async function handleMakePrimary(methodId: string, label: string) {
    try {
      await makePrimaryMethod(methodId);
      toast.success(`${label} set as primary.`);
    } catch {
      toast.error("Failed to update payment method.");
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      CURRENT PLAN
                    </p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">
                        Enterprise Plan
                      </h2>
                      <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0 text-[10px] font-bold rounded-full px-3">
                        ACTIVE
                      </Badge>
                    </div>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    onClick={() => setChangePlanOpen(true)}
                  >
                    Change Plan
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/30">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Next Billing Date
                    </p>
                    <p className="text-base font-bold text-foreground">Oct 13, 2025</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Billing Interval
                    </p>
                    <p className="text-base font-bold text-foreground">Annually</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Total Members
                    </p>
                    <p className="text-base font-bold text-foreground">12 / 20 Seats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Payment Methods
                </CardTitle>
                <button
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                  onClick={() => toast.info("Add payment method — coming soon.")}
                >
                  + Add New
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mastercard */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-slate-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Mastercard •••• 4242
                      </p>
                      <p className="text-xs text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 text-[10px] font-bold uppercase tracking-wider">
                      PRIMARY
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => handleRemove("card-4242", "Mastercard •••• 4242")}
                        >
                          Remove
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                          Already primary
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Bank Account •••• 9012
                      </p>
                      <p className="text-xs text-muted-foreground">Guaranty Trust Bank</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleRemove("bank-9012", "Bank Account •••• 9012")}
                      >
                        Remove
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleMakePrimary("bank-9012", "Bank Account •••• 9012")}
                      >
                        Make as Primary
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Invoices */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Upcoming Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Next Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled for Nov 24, 2025
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      ₦1,240,000.00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need help? */}
            <Card className="shadow-none bg-slate-800 border-0 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Need help?</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our billing support team is available 24/7 to assist you.
                  </p>
                </div>
                <Button
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                  onClick={() => setSupportOpen(true)}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Billing History */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Billing History
            </CardTitle>
            <button className="text-sm font-semibold text-primary hover:text-primary/80">
              View All
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/5">
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-foreground">
                        {invoice.id}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{invoice.date}</td>
                      <td className="py-4 px-6 font-bold text-foreground">
                        {invoice.amount}
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0 text-[10px] font-bold uppercase tracking-wider">
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary/80"
                          onClick={() => toast.success(`Downloading ${invoice.id}…`)}
                        >
                          <Download className="w-4 h-4" />
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

      <SupportTicketModal open={supportOpen} onOpenChange={setSupportOpen} />
      <ChangePlanModal open={changePlanOpen} onOpenChange={setChangePlanOpen} currentPlan="enterprise" />
    </>
  );
}
