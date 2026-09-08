import { computeElementQuantities } from "../calc";
import { MEASURE_TYPES } from "../mock-data";
import type { AiProjectMeta, ExtractedGroup, GlobalParameters } from "../types";
import type {
  BoqDocument,
  BoqDocumentRow,
  BoqDocumentSection,
  BoqElementGroup,
} from "@/types/boqDocument";

/**
 * Build a boq_v2 document from what the AI flow measured.
 *
 * The server writes the real document when a takeoff is committed, but the AI
 * takeoff's finish call does not produce one — so without this the BOQ tab sits
 * on a 404 after a perfectly good extraction, which is not how the flow worked
 * before. This derives the same shape from the elements already on screen, so
 * the bill renders through the identical components and the QS sees their work.
 *
 * It is replaced the moment the server has a document of its own: the view
 * prefers the API and only falls back to this.
 */

/** SMM work sections, in the order they are billed. */
const WORK_SECTIONS = [
  { key: "excavation", code: "D20", title: "EXCAVATING AND FILLING" },
  { key: "concrete", code: "E10", title: "IN-SITU CONCRETE" },
  { key: "formwork", code: "E20", title: "FORMWORK FOR IN-SITU CONCRETE" },
  { key: "reinforcement", code: "E30", title: "REINFORCEMENT FOR IN-SITU CONCRETE" },
] as const;

type WorkKey = (typeof WORK_SECTIONS)[number]["key"];

const UNIT: Record<WorkKey, string> = {
  excavation: "cum",
  concrete: "cum",
  formwork: "sqm",
  reinforcement: "tons",
};

/** The lead-in that heads each work-type run, per the SMM wording. */
const LEAD_IN: Record<WorkKey, string> = {
  excavation: "Excavating:",
  concrete: "Reinforced in-situ concrete:",
  formwork: "Sawn formwork to:",
  reinforcement: "High tensile steel bar reinforcement to B.S. 4461:",
};

const ELEMENT_GROUPS = [
  { key: "substructure", group: "foundations", title: "SUBSTRUCTURAL WORKS" },
  { key: "frame", group: "superstructure", title: "FRAME AND SUPERSTRUCTURE" },
] as const;

const titleCase = (label: string) =>
  label
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const measure = (id: string) => MEASURE_TYPES.find((m) => m.id === id);

/** Continuous A–Z then AA, AB… across every section in a group. */
function itemCodeAt(index: number): string {
  let code = "";
  let n = index;
  do {
    code = String.fromCharCode(65 + (n % 26)) + code;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return code;
}

interface MeasureTotals {
  measureTypeId: string;
  label: string;
  excavation: number;
  concrete: number;
  formwork: number;
  reinforcement: number;
}

/** Sum each measure type across its members, skipping rejected rows. */
function totalsByMeasure(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): MeasureTotals[] {
  const byMeasure = new Map<string, MeasureTotals>();

  for (const group of groups) {
    for (const element of group.elements) {
      if (element.status === "rejected") continue;

      const q = computeElementQuantities(
        element.dimensions,
        params,
        element.measureTypeId,
      );
      // One member's figures, times the members this row stands for.
      const n = element.quantity || 1;

      const existing = byMeasure.get(element.measureTypeId) ?? {
        measureTypeId: element.measureTypeId,
        label: measure(element.measureTypeId)?.label ?? element.measureTypeId,
        excavation: 0,
        concrete: 0,
        formwork: 0,
        reinforcement: 0,
      };

      existing.excavation += q.excavation * n;
      existing.concrete += q.concrete * n;
      existing.formwork += q.formwork * n;
      // Reinforcement is billed in tonnes, computed in kilogrammes.
      existing.reinforcement += (q.rebar * n) / 1000;

      byMeasure.set(element.measureTypeId, existing);
    }
  }

  return [...byMeasure.values()];
}

export function deriveBoqDocument({
  groups,
  globalParameters,
  projectMeta,
  currency = "NGN",
  location = "",
  rates = {},
}: {
  groups: ExtractedGroup[];
  globalParameters: GlobalParameters;
  projectMeta: AiProjectMeta;
  currency?: string;
  location?: string;
  /** Rates keyed by rowId — held locally, since there is no document to PATCH. */
  rates?: Record<string, number>;
}): BoqDocument {
  const totals = totalsByMeasure(groups, globalParameters);

  const elementGroups: BoqElementGroup[] = [];
  let elementNo = 0;

  for (const definition of ELEMENT_GROUPS) {
    const mine = totals.filter(
      (t) => measure(t.measureTypeId)?.group === definition.group,
    );
    if (mine.length === 0) continue;

    // Item codes run continuously across all sections in a group, not per
    // section — so the counter lives out here.
    let codeIndex = 0;
    const sections: BoqDocumentSection[] = [];
    let groupTotal = 0;

    for (const work of WORK_SECTIONS) {
      const priced = mine.filter((t) => t[work.key] > 0.0001);
      if (priced.length === 0) continue;

      const rows: BoqDocumentRow[] = [];
      let sectionTotal = 0;

      priced.forEach((total, index) => {
        const rowId = `${definition.key}:${work.key}:${total.measureTypeId}`;
        const quantity = Number(total[work.key].toFixed(3));
        const rate = rates[rowId] ?? null;
        const amount = rate === null ? null : Number((rate * quantity).toFixed(2));

        sectionTotal += amount ?? 0;

        rows.push({
          rowId,
          rowType: "item",
          itemCode: itemCodeAt(codeIndex++),
          // Only the first row of a run carries the lead-in; the rest read
          // against it, which is how a bill is written.
          descriptionLeadIn: index === 0 ? LEAD_IN[work.key] : null,
          description: describe(work.key, total.label),
          descriptionSource: "template",
          unit: UNIT[work.key],
          quantity,
          rate,
          amount,
          locked: rate === null ? null : ["rate"],
          origin: {
            elementId: total.measureTypeId,
            elementType: total.measureTypeId,
            workType: work.key,
          },
        });
      });

      groupTotal += sectionTotal;
      sections.push({
        sectionId: `${definition.key}:${work.code}`,
        sectionCode: work.code,
        title: work.title,
        total: sectionTotal,
        rows,
      });
    }

    if (sections.length === 0) continue;

    elementGroups.push({
      groupId: definition.key,
      groupKey: definition.key,
      elementNo: ++elementNo,
      title: definition.title,
      total: groupTotal,
      sections,
    });
  }

  const subTotal = elementGroups.reduce((sum, group) => sum + group.total, 0);

  return {
    templateVersion: "boq_v2",
    meta: {
      projectTitle: projectMeta.projectTitle,
      clientName: projectMeta.clientName,
      location,
      preparedBy: "",
      preparedAt: new Date().toISOString(),
      currency,
    },
    elementGroups,
    summary: {
      entries: elementGroups.map((group) => ({
        groupId: group.groupId,
        elementNo: group.elementNo,
        title: group.title,
        amount: group.total,
      })),
      subTotal,
      adjustments: [],
      grandTotal: subTotal,
    },
    generatedAt: new Date().toISOString(),
  };
}

function describe(work: WorkKey, label: string): string {
  const name = titleCase(label);
  switch (work) {
    case "excavation":
      return `Excavate to receive ${name.toLowerCase()}, commencing from stripped level, including earthwork support and disposal.`;
    case "concrete":
      return `Grade 25 concrete in ${name.toLowerCase()}.`;
    case "formwork":
      return `Sides of ${name.toLowerCase()}; plain vertical.`;
    case "reinforcement":
      return `Bar reinforcement in ${name.toLowerCase()}.`;
  }
}
