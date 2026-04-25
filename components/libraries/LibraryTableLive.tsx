"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  History,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LibraryItem } from "@/types/library";
import { EditLibraryItemModal } from "./EditLibraryItemModal";
import { PriceHistoryModal } from "./PriceHistoryModal";
import { useDeleteLibraryItemMutation } from "@/store/api/libraryApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LibraryTableLiveProps {
  items: LibraryItem[];
  total: number;
  isFetching: boolean;
  activeLocation: string;
  categoryName: string;
  itemsPerPage?: number;
}

const formatCurrency = (value?: number | null) => {
  if (value == null) return "—";
  return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function LibraryTableLive({
  items,
  total,
  isFetching,
  activeLocation,
  categoryName,
  itemsPerPage = 10,
}: LibraryTableLiveProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editItem, setEditItem] = useState<LibraryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<LibraryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);

  const [deleteItem, { isLoading: isDeleting }] = useDeleteLibraryItemMutation();

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id).unwrap();
      toast.success("Item deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete item");
    }
  };

  return (
    <>
      <Card className={cn("shadow-sm overflow-hidden bg-white border-border/50 transition-opacity", isFetching && "opacity-60")}>
        {isFetching && (
          <div className="flex items-center gap-2 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Updating results...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                  Item Description
                </th>
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                  Unit
                </th>
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                  Base Rate
                </th>
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                  Markup
                </th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-left text-primary bg-primary/5">
                  Final Rate
                </th>
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                  State
                </th>
                <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">
                    No items found{activeLocation ? ` in ${activeLocation}` : ""}. Click "Add New Item" to get started.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-foreground">{item.description}</p>
                      {item.itemCode && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.itemCode}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="text-xs font-medium">{item.unit}</Badge>
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground">
                      {formatCurrency(item.baseRate)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {item.markupPercentage}%
                    </td>
                    <td className="py-4 px-6 font-bold text-primary bg-primary/5">
                      {formatCurrency(item.finalRate)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">
                      {item.state || "—"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                          onClick={() => setHistoryItem(item)}
                          title="View Price History"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => setEditItem(item)}>
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteTarget(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedItems.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-white">
            <p className="text-xs text-muted-foreground">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, items.length)} of {total} items in {categoryName}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    currentPage === page && "bg-primary/10 text-primary border-primary/30 font-bold"
                  )}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <EditLibraryItemModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
      />

      {/* Price History Modal */}
      <PriceHistoryModal
        isOpen={!!historyItem}
        onClose={() => setHistoryItem(null)}
        itemId={historyItem?._id || null}
        itemName={historyItem?.description || ""}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Library Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>"{deleteTarget?.description}"</strong> from the library.
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
              {isDeleting ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
