"use client";

import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { useCreateTicketMutation } from "@/store/api/supportApi";

// ─── Schema ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Technical Support",
  "Account & Billing",
  "Feature Request",
  "Automation",
  "Other",
] as const;

const ticketSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  category: z.enum(CATEGORIES, {
    message: "Please select a valid category",
  }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;


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
  const [createTicket] = useCreateTicketMutation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      category: "Technical Support",
      description: "",
    },
  });

  const isSubmitting = isFormSubmitting;

  async function onSubmit(data: TicketFormValues) {
    try {
      await createTicket(data).unwrap();
      toast.success("Support ticket submitted. We'll get back to you within 2 hours.");
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit ticket. Please try again.");
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Subject
                </Label>
                <Input
                  {...register("subject")}
                  placeholder="e.g. Issue with Boq extraction"
                  className="border-border/60"
                />
                <FieldError message={errors.subject?.message} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Category
                </Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full h-10 border-border/60">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.category?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Description
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
