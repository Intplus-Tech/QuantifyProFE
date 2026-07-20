import type { BoqRow, Project, Section } from "@/types/projects";
import type {
  BOQBill,
  BOQDocument,
  BOQItem,
  SubsectionAccent,
  SummaryRow,
} from "./types";

const ACCENT_CYCLE: SubsectionAccent[] = ["amber", "blue", "green", "orange"];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatDate(iso)}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function slug(value: string, index: number): string {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base ? `${base}-${index}` : `section-${index}`;
}

/**
 * The excel_boq_v1 template carries a `rows` array (header / item / note).
 * Older payloads only have `workItems`, so fall back to those.
 */
function rowsFromSection(section: Section): BoqRow[] {
  if (section.rows?.length) return section.rows;

  return (section.workItems ?? []).map((workItem) => ({
    rowType: "item" as const,
    itemCode: null,
    description: workItem.item,
    specification: workItem.specification ?? null,
    unit: workItem.unit ?? null,
    quantity: workItem.quantity ?? null,
    rate: null,
    amount: null,
    notes: workItem.notes ?? null,
  }));
}

function toItems(section: Section, sectionIndex: number): BOQItem[] {
  return rowsFromSection(section)
    .filter((row) => row.rowType !== "header")
    .map((row, rowIndex) => ({
      id: `${slug(section.sectionName, sectionIndex)}-${rowIndex}`,
      ref: row.itemCode ?? "",
      description: row.description,
      kind: row.rowType === "note" ? ("note" as const) : ("item" as const),
      qty: row.quantity,
      unit: row.unit,
      rate: row.rate,
      lumpSum: row.amount ?? undefined,
      measurementMethod: row.unit ? `Measured in ${row.unit}` : "Lump Sum",
      notes: row.notes ?? undefined,
    }));
}

/** The `header` row carries the section's display title; fall back to its name. */
function subsectionTitle(section: Section): string {
  const header = section.rows?.find((row) => row.rowType === "header");
  return (header?.description ?? section.sectionName).toUpperCase();
}

/**
 * Mapped BOQs use the compact layout: Ref / Item Description / Total.
 * Quantity and unit stay on the item — they render as a sub-line under the
 * description and remain editable in the drawer.
 */
function columnsFor(_section: Section): "full" | "amount-only" {
  return "amount-only";
}

export function mapProjectToBoqDocument(project: Project): BOQDocument {
  const boq = project.boqResult;
  const sections = boq?.sections ?? [];

  const bills: BOQBill[] = sections.map((section, index) => ({
    id: slug(section.sectionName, index),
    code: `BILL NO. ${index + 1}`,
    title: section.sectionName.toUpperCase(),
    pageLabel: "",
    subsections: [
      {
        id: `${slug(section.sectionName, index)}-sub`,
        code: `${index + 1}`,
        title: subsectionTitle(section),
        accent: ACCENT_CYCLE[index % ACCENT_CYCLE.length],
        columns: columnsFor(section),
        items: toItems(section, index),
      },
    ],
  }));

  const summaryRows: SummaryRow[] = bills.map((bill, index) => ({
    billNo: `${index + 1}`,
    description: sections[index].sectionName,
    billId: bill.id,
  }));

  const contingencyRate =
    typeof project.metricsConfig?.contingency === "number"
      ? project.metricsConfig.contingency / 100
      : 0.05;

  return {
    title: `Bill of Quantities — ${boq?.projectTitle ?? project.name}`,
    subtitle: project.projectLocation ?? project.description ?? "",

    projectInfo: {
      client: project.clientName ?? "—",
      location: project.projectLocation ?? "—",
      // No preparer field on the payload — AI-sourced BOQs are attributed as such.
      preparedBy: project.processingMode === "ai" ? "QuantifyPro AI" : "—",
      date: formatDate(project.createdAt),
    },

    bills,
    summaryRows,

    externalWorks: 0,
    contingencyRate,
    vatRate: 0.075,
    // Real payloads have no preliminaries bill — nothing is split out of the sub-total.
    preliminariesBillNo: undefined,

    generalNotes: boq?.generalNotes,

    meta: {
      lastEdited: formatDateTime(project.updatedAt),
      version: boq?.templateVersion ?? "1.0",
      ref: project.projectCode ?? project._id,
      firm: project.clientName ?? "—",
    },
  };
}
