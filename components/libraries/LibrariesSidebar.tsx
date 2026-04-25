"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FolderOpen,
  Edit2,
  Trash2,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";
import {
  useGetLibraryCategoriesSummaryQuery,
  useDeleteLibraryCategoryMutation,
} from "@/store/api/libraryApi";
import { AddLibraryCategoryModal } from "./AddLibraryCategoryModal";
import { EditLibraryCategoryModal } from "./EditLibraryCategoryModal";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { LibraryCategory } from "@/types/library";

interface LibrariesSidebarProps {
  basePath: string;
}

function DynamicIcon({ name }: { name?: string }) {
  if (!name) return <LucideIcons.Layers className="w-4 h-4" />;
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return <LucideIcons.Layers className="w-4 h-4" />;
  return <Icon className="w-4 h-4" />;
}

export function LibrariesSidebar({ basePath }: LibrariesSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<LibraryCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryCategory | null>(null);

  const { data, isLoading } = useGetLibraryCategoriesSummaryQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteLibraryCategoryMutation();

  const categories = data?.data || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget._id).unwrap();
      toast.success("Category deleted successfully");
      
      // If the deleted category was active, redirect to the first available category
      if (pathname.includes(deleteTarget._id)) {
        const remaining = categories.filter(c => c._id !== deleteTarget._id);
        if (remaining.length > 0) {
          router.replace(`${basePath}/${remaining[0]._id}`);
        } else {
          router.replace(basePath);
        }
      }
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  return (
    <>
      <Card className="w-full md:w-64 shrink-0 shadow-sm border-border/50 bg-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground text-sm">Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Filter by resource type</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setAddModalOpen(true)}
            title="New Category"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Category list */}
        <nav className="p-2">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                  <Skeleton className="w-6 h-4 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-3">
                <FolderOpen className="w-5 h-5 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No categories yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create your first category to organise your library items.
              </p>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground gap-1.5 h-8 text-xs"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                New Category
              </Button>
            </div>
          ) : (
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const isActive =
                  pathname.includes(`/${cat._id}`) ||
                  pathname.toLowerCase().includes(`/${cat.name.toLowerCase()}`);
                return (
                  <div
                    key={cat._id}
                    className={`group relative flex items-center justify-between rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Link
                      href={`${basePath}/${cat._id}`}
                      className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium min-w-0"
                    >
                      <DynamicIcon name={cat.icon} />
                      <span className="truncate">{cat.name}</span>
                    </Link>

                    <div className="flex items-center gap-1.5 pr-2">
                      <span
                        className={`text-xs tabular-nums group-hover:hidden ${
                          isActive ? "text-orange-500" : "text-muted-foreground/60"
                        }`}
                      >
                        {cat.itemCount ?? 0}
                      </span>

                      {/* Actions Dropdown on Hover - use opacity instead of hidden for better Radix anchoring */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="right" className="w-32">
                            <DropdownMenuItem onClick={() => setEditCategory(cat)}>
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(cat)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Always-visible add button at the bottom */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors border border-dashed border-border/50 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs font-medium">New Category</span>
              </button>
            </div>
          )}
        </nav>
      </Card>

      <AddLibraryCategoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <EditLibraryCategoryModal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        category={editCategory}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the <strong>"{deleteTarget?.name}"</strong> category and all its associated rates.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
