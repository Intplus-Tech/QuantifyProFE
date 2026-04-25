"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateLibraryItemMutation,
  useGetLibraryUnitsQuery,
  useGetLibraryLocationsQuery,
} from "@/store/api/libraryApi";
import { NIGERIA_STATES } from "@/utils/constants/nigeria-states";

interface AddLibraryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export function AddLibraryItemModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
}: AddLibraryItemModalProps) {
  const [form, setForm] = useState({
    description: "",
    unit: "",
    baseRate: "",
    markupPercentage: "15",
    state: "Lagos",
    country: "Nigeria",
    machinery: "0",
    labour: "0",
    material: "0",
  });

  const { data: unitsData } = useGetLibraryUnitsQuery();
  const { data: locationsData } = useGetLibraryLocationsQuery();
  const [createItem, { isLoading }] = useCreateLibraryItemMutation();

  const units = unitsData?.data || [];
  const locations = locationsData?.data || [];

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.description || !form.unit || !form.baseRate || !form.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createItem({
        categoryId,
        description: form.description,
        unit: form.unit,
        baseRate: parseFloat(form.baseRate),
        markupPercentage: parseFloat(form.markupPercentage),
        state: form.state,
        country: form.country,
        breakdown: {
          machinery: parseFloat(form.machinery),
          labour: parseFloat(form.labour),
          material: parseFloat(form.material),
        },
      }).unwrap();

      toast.success("Library item created successfully");
      setForm({ description: "", unit: "", baseRate: "", markupPercentage: "15", state: "", country: "Nigeria", machinery: "0", labour: "0", material: "0" });
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create item");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Item to {categoryName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. Bulk Excavation"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Unit <span className="text-destructive">*</span></Label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger className="h-11!">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Location / State <span className="text-destructive">*</span></Label>
              <Select value={form.state} onValueChange={(v) => set("state", v)}>
                <SelectTrigger className="h-11!">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIA_STATES.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Base Rate (₦) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                placeholder="e.g. 4500"
                value={form.baseRate}
                onChange={(e) => set("baseRate", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Markup (%)</Label>
              <Input
                type="number"
                placeholder="e.g. 15"
                value={form.markupPercentage}
                onChange={(e) => set("markupPercentage", e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Breakdown (₦)</p>
            <div className="grid grid-cols-3 gap-3">
              {(["machinery", "labour", "material"] as const).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label className="capitalize text-xs">{field}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    className="h-11"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground min-w-[100px]">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
