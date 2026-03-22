"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddPaymentMethodMutation } from "@/store/api/billingApi";
import { toast } from "sonner";
import { CreditCard, ShieldCheck } from "lucide-react";

const paymentMethodSchema = z.object({
  type: z.enum(["card", "bank_account"]),
  last4: z.string().length(4, "Must be last 4 digits"),
  label: z.string().min(2, "Label is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format MM/YY"),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
}: AddPaymentMethodModalProps) {
  const [addPaymentMethod, { isLoading }] = useAddPaymentMethodMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: "card",
      label: "Visa Card",
    },
  });

  const onSubmit = async (data: PaymentMethodFormValues) => {
    try {
      await addPaymentMethod(data).unwrap();
      toast.success("Payment method added successfully.");
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add payment method.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Add Payment Method</DialogTitle>
          <DialogDescription>
            Securely add a new payment method to your account for subscriptions
            and credits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Card Label</Label>
            <Input
              id="label"
              {...register("label")}
              placeholder="e.g. Work Visa Card"
              className="h-12"
            />
            {errors.label && (
              <p className="text-xs text-red-500">{errors.label.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last4">Last 4 Digits</Label>
              <Input
                id="last4"
                {...register("last4")}
                placeholder="4242"
                maxLength={4}
                className="h-12"
              />
              {errors.last4 && (
                <p className="text-xs text-red-500">{errors.last4.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                {...register("expiryDate")}
                placeholder="MM/YY"
                maxLength={5}
                className="h-12"
              />
              {errors.expiryDate && (
                <p className="text-xs text-red-500">
                  {errors.expiryDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-border/30">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] text-muted-foreground leading-tight">
              Your payment information is encrypted and stored securely. We do
              not store your full card details.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-12">
              {isLoading ? "Saving..." : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
