"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveSetupModalProps {
  open: boolean;
  onCancel: () => void;
  onProceed: () => void;
}

export function SaveSetupModal({ open, onCancel, onProceed }: SaveSetupModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Save className="w-4.5 h-4.5 text-primary" />
            </div>
            <DialogTitle className="text-base font-semibold">Save Setup</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Your setup has been successfully saved to the system.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Would you like to proceed to the workspace to begin working on your project?
          You can always return to these settings later.
        </p>

        <DialogFooter className="gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onProceed} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Proceed to Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
