import { computeElementQuantities } from "../calc";
import { elementSpec, toMetres } from "../elementSpec";
import { MEASURE_TYPES } from "../mock-data";
import {
  BOQ_ADJUSTMENTS,
  BOQ_TEMPLATE,
  type FillKey,
  type TemplateRow,
} from "./boqTemplate";
import type { AiProjectMeta, ExtractedGroup, GlobalParameters } from "../types";
import type {
  BoqDocument,
  BoqDocumentRow,
  BoqDocumentSection,
  BoqElementGroup,
} from "@/types/boqDocument";

/**
 * Fill the client's BOQ template from what the AI measured.
 *
 * The whole bill renders whether or not a row was measured — a QS prices
 * against the full document, and the unmeasured rows are exactly the ones they
 * need to see and fill by hand. Only rows carrying a `fill` key are populated;
 * everything else keeps a blank quantity.
 *
 * The server writes a real document once a takeoff is committed; this stands in
 * until then, in the same shape, so the page and the export never change form.
 */

/** Every measured figure the template can draw on, keyed by FillKey. */
type Measured = Partial<Record<FillKey, number>>;

const measureGroupOf = (id: string) =>
  MEASURE_TYPES.find((m) => m.id === id)?.group ?? "superstructure";

/**
 * Roll the extraction up into the figures the template asks for.
 *
 * Volumes are m³, areas m², reinforcement tonnes, counts each. Everything is
 * per member multiplied by the members that row stands for.
 */
function measureAll(
  groups: ExtractedGroup[],
  params: GlobalParameters,
): Measured {
  const out: Measured = {};
  const add = (key: FillKey, value: number) => {
    if (!Number.isFinite(value) || value === 0) return;
    out[key] = (out[key] ?? 0) + value;
  };

  for (const group of groups) {
    for (const element of group.elements) {
      if (element.status === "rejected") continue;

      const id = element.measureTypeId;
      const q = computeElementQuantities(element.dimensions, params, id);
      const n = element.quantity || 1;
      const spec = elementSpec(id, element.dimensions);
      const metres = toMetres(element.dimensions);

      const concrete = q.concrete * n;
      const formwork = q.formwork * n;
      const rebarTons = (q.rebar * n) / 1000;
      const excavation = q.excavation * n;
      const blinding = q.blinding * n;
      const planArea = spec.planArea(metres) * n;

      // The workbook bills the net dig and the working-space allowance as two
      // separate items, so the excavation figure is split the same way: the
      // element's own footprint against the extra ring around it.
      const netDig = planArea * spec.height(metres) * n;
      const workingSpace = Math.max(0, excavation - netDig);

      switch (id) {
        case "piles":
          add("pile.concrete", concrete);
          add("pile.rebar", rebarTons);
          add("pile.trim", n);
          break;

        case "pile-cap":
        case "pad-footing":
          add("exc.pilecap", netDig);
          add("ws.pilecap", workingSpace);
          add("blind.pilecap", blinding);
          add("conc.pilecap", concrete);
          add("form.pilecap", formwork);
          add("rebar.pilecap", rebarTons);
          add("treat.level", planArea);
          add("fill.making", Math.max(0, excavation - concrete));
          break;

        case "ground-beam":
          add("exc.groundbeam", netDig);
          add("ws.groundbeam", workingSpace);
          add("blind.groundbeam", blinding);
          add("conc.groundbeam", concrete);
          add("form.groundbeam", formwork);
          add("rebar.groundbeam", rebarTons);
          add("treat.level", planArea);
          add("fill.making", Math.max(0, excavation - concrete));
          break;

        case "raft-foundation":
        case "strip-foundation":
          add("exc.pilecap", netDig);
          add("ws.pilecap", workingSpace);
          add("blind.raft", blinding);
          add("conc.bedliftslab", concrete);
          add("form.wall.sub", formwork);
          add("rebar.bed", rebarTons);
          add("treat.level", planArea);
          break;

        case "columns":
          add("conc.columns", concrete);
          add("rebar.columns", rebarTons);
          add("form.columns", formwork);
          break;

        case "beams":
          add("conc.beams", concrete);
          add("rebar.beams", rebarTons);
          add("form.beams", formwork);
          break;

        case "lintels":
        case "doors":
        case "windows":
          add("conc.lintels", concrete);
          add("rebar.lintels", rebarTons);
          add("form.lintels", formwork);
          break;

        case "slabs":
          add("conc.slabs", concrete);
          add("rebar.slabs", rebarTons);
          add("form.slabs", formwork);
          break;

        case "roof":
          add("conc.roofslab", concrete);
          add("rebar.roof", rebarTons);
          add("form.roof", formwork);
          break;

        case "stairs":
          add("conc.stairs", concrete);
          add("rebar.stairs", rebarTons);
          add("form.stairs", formwork);
          break;

        case "shear-walls":
          add("conc.shearwall", concrete);
          add("rebar.shearwall", rebarTons);
          add("form.shearwall", formwork);
          break;

        case "lift-walls":
          add("conc.liftwall", concrete);
          add("rebar.liftwall", rebarTons);
          add("form.liftwall", formwork);
          break;

        case "ext-walls":
          // Blockwork is billed by face area — half the formwork figure, which
          // counts both faces — and the finishes follow the same faces.
          add("block.extwall", formwork / 2);
          add("finish.render.ext", formwork / 2);
          add("finish.paint.ext", formwork / 2);
          break;

        case "int-walls":
        case "blockwork":
          add("block.intwall", formwork / 2);
          add("finish.render.int", formwork);
          add("finish.paint.int", formwork);
          break;

        case "ramps":
          add("conc.slabs", concrete);
          add("form.slabs", formwork);
          break;

        default:
          // Anything with no home in the template still reaches the bill
          // rather than disappearing from it.
          if (measureGroupOf(id) === "foundations") {
            add("conc.pilecap", concrete);
            add("rebar.pilecap", rebarTons);
            add("form.pilecap", formwork);
          } else {
            add("conc.slabs", concrete);
            add("rebar.slabs", rebarTons);
            add("form.slabs", formwork);
          }
      }
    }
  }

  return out;
}

const round = (value: number) => Number(value.toFixed(2));

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
  const measured = measureAll(groups, globalParameters);

  const elementGroups: BoqElementGroup[] = BOQ_TEMPLATE.map(
    (templateGroup, groupIndex) => {
      let groupTotal = 0;

      const sections: BoqDocumentSection[] = templateGroup.sections.map(
        (templateSection) => {
          let sectionTotal = 0;

          const rows: BoqDocumentRow[] = templateSection.rows.map(
            (templateRow, rowIndex) => {
              const rowId = `${templateSection.id}:${templateRow.no ?? `r${rowIndex}`}`;

              if (templateRow.kind !== "item") {
                return {
                  rowId,
                  rowType: templateRow.kind,
                  description: templateRow.text,
                  descriptionSource: "template" as const,
                };
              }

              const quantity = templateRow.fill
                ? round(measured[templateRow.fill] ?? 0)
                : null;
              const rate = rates[rowId] ?? null;
              const amount =
                rate === null || quantity === null ? null : round(rate * quantity);

              sectionTotal += amount ?? 0;

              return {
                rowId,
                rowType: "item" as const,
                itemCode: templateRow.no ?? "",
                descriptionLeadIn: templateRow.leadIn ?? null,
                description: templateRow.text,
                descriptionSource: "template" as const,
                unit: templateRow.unit ?? null,
                quantity,
                rate,
                amount,
                locked: null,
                origin: templateRow.fill
                  ? {
                      elementId: templateRow.fill,
                      elementType: templateSection.id,
                      workType: templateRow.fill.split(".")[0],
                    }
                  : null,
              };
            },
          );

          groupTotal += sectionTotal;
          return {
            sectionId: templateSection.id,
            sectionCode: templateSection.code ?? "",
            title: templateSection.title,
            total: sectionTotal,
            rows,
          };
        },
      );

      return {
        groupId: templateGroup.id,
        groupKey: templateGroup.id,
        elementNo: groupIndex + 1,
        title: templateGroup.title,
        total: groupTotal,
        sections,
      };
    },
  );

  const subTotal = elementGroups.reduce((sum, group) => sum + group.total, 0);

  // Preliminaries then VAT, each on the running total, as the workbook does it.
  let running = subTotal;
  const adjustments = BOQ_ADJUSTMENTS.map((adjustment) => {
    const amount = round((running * adjustment.percentage) / 100);
    running += amount;
    return { ...adjustment, amount };
  });

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
      adjustments,
      grandTotal: round(running),
    },
    generatedAt: new Date().toISOString(),
  };
}

/** True when the template row was populated from the extraction. */
export const isMeasuredRow = (row: TemplateRow) => !!row.fill;
