"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateClientMutation } from "@/store/api/clientsApi";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Client } from "@/types/clients";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

const emptyForm = {
  name: "",
  clientCompanyName: "",
  industry: "",
  email: "",
  phone: "",
  notes: "",
};

const emptyErrors: Record<keyof typeof emptyForm, string> = {
  name: "",
  clientCompanyName: "",
  industry: "",
  email: "",
  phone: "",
  notes: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function AddClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddClientDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyErrors);
  const [createClient, { isLoading }] = useCreateClientMutation();

  function handleChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleClose() {
    setForm(emptyForm);
    setErrors(emptyErrors);
    onOpenChange(false);
  }

  function validate() {
    const next = { ...emptyErrors };
    if (!form.name.trim()) next.name = "Client name is required";
    if (!form.clientCompanyName.trim())
      next.clientCompanyName = "Company name is required";
    if (!form.industry.trim()) next.industry = "Industry is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email.trim()))
      next.email = "Enter a valid email address";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    setErrors(next);
    return Object.values(next).every((msg) => !msg);
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      const result = await createClient(form).unwrap();
      toast.success("Client added successfully.");
      onSuccess?.(result?.data);
      handleClose();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to add client";
      toast.error(message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-xl! gap-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add New Client
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-name" className="text-sm font-medium">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client-name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              aria-invalid={!!errors.name}
              className="bg-muted/30 border-border/60 h-12"
            />
            <FieldError message={errors.name} />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5 ">
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. BuildRight Engineering"
              value={form.clientCompanyName}
              onChange={(e) =>
                handleChange("clientCompanyName", e.target.value)
              }
              aria-invalid={!!errors.clientCompanyName}
              className="bg-muted/30 border-border/60 h-12"
            />
            <FieldError message={errors.clientCompanyName} />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-1.5 mb-6">
            <Label className="text-sm font-medium">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.industry}
              onValueChange={(v) => handleChange("industry", v)}
            >
              <SelectTrigger
                aria-invalid={!!errors.industry}
                className="bg-muted/30 border-border/60 h-12! text-base px-4 w-full py-3"
              >
                <SelectValue
                  placeholder="Select Industry"
                  className="text-sm"
                />
              </SelectTrigger>

              <SelectContent className="">
                <SelectItem value="Infrastructure" className="text-base py-3">
                  Infrastructure
                </SelectItem>
                <SelectItem value="Residential" className="text-base py-3">
                  Residential
                </SelectItem>
                <SelectItem value="Public Works" className="text-base py-3">
                  Public Works
                </SelectItem>
                <SelectItem value="Commercial" className="text-base py-3">
                  Commercial
                </SelectItem>
                <SelectItem value="Industrial" className="text-base py-3">
                  Industrial
                </SelectItem>
                <SelectItem value="Healthcare" className="text-base py-3">
                  Healthcare
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={errors.industry} />
          </div>

          {/* Email + Phone side by side */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="client-email" className="text-sm font-medium">
                Primary Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                className="bg-muted/30 border-border/60 h-12"
              />
              <FieldError message={errors.email} />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="client-phone" className="text-sm font-medium">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                className="bg-muted/30 border-border/60 h-12"
              />
              <FieldError message={errors.phone} />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="client-notes"
              placeholder="Optional notes about the client..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="bg-muted/30 border-border/60 min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-4"
            disabled={isLoading}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="h-12 px-4"
            disabled={isLoading}
            onClick={handleSave}
          >
            {isLoading ? "Saving..." : "Save Client"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
