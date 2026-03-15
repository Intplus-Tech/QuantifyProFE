"use client";

import { useEffect } from "react";
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
import { MapPin } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const locationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// ─── Dummy API handlers ───────────────────────────────────────────────────────

async function saveLocation(data: LocationFormValues, isEdit: boolean): Promise<void> {
  // TODO: Replace with real API call
  // isEdit ? await api.patch(`/locations/${id}`, data) : await api.post("/locations", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log(`[API] ${isEdit ? "updateLocation" : "addLocation"} →`, data);
}

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface LocationData {
  name: string;
  address: string;
}

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, modal is in edit mode; otherwise add mode */
  initialData?: LocationData;
  onSaved?: (data: LocationData) => void;
}

export function LocationModal({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: LocationModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: initialData ?? { name: "", address: "" },
  });

  // Sync form when initialData changes (switching between edit targets)
  useEffect(() => {
    reset(initialData ?? { name: "", address: "" });
  }, [initialData, reset]);

  async function onSubmit(data: LocationFormValues) {
    try {
      await saveLocation(data, isEdit);
      toast.success(isEdit ? "Location updated." : "Location added.");
      onSaved?.(data);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save location. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {isEdit ? "Edit Location" : "Add Location"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Location Name
              </Label>
              <Input
                {...register("name")}
                placeholder="e.g. Headquarters"
                className="border-border/60"
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Address
              </Label>
              <Input
                {...register("address")}
                placeholder="e.g. 123 Victoria Island, Lagos"
                className="border-border/60"
              />
              <FieldError message={errors.address?.message} />
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => { reset(); onOpenChange(false); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
