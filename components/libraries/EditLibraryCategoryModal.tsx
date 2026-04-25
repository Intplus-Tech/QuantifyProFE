"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateLibraryCategoryMutation } from "@/store/api/libraryApi";
import { LibraryCategory } from "@/types/library";

const ICON_OPTIONS = [
  { value: "Box", label: "📦 Box (Concrete)" },
  { value: "Mountain", label: "⛰️ Mountain (Earthworks)" },
  { value: "Hammer", label: "🔨 Hammer (Steel)" },
  { value: "Users", label: "👷 Users (Labour)" },
  { value: "LayoutGrid", label: "🧱 Grid (Masonry)" },
  { value: "Wrench", label: "🔧 Wrench (Carpentry)" },
  { value: "Zap", label: "⚡ Zap (MEP)" },
  { value: "Layers", label: "🗂️ Layers (General)" },
  { value: "Truck", label: "🚚 Truck (Haulage)" },
  { value: "TreePine", label: "🌲 Tree (Landscaping)" },
];

interface EditLibraryCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: LibraryCategory | null;
}

export function EditLibraryCategoryModal({
  isOpen,
  onClose,
  category,
}: EditLibraryCategoryModalProps) {
  const [form, setForm] = useState({
    name: "",
    icon: "Layers",
    description: "",
  });

  const [updateCategory, { isLoading }] = useUpdateLibraryCategoryMutation();

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        icon: category.icon || "Layers",
        description: category.description || "",
      });
    }
  }, [category]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!category) return;
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateCategory({
        categoryId: category._id,
        body: {
          name: form.name.trim(),
          icon: form.icon,
          description: form.description.trim() || undefined,
        },
      }).unwrap();

      toast.success(`Category updated successfully`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-cat-name">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-cat-name"
              placeholder="e.g. Steel Works"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
              <SelectTrigger className="h-11!">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-cat-desc">Description</Label>
            <Textarea
              id="edit-cat-desc"
              placeholder="Brief description..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim() || isLoading}
            className="bg-primary text-primary-foreground min-w-[120px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
