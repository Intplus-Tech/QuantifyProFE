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

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  name: "",
  company: "",
  industry: "",
  email: "",
  phone: "",
};

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const [form, setForm] = useState(emptyForm);

  function handleChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setForm(emptyForm);
    onOpenChange(false);
  }

  function handleSave() {
    // TODO: wire to API
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md gap-6">
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
              className="bg-muted/30 border-border/60"
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. BuildRight Engineering"
              value={form.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className="bg-muted/30 border-border/60"
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Industry</Label>
            <Select
              value={form.industry}
              onValueChange={(v) => handleChange("industry", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/60">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Public Works">Public Works</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
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
                className="bg-muted/30 border-border/60"
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
                className="bg-muted/30 border-border/60"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" size="lg" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSave}>
            Save Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
