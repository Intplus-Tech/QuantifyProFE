"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const ticketSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

// ─── Dummy API handler ────────────────────────────────────────────────────────

async function submitSupportTicket(data: TicketFormValues): Promise<void> {
  // TODO: Replace with real API call e.g. await api.post("/support/tickets", data)
  await new Promise((r) => setTimeout(r, 900));
  console.log("[API] submitSupportTicket →", data);
}

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SupportTicketModal({
  open,
  onOpenChange,
}: SupportTicketModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      fullName: "",
      email: "",
      description: "",
    },
  });

  async function onSubmit(data: TicketFormValues) {
    try {
      await submitSupportTicket(data);
      toast.success("Support ticket submitted. We'll get back to you within 2 hours.");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit ticket. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-bold text-foreground">
            Support
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            If you have any query or need help send us an email.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Alex Johnson"
                  className="border-border/60"
                />
                <FieldError message={errors.fullName?.message} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="alex@company.com"
                  className="border-border/60"
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Discription
              </Label>
              <Textarea
                {...register("description")}
                placeholder="Help us understand your query better......"
                className="border-border/60 resize-none min-h-[120px]"
              />
              <FieldError message={errors.description?.message} />
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground font-medium"
              onClick={() => { reset(); onOpenChange(false); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            >
              {isSubmitting ? "Sending..." : "Send"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
