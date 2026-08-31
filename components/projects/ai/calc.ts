import type {
  ComputedQuantities,
  ElementDimensions,
  GlobalParameters,
  BoqLineItem,
  ConcreteScheduleRow,
  RebarScheduleRow,
  FormworkMaterialRow,
  BbsRow,
} from "./types";

/**
 * Calibrated against the design's Quick Edit preview: a 2.40 × 2.40 × 0.90 m
 * pile cap reads 5.18 m³ concrete / 8.64 m² formwork / 201.3 kg rebar.
 */
const REBAR_KG_PER_M3 = 38.83;

/** Standard mass per metre (kg/m) by bar diameter. */
export const BAR_MASS_PER_M: Record<number, number> = {
  8: 0.395,
  10: 0.62,
  12: 0.89,
  16: 1.58,
  20: 2.47,
  25: 3.85,
  32: 6.31,
  40: 9.86,
};

const mm = (v: number | null) => (v ?? 0) / 1000;

const ZERO_QUANTITIES: ComputedQuantities = {
  concrete: 0,
  formwork: 0,
  rebar: 0,
  excavation: 0,
};

export function computeElementQuantities(
  dimensions: ElementDimensions,
  params: GlobalParameters,
): ComputedQuantities {
  // Working space and blinding are added *around* the element, so an element
  // whose dimensions the AI could not read still produced an excavation
  // volume: (0 + 2ws)(0 + 2ws)(0 + blinding) — a real-looking figure sitting
  // beside 0.00 m3 of concrete. Nothing is derivable until the dimensions are
  // known, so nothing is returned.
  if (!isElementComplete(dimensions)) return { ...ZERO_QUANTITIES };

  const l = mm(dimensions.length);
  const w = mm(dimensions.width);
  const d = mm(dimensions.depth);

  const isCircular = dimensions.shape.toLowerCase().includes("circ");
  const r = mm(dimensions.diameter) / 2;

  const concrete = isCircular ? Math.PI * r * r * d : l * w * d;
  const formwork = isCircular ? 2 * Math.PI * r * d : 2 * (l + w) * d;
  const rebar = concrete * REBAR_KG_PER_M3;

  const ws = mm(params.workingSpace);
  const blinding = mm(params.blinding);
  const excavation = isCircular
    ? Math.PI * (r + ws) * (r + ws) * (d + blinding)
    : (l + 2 * ws) * (w + 2 * ws) * (d + blinding);

  return { concrete, formwork, rebar, excavation };
}

export function isElementComplete(dimensions: ElementDimensions): boolean {
  const isCircular = dimensions.shape.toLowerCase().includes("circ");
  if (isCircular) return dimensions.diameter !== null && dimensions.depth !== null;
  return (
    dimensions.length !== null &&
    dimensions.width !== null &&
    dimensions.depth !== null
  );
}

export type DimensionKey = "length" | "width" | "depth" | "diameter";

export function applicableDimensionKeys(
  dimensions: ElementDimensions,
): DimensionKey[] {
  return dimensions.shape.toLowerCase().includes("circ")
    ? ["diameter", "depth"]
    : ["length", "width", "depth"];
}

export function missingDimensionKeys(
  dimensions: ElementDimensions,
): DimensionKey[] {
  return applicableDimensionKeys(dimensions).filter((k) => dimensions[k] === null);
}

export function barWeight(size: number, totalLength: number): number {
  return totalLength * (BAR_MASS_PER_M[size] ?? 0);
}

export function bbsRowTotals(rows: BbsRow[]) {
  return rows.reduce(
    (acc, row) => {
      const totalLength = row.noBars * row.cutLength;
      acc.totalLength += totalLength;
      acc.weight += row.weight;
      acc.bars += row.noBars;
      return acc;
    },
    { totalLength: 0, weight: 0, bars: 0 },
  );
}

export const boqAmount = (item: BoqLineItem) => (item.rate ?? 0) * item.qty;

export function boqSectionTotals(items: BoqLineItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.amount += boqAmount(item);
      acc.concrete += item.concrete;
      acc.rebar += item.rebar;
      acc.formwork += item.formwork;
      acc.excavation += item.excavation ?? 0;
      return acc;
    },
    { amount: 0, concrete: 0, rebar: 0, formwork: 0, excavation: 0 },
  );
}

export const withWastage = (qty: number, pct: number) => qty * (1 + pct / 100);
export const wastageAmount = (qty: number, pct: number) => qty * (pct / 100);

export const concreteRowTotal = (row: ConcreteScheduleRow) =>
  withWastage(row.qty, row.wastagePct) * (row.unitCost ?? 0);

export const rebarRowTotal = (row: RebarScheduleRow) =>
  withWastage(row.qty, row.wastagePct) * (row.unitCost ?? 0);

export const formworkRowTotal = (row: FormworkMaterialRow) =>
  row.area * (row.unitCost ?? 0);

export const KG_PER_TON = 1000;

const nf = (min: number, max: number) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

export const fmt = (value: number, dp = 2) => nf(dp, dp).format(value);
export const fmtInt = (value: number) => nf(0, 0).format(Math.round(value));
export const fmtNaira = (value: number) => `₦${nf(2, 2).format(value)}`;
