import {
  elementSpec,
  isBelowGround,
  toMetres,
  usesWorkingSpace,
  type DimField,
  type DimKey,
} from "./elementSpec";
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
 * Reinforcement per metre of bar, kg, from the bar diameter in millimetres.
 * The QS shorthand: mass/m = Ø² / 162.2, which is (π/4)Ø² x 7850 with the
 * millimetre-to-metre conversion folded in.
 */
export const barMassPerMetre = (diameterMm: number) => diameterMm ** 2 / 162.2;

/**
 * Weight of a set of identical bars, per the reinforcement rule:
 *   kg = count x (Ø² / 162.2) x length
 */
export const rebarWeight = (count: number, diameterMm: number, lengthM: number) =>
  count * barMassPerMetre(diameterMm) * lengthM;

/**
 * Fallback reinforcement rate for members whose steel cannot be counted from
 * the plan — a pile cage, a column, a beam. Calibrated against the design's
 * Quick Edit preview: a 2.40 x 2.40 x 0.90 m pile cap reads 201.3 kg.
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

/**
 * Reinforcement in a rectangular mat:
 *   bar length in X      = Lx - 2cv
 *   number of bars in X  = floor(Ly / spacing) + 1
 *   weight per direction = length x count x (Ø² / 162.2)
 * Both directions summed, doubled when a top mesh is specified.
 */
export function matRebar(
  lengthM: number,
  widthM: number,
  params: GlobalParameters,
): number {
  const cover = mm(params.concreteCover);
  const spacing = mm(params.barSpacing);
  if (spacing <= 0) return 0;

  const lx = lengthM - 2 * cover;
  const ly = widthM - 2 * cover;
  if (lx <= 0 || ly <= 0) return 0;

  const perMetre = barMassPerMetre(params.barDiameter);
  const alongX = lx * (Math.floor(ly / spacing) + 1);
  const alongY = ly * (Math.floor(lx / spacing) + 1);

  const bottomMesh = (alongX + alongY) * perMetre;
  return params.topMesh ? bottomMesh * 2 : bottomMesh;
}

const ZERO_QUANTITIES: ComputedQuantities = {
  concrete: 0,
  formwork: 0,
  rebar: 0,
  excavation: 0,
  blinding: 0,
};

/**
 * Smallest figure that can be a real structural dimension, in millimetres.
 * An uncalibrated page turns a symbol into a 2 mm "length", which then reads as
 * a successful detection. A dimension this small is missing, not measured.
 */
const MIN_PLAUSIBLE_MM = 10;

export const isDimensionKnown = (value: number | null): value is number =>
  value !== null && value >= MIN_PLAUSIBLE_MM;

export type DimensionKey = DimKey;

/** The dimensions this element type needs — not a fixed L/W/D for everything. */
export function applicableDimensionKeys(
  dimensions: ElementDimensions,
  measureTypeId = "",
): DimensionKey[] {
  return elementSpec(measureTypeId, dimensions).dims.map((field) => field.key);
}

export function applicableDimensionFields(
  measureTypeId: string,
  dimensions: ElementDimensions,
): DimField[] {
  return elementSpec(measureTypeId, dimensions).dims;
}

export function missingDimensionKeys(
  dimensions: ElementDimensions,
  measureTypeId = "",
): DimensionKey[] {
  return applicableDimensionKeys(dimensions, measureTypeId).filter(
    // The stair rise is a slope correction, not a dimension the volume fails
    // without — a flight measured flat is wrong by a few percent, not unusable.
    (key) => key !== "rise" && !isDimensionKnown(dimensions[key]),
  );
}

export function isElementComplete(
  dimensions: ElementDimensions,
  measureTypeId = "",
): boolean {
  return missingDimensionKeys(dimensions, measureTypeId).length === 0;
}

export function formatDimensions(
  dimensions: ElementDimensions,
  measureTypeId = "",
): string {
  return applicableDimensionFields(measureTypeId, dimensions)
    .map((field) => {
      const value = dimensions[field.key];
      return isDimensionKnown(value)
        ? `${field.symbol}${(value / 1000).toFixed(2)}`
        : `${field.symbol}?`;
    })
    .join(" × ");
}

/**
 * Quantities for ONE member of this element type. Multiply by the row's
 * `quantity` for the row total — a pile legend row stands for 130 piles.
 */
export function computeElementQuantities(
  dimensions: ElementDimensions,
  params: GlobalParameters,
  measureTypeId = "",
): ComputedQuantities {
  // Working space and blinding are added *around* the element, so an element
  // whose dimensions could not be read still produced an excavation volume.
  // Nothing is derivable until the dimensions are known, so nothing is returned.
  if (!isElementComplete(dimensions, measureTypeId)) return { ...ZERO_QUANTITIES };

  const spec = elementSpec(measureTypeId, dimensions);
  const d = toMetres(dimensions);

  const concrete = spec.volume(d);
  const formwork = spec.formwork(d);
  const planArea = spec.planArea(d);
  const height = spec.height(d);

  // Counted bar by bar where a mat applies; a cage or a column falls back to
  // the volumetric rate, which is all a plan view supports.
  const rebar = spec.hasMat
    ? matRebar(d.length, d.width, params)
    : concrete * REBAR_KG_PER_M3;

  let excavation = 0;
  let blinding = 0;

  if (isBelowGround(measureTypeId, dimensions)) {
    const blindingDepth = mm(params.blinding);

    if (usesWorkingSpace(measureTypeId)) {
      // Footprint grown by the working space on every side, dug to the
      // underside of the blinding.
      const ws = mm(params.workingSpace);
      excavation = spec.grownPlanArea(d, ws) * (height + blindingDepth);
      blinding = planArea * blindingDepth;
    } else {
      // A bored pile is its own excavation: the bore, no working space, and
      // nothing is blinded under it.
      excavation = planArea * height;
    }
  }

  return { concrete, formwork, rebar, excavation, blinding };
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
