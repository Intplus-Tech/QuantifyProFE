"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { LibraryCategoryData, LibraryItem } from "./types";

interface LibraryTableProps {
  categoryData: LibraryCategoryData;
  items: LibraryItem[];
  activeLocation: string;
  itemsPerPage?: number;
}

export function LibraryTable({
  categoryData,
  items,
  activeLocation,
  itemsPerPage = 5,
}: LibraryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the category or location changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryData, activeLocation]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Card className="shadow-sm overflow-hidden bg-white border-border/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                Item Description
              </th>
              <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left">
                Unit
              </th>
              {categoryData.columns.map((col) => (
                <th
                  key={col.label}
                  className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-left"
                >
                  {col.label}
                </th>
              ))}
              <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-left text-orange-500 bg-orange-50/50">
                Final Rate
              </th>
              <th className="py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="py-4 px-6">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </td>
                <td className="py-4 px-6 font-medium text-foreground">
                  {item.unit}
                </td>
                {categoryData.columns.map((col) => (
                  <td
                    key={col.label}
                    className="py-4 px-6 font-medium text-foreground"
                  >
                    {col.render(item)}
                  </td>
                ))}
                <td className="py-4 px-6 font-bold text-orange-500 bg-orange-50/50">
                  {item.final}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-white">
        <p className="text-xs text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1}–
          {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}{" "}
          items in {categoryData.title.replace(" Rate", "")} Category
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
              className={`h-8 w-8 p-0 text-xs ${
                currentPage === page
                  ? "bg-orange-50 text-orange-600 border-orange-200 font-bold"
                  : ""
              }`}
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
    </Card>
  );
}
