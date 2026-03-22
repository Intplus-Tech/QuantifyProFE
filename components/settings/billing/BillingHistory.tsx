"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download } from "lucide-react";
import { useGetBillingHistoryQuery, useLazyGetInvoicePdfUrlQuery } from "@/store/api/billingApi";
import { toast } from "sonner";

export function BillingHistory() {
  const { data: historyResponse, isLoading } = useGetBillingHistoryQuery();
  const [triggerDownload] = useLazyGetInvoicePdfUrlQuery();

  const billingHistory = historyResponse?.data || [];

  const handleDownload = async (invoiceId: string) => {
    try {
      const { data: url } = await triggerDownload(invoiceId);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (err) {
      toast.error("Failed to download invoice.");
    }
  };

  if (isLoading) return (
    <Card className="shadow-sm border-border/50 animate-pulse w-full lg:col-span-3">
      <div className="h-64 bg-slate-100 rounded-xl m-6" />
    </Card>
  );

  return (
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
              {billingHistory.length > 0 ? (
                billingHistory.map((invoice) => (
                  <tr
                    key={invoice.invoiceId}
                    className="border-b border-border/20 last:border-0"
                  >
                    <td className="py-4 text-sm font-semibold text-foreground">
                      {invoice.invoiceId}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {new Date(invoice.paidAt || invoice.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm font-medium text-foreground">
                      {invoice.currency} {invoice.amount.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <Badge className={`border-0 text-xs font-medium ${
                        invoice.status === "paid" ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                      }`}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice.invoiceId)}
                        className="text-orange-500 hover:text-orange-600 text-xs font-medium gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No billing history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
