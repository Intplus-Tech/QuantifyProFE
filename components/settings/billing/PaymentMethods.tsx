"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2 } from "lucide-react";
import {
  useGetPaymentMethodsQuery,
  useSetPrimaryPaymentMethodMutation,
} from "@/store/api/billingApi";
import { toast } from "sonner";
import { useState } from "react";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";

export function PaymentMethods() {
  const { data: methodsResponse, isLoading } = useGetPaymentMethodsQuery();
  const [setPrimary, { isLoading: isSettingPrimary }] =
    useSetPrimaryPaymentMethodMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const paymentMethods = methodsResponse?.data || [];

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimary({ id, isPrimary: true }).unwrap();
      toast.success("Primary payment method updated.");
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to update primary payment method.",
      );
    }
  };

  if (isLoading)
    return (
      <Card className="shadow-sm border-border/50 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-xl m-6" />
      </Card>
    );

  return (
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
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div
              key={method._id}
              className="flex items-center justify-between bg-white rounded-lg p-4 border border-border/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-7 rounded flex items-center justify-center ${
                    method.type === "card"
                      ? "bg-linear-to-br from-red-500 to-yellow-400"
                      : "bg-emerald-100"
                  }`}
                >
                  {method.type === "card" ? (
                    <CreditCard className="w-5 h-5 text-white" />
                  ) : (
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {method.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {method.expiryDate
                      ? `Expires ${method.expiryDate}`
                      : "Active"}
                  </p>
                </div>
              </div>
              {method.isPrimary ? (
                <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium">
                  PRIMARY
                </Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isSettingPrimary}
                  onClick={() => handleSetPrimary(method._id)}
                  className="text-muted-foreground text-xs hover:text-primary"
                >
                  Set as Primary
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 border border-dashed border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              No payment methods added yet.
            </p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="w-full border-dashed border-border/50 text-muted-foreground font-medium h-12"
        >
          + Add Payment Method
        </Button>

        <AddPaymentMethodModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </CardContent>
    </Card>
  );
}
