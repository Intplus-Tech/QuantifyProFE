"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useGetLibraryItemPriceHistoryQuery } from "@/store/api/libraryApi";
import { format } from "date-fns";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemName: string;
}

const formatCurrency = (value?: number | null) => {
  if (value == null) return "—";
  return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function PriceHistoryModal({
  isOpen,
  onClose,
  itemId,
  itemName,
}: PriceHistoryModalProps) {
  const { data, isLoading, error } = useGetLibraryItemPriceHistoryQuery(
    { itemId: itemId || "" },
    { skip: !itemId || !isOpen }
  );

  const history = data?.data?.history || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Price History
            <span className="text-muted-foreground font-normal text-sm">— {itemName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground">Fetching price logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive text-sm">
              Failed to load price history. Please try again.
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No price changes recorded for this item yet.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs uppercase font-bold">Date</TableHead>
                    <TableHead className="text-xs uppercase font-bold">Base Rate</TableHead>
                    <TableHead className="text-xs uppercase font-bold">Markup</TableHead>
                    <TableHead className="text-xs uppercase font-bold text-right">Final Rate</TableHead>
                    <TableHead className="text-xs uppercase font-bold text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, index) => {
                    const prevEntry = history[index + 1];
                    const diff = prevEntry ? entry.finalRate - prevEntry.finalRate : 0;
                    
                    return (
                      <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-medium">
                          {format(new Date(entry.changedAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatCurrency(entry.baseRate)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.markupPercentage}%
                        </TableCell>
                        <TableCell className="text-xs font-bold text-right">
                          {formatCurrency(entry.finalRate)}
                        </TableCell>
                        <TableCell className="text-center">
                          {index === history.length - 1 ? (
                            <Minus className="w-4 h-4 mx-auto text-slate-300" />
                          ) : diff > 0 ? (
                            <TrendingUp className="w-4 h-4 mx-auto text-destructive" />
                          ) : diff < 0 ? (
                            <TrendingDown className="w-4 h-4 mx-auto text-emerald-500" />
                          ) : (
                            <Minus className="w-4 h-4 mx-auto text-slate-300" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
