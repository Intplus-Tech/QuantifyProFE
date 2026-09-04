import { computeElementQuantities } from "./calc";
import { MEASURE_TYPES } from "./mock-data";
import type {
  BoqLineItem,
  BoqSection,
  ConcreteScheduleRow,
  ExtractedGroup,
  FormworkMaterialRow,
  GlobalParameters,
  RebarScheduleRow,
} from "./types";

/**
 * Builds the report tables from the elements the AI actually detected, so the
 * Bill of Quantity, Material Schedule and Formwork Schedule describe the
 * uploaded drawing rather than the seeded sample.
 *
 * What the AI cannot give us:
 *   - Bar marks, sizes and cut lengths. The API returns geometry and legible
 *     attributes only; reinforcement detail lives in sections and schedules
 *     that a plan view does not carry. The Bar Bending Schedule therefore
 *     stays user-entered — see deriveBbsGroups.
 *   - A concrete grade per element. C25/C30 below are the conventional
 *     defaults for substructure/superstructure and are editable in the table.
 */

const DEFAULT_CONCRETE_WASTAGE_PCT = 2;
const DEFAULT_REBAR_WASTAGE_PCT = 3;

const measureLabel = (measureTypeId: string) =>
  MEASURE_TYPES.find((m) => m.id === measureTypeId)?.label ?? measureTypeId;

const measureGroup = (measureTypeId: string) =>
  MEASURE_TYPES.find((m) => m.id === measureTypeId)?.group ?? "superstructure";

const titleCase = (label: string) =>
  label
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\./g, "");

interface GroupTotals {
  measureTypeId: string;
  /** members, not detection rows — one pile legend row can be 130 piles */
  qty: number;
  concrete: number;
  rebar: number;
  formwork: number;
  excavation: number;
  blinding: number;
}

/** Sum each measure type's live elements, skipping anything rejected. */
function totalsByMeasure(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): GroupTotals[] {
  const byMeasure = new Map<string, GroupTotals>();

  for (const group of groups) {
    for (const element of group.elements) {
      if (element.status === "rejected") continue;

      const q = computeElementQuantities(
        element.dimensions,
        params,
        element.measureTypeId,
      );
      // computeElementQuantities returns ONE member's figures; the row may
      // stand for many. Summing without this gave a BOQ for a single pile.
      const members = element.quantity || 1;

      const existing = byMeasure.get(element.measureTypeId) ?? {
        measureTypeId: element.measureTypeId,
        qty: 0,
        concrete: 0,
        rebar: 0,
        formwork: 0,
        excavation: 0,
        blinding: 0,
      };

      existing.qty += members;
      existing.concrete += q.concrete * members;
      existing.rebar += q.rebar * members;
      existing.formwork += q.formwork * members;
      existing.excavation += q.excavation * members;
      existing.blinding += q.blinding * members;
      byMeasure.set(element.measureTypeId, existing);
    }
  }

  return [...byMeasure.values()];
}

export function deriveBoqSections(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): BoqSection[] {
  const totals = totalsByMeasure(groups, params);
  if (totals.length === 0) return [];

  const toItem = (t: GroupTotals): BoqLineItem => ({
    id: t.measureTypeId,
    label: titleCase(measureLabel(t.measureTypeId)),
    qty: t.qty,
    unit: "Nos.",
    rate: null,
    concrete: t.concrete,
    rebar: t.rebar,
    formwork: t.formwork,
    // Excavation only applies below ground.
    excavation: measureGroup(t.measureTypeId) === "foundations" ? t.excavation : null,
  });

  const sections: BoqSection[] = [];

  // Foundations collapse into one section, matching the report layout.
  const foundations = totals.filter((t) => measureGroup(t.measureTypeId) === "foundations");
  if (foundations.length > 0) {
    sections.push({
      id: "foundations",
      title: "FOUNDATIONS",
      itemLabel: "Item Description",
      items: foundations.map(toItem),
    });
  }

  // Every superstructure type gets its own section.
  for (const t of totals.filter((x) => measureGroup(x.measureTypeId) === "superstructure")) {
    sections.push({
      id: t.measureTypeId,
      title: measureLabel(t.measureTypeId),
      count: `(${t.qty} NOS)`,
      itemLabel: "Item",
      items: [toItem(t)],
    });
  }

  return sections;
}

export function deriveConcreteSchedule(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): ConcreteScheduleRow[] {
  return totalsByMeasure(groups, params)
    .filter((t) => t.concrete > 0)
    .map((t) => ({
      id: t.measureTypeId,
      description: titleCase(measureLabel(t.measureTypeId)),
      grade: measureGroup(t.measureTypeId) === "foundations" ? "C25" : "C30",
      qty: t.concrete,
      wastagePct: DEFAULT_CONCRETE_WASTAGE_PCT,
      unitCost: null,
    }));
}

/**
 * A single total row. The per-bar-size split needs bar marks and diameters,
 * which the detection payload does not carry, so inventing a breakdown here
 * would be fabricating quantities a QS would price against.
 */
export function deriveRebarSchedule(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): RebarScheduleRow[] {
  const rebar = totalsByMeasure(groups, params).reduce((sum, t) => sum + t.rebar, 0);
  if (rebar <= 0) return [];

  return [
    {
      id: "unspecified",
      barSize: "Unspecified",
      qty: rebar,
      wastagePct: DEFAULT_REBAR_WASTAGE_PCT,
      unitCost: null,
    },
  ];
}

export function deriveFormworkMaterial(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): FormworkMaterialRow[] {
  return totalsByMeasure(groups, params)
    .filter((t) => t.formwork > 0)
    .map((t) => ({
      id: t.measureTypeId,
      element: titleCase(measureLabel(t.measureTypeId)),
      qty: t.formwork,
      type: "Plywood",
      area: t.formwork,
      unitCost: null,
    }));
}
