"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BoqDocumentSection } from "@/types/boqDocument";
import type { PendingDelete } from "./useBoqDocumentActions";

/**
 * Deleting a section removes every item priced under it, so it is confirmed
 * rather than done on a single click of a hover menu.
 */
export function BoqDeleteDialog({
  pending,
  deleting,
  onCancel,
  onConfirm,
}: {
  pending: PendingDelete | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isSection = pending?.kind === "section";
  const itemCount = isSection
    ? pending.section.rows.filter((row) => row.rowType === "item").length
    : 0;

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSection ? "Delete this whole section?" : "Delete this item?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSection ? (
              <>
                <span className="font-medium text-slate-700">
                  {pending.section.sectionCode
                    ? `${pending.section.sectionCode}: ${pending.section.title}`
                    : pending.section.title}
                </span>{" "}
                and the {itemCount} item{itemCount === 1 ? "" : "s"} priced under
                it will be removed from the bill. The totals above it will move.
              </>
            ) : (
              <>
                <span className="font-medium text-slate-700">
                  {pending?.kind === "row"
                    ? pending.row.description.slice(0, 120)
                    : ""}
                </span>{" "}
                will be removed and every total above it recalculated.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              // Keep the dialog up while the request is in flight, so a
              // failure is reported against something still on screen.
              event.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? "Deleting…" : isSection ? "Delete section" : "Delete item"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Rename a section's heading — written to its first row's lead-in. */
export function BoqSectionRenameDialog({
  section,
  saving,
  onCancel,
  onSubmit,
}: {
  section: BoqDocumentSection | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (title: string) => void;
}) {
  return (
    <Dialog open={!!section} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        {section && (
          // Keyed on the section so opening a different one starts from its
          // own title, without an effect copying props into state.
          <RenameForm
            key={section.sectionId}
            section={section}
            saving={saving}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({
  section,
  saving,
  onCancel,
  onSubmit,
}: {
  section: BoqDocumentSection;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (title: string) => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[15px]">
          {section.sectionCode ? `Edit ${section.sectionCode}` : "Edit section"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-1.5 py-2">
        <Label className="text-[11px] font-medium text-slate-600">
          Section title
        </Label>
        <Input
          value={title}
          maxLength={200}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && title.trim()) onSubmit(title.trim());
          }}
          className="h-9 text-[12px]"
        />
        <p className="text-[10px] leading-relaxed text-slate-400">
          The SMM work-section code stays as it is. To change a single item&apos;s
          wording, use the actions on that row instead.
        </p>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-9 bg-amber-500 hover:bg-amber-600"
          disabled={saving || !title.trim()}
          onClick={() => onSubmit(title.trim())}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
