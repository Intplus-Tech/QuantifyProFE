import { BoqReportPreview } from "@/types/projects";
import {
  BOQReport,
  BOQSection,
  CostCategory,
  ResourceAllocation,
} from "./types";

const CATEGORY_COLORS = [
  "bg-amber-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-slate-500",
];

export function mapApiToUiReport(data: BoqReportPreview): BOQReport {
  const dateFormatted = new Date(data.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const costCategories: CostCategory[] =
    data.executiveSummary.costDistribution.map((dist, idx) => ({
      name: dist.sectionName,
      value: dist.amount,
      percentage: dist.percentage,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

  const res = data.executiveSummary.resourceAllocation;
  const resourceAllocations: ResourceAllocation[] = [
    { label: "Labour", percentage: res?.labour, color: "bg-blue-500" },
    { label: "Material", percentage: res?.material, color: "bg-emerald-500" },
    { label: "Machinery", percentage: res?.machinery, color: "bg-amber-500" },
  ];

  const sections: BOQSection[] = data.sections.map((sec, idx) => ({
    id: `sec-${idx}`,
    title: `${idx + 1}.0 - ${sec.sectionName}`,
    subtotal: sec.subtotal,
    items: sec.rows.map((row, rowIdx) => ({
      item: row.itemCode || `${idx + 1}.${idx + rowIdx}`,
      description: row.description,
      unit: row.unit || "-",
      qty: row.quantity || 0,
      rate: row.rate || 0,
      total: row.amount || 0,
    })),
  }));

  return {
    meta: {
      companyName: data.company?.name || "QuantifyPro Analysis",
      companySubtitle: data.company?.address || "Intelligent Quantity Surveying",
      dateGenerated: dateFormatted,
      ref: data.referenceNumber,
      location: data.project.projectLocation,
      reportTitle: data.project.name,
      reportSubtitle: data.project.description,
    },
    sections,
    costCategories,
    resourceAllocations,
    grandTotal: data.executiveSummary.grandTotal,
    terms: [data.termsAndNotes],
  };
}
