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

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: any) => void;
}

const emptyForm = {
  name: "",
  clientCompanyName: "",
  industry: "",
  email: "",
  phone: "",
  notes: "",
};

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [createClient, { isLoading }] = useCreateClientMutation();

  function handleChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setForm(emptyForm);
    onOpenChange(false);
  }

  async function handleSave() {
    try {
      const result = await createClient(form).unwrap();
      toast.success("Client added successfully.");
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add client");
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
              Client Name
            </Label>
            <Input
              id="client-name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-muted/30 border-border/60 h-12"
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5 ">
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. BuildRight Engineering"
              value={form.clientCompanyName}
              onChange={(e) =>
                handleChange("clientCompanyName", e.target.value)
              }
              className="bg-muted/30 border-border/60 h-12"
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col h-12 gap-1.5 mb-6">
            <Label className="text-sm font-medium">Industry</Label>
            <Select
              value={form.industry}
              onValueChange={(v) => handleChange("industry", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/60 h-12! text-base px-4 w-full py-3">
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
          </div>

          {/* Email + Phone side by side */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="client-email" className="text-sm font-medium">
                Primary Contact Email
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-muted/30 border-border/60 h-12"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="client-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="client-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-muted/30 border-border/60 h-12"
              />
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
