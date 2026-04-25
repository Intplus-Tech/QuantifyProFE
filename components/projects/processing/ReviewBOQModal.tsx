"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useUpdatePdfBoqJobMutation,
  useUpdateMultiBoqJobMutation,
  useUpdateBimJobMutation,
} from "@/store/api/projectsApi";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Target,
  Layers,
  Save,
  Download,
  Check,
  X,
  Plus,
  Calculator,
  Ruler,
  Edit2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkItem {
  rowType?: "header" | "item";
  itemCode: string | null;
  item: string;
  specification: string | null;
  quantity: number | null;
  unit: string | null;
  rate: number | null;
  total: number | null;
  notes: string | null;
}

interface BoqSection {
  sectionName: string;
  workItems: WorkItem[];
}

interface BoqData {
  projectTitle: string;
  templateVersion: string;
  generalNotes: string;
  sections: BoqSection[];
}

interface ReviewBOQModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onCreateProject?: (updatedResult: any) => void;
  isCreatingProject?: boolean;
  previewBoq?: () => void;
  jobType?: string;
}

const BOQRowItem = memo(
  ({
    row,
    sIdx,
    rIdx,
    onUpdateRow,
    formatCurrency,
  }: {
    row: WorkItem;
    sIdx: number;
    rIdx: number;
    onUpdateRow: (
      sectionIndex: number,
      rowIndex: number,
      field: keyof WorkItem,
      value: any,
    ) => void;
    formatCurrency: (value: number | null) => string;
  }) => {
    if (row.rowType === "header") return null;

    return (
      <TableRow className="group border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
        <TableCell className="font-medium text-slate-500 text-xs">
          {row.itemCode || `A${rIdx}`}
        </TableCell>
        <TableCell className="font-medium text-slate-500 text-xs">
          {row.itemCode || `A${rIdx}`}
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {row.item}
            </p>
            {row.notes && (
              <div className="flex gap-2">
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  📝 Notes: {row.notes}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-12 text-[11px] font-bold px-4 gap-1.5 border-slate-200"
              >
                <Ruler className="w-4 h-4" />
                Edit Dimensions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-12 text-[11px] font-bold px-4 gap-1.5 border-slate-200"
              >
                <Eye className="w-4 h-4" />
                View Calc
              </Button>
              {!row.quantity &&
                row.item.toLowerCase().includes("mortar") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 text-[11px] font-bold px-4 gap-1.5 border-slate-200"
                  >
                    <Calculator className="w-4 h-4" />
                    Calculate Quantity
                  </Button>
                )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Select
            defaultValue={row.specification || "default"}
            onValueChange={(val) =>
              onUpdateRow(sIdx, rIdx, "specification", val)
            }
          >
            <SelectTrigger className="h-9 text-xs border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium">
              <SelectValue placeholder="Specification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-xs">
                {row.specification || "Standard Spec"}
              </SelectItem>
              <SelectItem value="cement-sand-1-6" className="text-xs">
                Cement: Sand 1:6
              </SelectItem>
              <SelectItem value="mix-ratio-1-4" className="text-xs">
                Mix Ratio 1:4
              </SelectItem>
              <SelectItem value="grade-c25-30" className="text-xs">
                Grade C25/30
              </SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-right">
          <Input
            type="number"
            value={row.quantity || ""}
            onChange={(e) =>
              onUpdateRow(sIdx, rIdx, "quantity", Number(e.target.value))
            }
            className="h-9 w-20 ml-auto text-right text-xs border-transparent focus-visible:border-slate-200 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
            placeholder="-"
          />
        </TableCell>
        <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-xs">
          {row.unit || "-"}
        </TableCell>
        <TableCell className="text-right">
          <div className="relative group/input flex items-center justify-end">
            <Input
              type="number"
              value={row.rate || ""}
              onChange={(e) =>
                onUpdateRow(sIdx, rIdx, "rate", Number(e.target.value))
              }
              className="h-9 w-28 text-right text-xs border-emerald-100 bg-emerald-50/20 dark:bg-emerald-900/5 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold focus-visible:ring-emerald-500"
              placeholder="0.00"
            />
          </div>
        </TableCell>
        <TableCell className="text-right font-bold text-slate-600 dark:text-slate-400 text-xs">
          {formatCurrency(row.total)}
        </TableCell>
      </TableRow>
    );
  },
);

BOQRowItem.displayName = "BOQRowItem";

export function ReviewBOQModal({
  isOpen,
  onClose,
  data,
  onCreateProject,
  isCreatingProject,
  previewBoq,
  jobType,
}: ReviewBOQModalProps) {
  const [sections, setSections] = useState<BoqSection[]>([]);
  const boqResult = data?.result as BoqData;

  useEffect(() => {
    if (boqResult?.sections) {
      const initialSections = boqResult.sections.map((section: any) => ({
        ...section,
        workItems: (section.workItems || section.rows || []).map((row: any) => ({
          ...row,
          item: row.item || row.description,
          total:
            row.total ||
            row.amount ||
            (row.quantity && row.rate ? row.quantity * row.rate : null),
        })),
      }));
      setSections(initialSections);
    }
  }, [boqResult]);

  const [updatePdfBoq, { isLoading: isPdfUpdating }] =
    useUpdatePdfBoqJobMutation();
  const [updateMultiBoq, { isLoading: isMultiUpdating }] =
    useUpdateMultiBoqJobMutation();
  const [updateBimBoq, { isLoading: isBimUpdating }] =
    useUpdateBimJobMutation();

  const isUpdating = isPdfUpdating || isMultiUpdating || isBimUpdating;

  const handleUpdateRow = useCallback(
    (
      sectionIndex: number,
      rowIndex: number,
      field: keyof WorkItem,
      value: any,
    ) => {
      setSections((prev) => {
        const updatedSections = [...prev];
        const section = { ...updatedSections[sectionIndex] };
        const workItems = [...section.workItems];
        const row = { ...workItems[rowIndex] };

        // Update the field
        (row as any)[field] = value;

        // Auto-calculate total if quantity or rate changes
        if (field === "quantity" || field === "rate") {
          const q = field === "quantity" ? Number(value) : row.quantity;
          const r = field === "rate" ? Number(value) : row.rate;
          row.total = q && r ? q * r : null;
        }

        workItems[rowIndex] = row;
        section.workItems = workItems;
        updatedSections[sectionIndex] = section;
        return updatedSections;
      });
    },
    [],
  );

  const handleAcceptAll = async () => {
    try {
      let response;
      
      if (jobType === "multi") {
        const body = {
          result: {
            ...boqResult,
            sections: sections
          }
        };
        response = await updateMultiBoq({
          jobId: data._id,
          body: body as any,
        }).unwrap();
      } else if (jobType === "bim") {
        // BIM remains with top-level sections for now if that's the standard
        response = await updateBimBoq({
          jobId: data._id,
          body: { sections: sections } as any,
        }).unwrap();
      } else {
        // PDF with top-level sections
        response = await updatePdfBoq({
          jobId: data._id,
          body: { sections: sections } as any,
        }).unwrap();
      }

      toast.success(response?.message || "BOQ updated successfully");
    } catch (error: any) {
      console.error("Failed to update BOQ:", error);
      toast.error(error?.data?.message || "Failed to update BOQ");
    }
  };

  const formatCurrency = useCallback((value: number | null) => {
    if (value === null || isNaN(value)) return "-";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("NGN", "₦");
  }, []);

  if (!data) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-[90vw]! w-full max-h-[95vh]! h-full overflow-y-auto p-0 gap-0 flex flex-col border-none bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md">
        {/* Top Header Section */}
        <div className="p-6 bg-white border-b relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              AI EXTRACTION PREVIEW
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-400" />
            <div className="grid grid-cols-1 md:grid-cols-12 divide-x divide-slate-100">
              {/* Column 1: Document Details */}
              <div className="md:col-span-3 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-muted-foreground">Document:</span>
                  <span className="font-bold text-slate-900 truncate">
                    {boqResult?.projectTitle || "N/A"}
                  </span>

                  <span className="text-muted-foreground mt-1">Status:</span>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] uppercase h-6"
                    >
                      EXTRACTION COMPLETED
                    </Badge>
                  </div>

                  <span className="text-muted-foreground mt-1">
                    Confidence:
                  </span>
                  <span className="font-bold text-emerald-500 mt-1">87%</span>

                  <span className="text-muted-foreground mt-1">
                    Processing Time:
                  </span>
                  <span className="font-medium text-slate-700 mt-1">
                    2.3 seconds
                  </span>
                </div>
              </div>

              {/* Column 2: AI Extraction Summary */}
              <div className="md:col-span-4 p-6">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white stroke-[4px]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      AI EXTRACTION SUMMARY
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-800">
                        Extraction completed successfully
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-60" />
                        Source: {boqResult?.projectTitle} (Option 1)
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        📝 General Notes: {boqResult?.generalNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: AI Assumptions & Notes */}
              <div className="md:col-span-5 p-6">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                      AI ASSUMPTIONS & NOTES
                    </h3>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        Wall thickness assumed as 225mm for load-bearing walls
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        Floor slab thickness assumed as 150mm
                      </li>
                      <li className="flex items-start gap-3 text-rose-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        No structural details or reinforcement schedules visible
                      </li>
                      <li className="flex items-start gap-3 text-rose-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        Ground floor, foundation works not included in this plan
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        Height assumed as 3.0m for wall calculations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Actions Bar */}
        <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 h-12 shadow-sm border border-emerald-600/20"
              onClick={handleAcceptAll}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4 mr-2" />
              {isUpdating ? "Updating..." : "Update BOQ"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onClose()}
              className="text-rose-500 border-rose-200 bg-white hover:bg-rose-50 hover:text-rose-600 h-12 px-6 rounded-lg"
            >
              <X className="w-4 h-4 mr-2" />
              Reject All
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-200 h-12 px-6 rounded-lg gap-2 text-slate-700"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 h-12 px-6 rounded-lg gap-2 text-slate-700"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white h-12 px-6 rounded-lg gap-2 shadow-sm border border-amber-600/20"
              onClick={() => {
                const updatedResult = {
                  ...boqResult,
                  sections: sections
                };
                onCreateProject?.(updatedResult);
              }}
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
                "Generating..."
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate BOQ
                </>
              )}
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white h-12 px-6 rounded-lg gap-2 shadow-sm border border-amber-600/20"
              onClick={() => {
                onClose();
                previewBoq?.();
              }}
            >
              <>
                <Plus className="w-4 h-4" />
                Preview BOQ
              </>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6 bg-white">
          <div className="space-y-8 pb-10">
            {sections.map((section, sIdx) => {
              const sectionTotal = section.workItems.reduce(
                (sum, row) => sum + (row.total || 0),
                0,
              );

              return (
                <div key={sIdx} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {section.sectionName.toUpperCase()} -{" "}
                      {section.workItems[0]?.item.toUpperCase() || ""}
                    </h3>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow className="hover:bg-transparent border-slate-200">
                        <TableHead className="w-[60px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px]">
                          ID
                        </TableHead>
                        <TableHead className="w-[100px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px]">
                          Item Code
                        </TableHead>
                        <TableHead className="min-w-[300px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px]">
                          Item
                        </TableHead>
                        <TableHead className="w-[180px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px]">
                          Specification
                        </TableHead>
                        <TableHead className="w-[100px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] text-right">
                          Quantity
                        </TableHead>
                        <TableHead className="w-[60px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px]">
                          Unit
                        </TableHead>
                        <TableHead className="w-[120px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] text-right">
                          Rate (₦)
                        </TableHead>
                        <TableHead className="w-[150px] font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] text-right">
                          Total (₦)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.workItems.map((row, rIdx) => (
                        <BOQRowItem
                          key={`${sIdx}-${rIdx}`}
                          row={row}
                          sIdx={sIdx}
                          rIdx={rIdx}
                          onUpdateRow={handleUpdateRow}
                          formatCurrency={formatCurrency}
                        />
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                        Total {section.sectionName} Volume:
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {section.workItems
                          .reduce((sum, r) => sum + (r.quantity || 0), 0)
                          .toFixed(2)}{" "}
                        m³
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                        Estimated Cost:
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(sectionTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </AlertDialogContent>
    </AlertDialog>
  );
}
