import type { ElementDimensions, GlobalParameters } from "./types";

/**
 * What each structural element is actually measured by.
 *
 * A single "L × W × D" column was applied to every element type, which printed
 * a bored pile — a cylinder — as `? × ? × 10`, and computed its volume as a
 * box. Each type names its own dimensions, its own symbols and its own volume
 * and formwork rules here, and every screen derives its labels, its inputs and
 * its arithmetic from this one table.
 *
 * All dimensions are stored in millimetres and converted to metres before use.
 */

export type DimKey =
  | "length"
  | "width"
  | "depth"
  | "diameter"
  | "height"
  | "thickness"
  | "rise";

export interface DimField {
  key: DimKey;
  /** the symbol shown in the column header, e.g. `b`, `h`, `Ø`, `t` */
  symbol: string;
  /** the words used on the input, e.g. "Width (b)" */
  label: string;
  hint?: string;
}

export interface ElementSpec {
  /** the dimensions this element type needs, in the order they are quoted */
  dims: DimField[];
  /** m³ of concrete for one member, from metres */
  volume: (d: Metres) => number;
  /**
   * m² of formwork for one member. Surfaces in contact with concrete only —
   * a face cast against earth or blinding takes no formwork.
   */
  formwork: (d: Metres) => number;
  /** plan footprint in m², used for excavation and blinding */
  planArea: (d: Metres) => number;
  /**
   * Footprint grown by the working space on every side, m². A circle grows by
   * its diameter plus twice the space; a rectangle by each side plus twice.
   */
  grownPlanArea: (d: Metres, workingSpace: number) => number;
  /** below ground: earns excavation and blinding */
  belowGround?: boolean;
  /** carries a rectangular reinforcement mat rather than a cage */
  hasMat?: boolean;
  /** vertical extent in metres, the depth dug to when below ground */
  height: (d: Metres) => number;
}

/** Dimensions converted to metres, with every slot present. */
export type Metres = Record<DimKey, number>;

const F = {
  length: { key: "length", symbol: "L", label: "Length (L)" },
  longestSide: { key: "length", symbol: "L", label: "Length (L)", hint: "longest side" },
  width: { key: "width", symbol: "W", label: "Width (W)" },
  breadth: { key: "width", symbol: "b", label: "Width (b)" },
  depth: { key: "depth", symbol: "D", label: "Depth (D)" },
  columnDepth: { key: "depth", symbol: "h", label: "Depth (h)" },
  diameter: { key: "diameter", symbol: "Ø", label: "Diameter (Ø)" },
  height: { key: "height", symbol: "H", label: "Height (H)" },
  thickness: { key: "thickness", symbol: "t", label: "Thickness (t)" },
  going: { key: "length", symbol: "Plan L", label: "Going (plan length)" },
  flightWidth: { key: "width", symbol: "Plan W", label: "Flight width" },
  waist: { key: "thickness", symbol: "t", label: "Waist thickness (t)" },
  rise: { key: "rise", symbol: "Rise", label: "Total rise" },
  pileLength: { key: "length", symbol: "L", label: "Length (L)", hint: "embedded length" },
} satisfies Record<string, DimField>;

const CIRCLE_AREA = (diameter: number) => (Math.PI / 4) * diameter ** 2;

/** √(rise² + going²) / going — a sloping waist is longer than its plan. */
const slopeFactor = (d: Metres) =>
  d.length > 0 && d.rise > 0 ? Math.hypot(d.rise, d.length) / d.length : 1;

/** A cylinder measured by diameter and length: piles, circular columns. */
const cylinder = (heightKey: DimKey, fields: DimField[]): ElementSpec => ({
  dims: fields,
  volume: (d) => CIRCLE_AREA(d.diameter) * d[heightKey],
  formwork: (d) => Math.PI * d.diameter * d[heightKey],
  planArea: (d) => CIRCLE_AREA(d.diameter),
  grownPlanArea: (d, ws) => CIRCLE_AREA(d.diameter + 2 * ws),
  height: (d) => d[heightKey],
});

/** The usual case: a rectangular footprint grown on all four sides. */
const grownRect = (d: Metres, ws: number) => (d.length + 2 * ws) * (d.width + 2 * ws);

/** A rectangular base: L × W × D, formwork to the four sides. */
const base = (depthField: DimField): ElementSpec => ({
  dims: [F.longestSide, F.width, depthField],
  volume: (d) => d.length * d.width * (d[depthField.key] ?? 0),
  formwork: (d) => 2 * (d.length + d.width) * (d[depthField.key] ?? 0),
  planArea: (d) => d.length * d.width,
  grownPlanArea: grownRect,
  belowGround: true,
  hasMat: true,
  height: (d) => d[depthField.key] ?? 0,
});

/** A horizontal member: b × D × L, formwork to two sides and the soffit. */
const beamLike = (isolated: boolean): ElementSpec => ({
  dims: [F.breadth, F.depth, F.length],
  volume: (d) => d.width * d.depth * d.length,
  // (2D + b) x L when isolated; 2D x L when cast against a slab above.
  formwork: (d) => (isolated ? 2 * d.depth + d.width : 2 * d.depth) * d.length,
  planArea: (d) => d.width * d.length,
  grownPlanArea: (d, ws) => (d.width + 2 * ws) * d.length,
  height: (d) => d.depth,
});

/** A horizontal plate: L × W × t, formwork to the soffit. */
const plate: ElementSpec = {
  dims: [F.longestSide, F.width, F.thickness],
  volume: (d) => d.length * d.width * d.thickness,
  formwork: (d) => d.length * d.width,
  planArea: (d) => d.length * d.width,
  grownPlanArea: grownRect,
  height: (d) => d.thickness,
};

/** A vertical plate: L × H × t, formwork to both faces. */
const wall: ElementSpec = {
  dims: [F.length, F.height, F.thickness],
  volume: (d) => d.length * d.height * d.thickness,
  formwork: (d) => 2 * d.length * d.height,
  planArea: (d) => d.length * d.thickness,
  grownPlanArea: (d, ws) => d.length * (d.thickness + 2 * ws),
  height: (d) => d.height,
};

const SPECS: Record<string, ElementSpec> = {
  // 1 — bored / cast-in-situ piles. Cast against the bore, so no formwork,
  // and the bore is the excavation, so no working space around it either.
  piles: {
    ...cylinder("length", [F.diameter, F.pileLength]),
    formwork: () => 0,
  },

  // 2 — pile caps / pad footings
  "pile-cap": base(F.depth),
  "pad-footing": base(F.depth),
  "raft-foundation": base(F.thickness),

  // A strip runs in one direction: formwork to the two long sides only.
  "strip-foundation": {
    ...base(F.depth),
    formwork: (d) => 2 * d.length * d.depth,
  },

  // 3 — ground beams are beams cast against earth on their soffit
  "ground-beam": {
    ...beamLike(false),
    belowGround: true,
  },

  // 3 — columns. Circular columns are the pile geometry over a storey height.
  columns: {
    dims: [F.breadth, F.columnDepth, F.height],
    volume: (d) => d.width * d.depth * d.height,
    formwork: (d) => 2 * (d.width + d.depth) * d.height,
    planArea: (d) => d.width * d.depth,
    grownPlanArea: (d, ws) => (d.width + 2 * ws) * (d.depth + 2 * ws),
    height: (d) => d.height,
  },

  // 4 — beams, isolated unless cast monolithically with a slab
  beams: beamLike(true),
  lintels: beamLike(true),
  doors: beamLike(true),
  windows: beamLike(true),

  // 5 — slabs
  slabs: plate,
  roof: plate,
  ramps: plate,

  // 6 — shear and core walls
  "shear-walls": wall,
  "lift-walls": wall,
  "ext-walls": wall,
  "int-walls": wall,
  blockwork: wall,

  // 7 — stair flights: plan area × waist, corrected for the slope
  stairs: {
    dims: [F.going, F.flightWidth, F.waist, F.rise],
    volume: (d) => d.length * d.width * d.thickness * slopeFactor(d),
    formwork: (d) => d.length * d.width * slopeFactor(d),
    planArea: (d) => d.length * d.width,
    grownPlanArea: grownRect,
    height: (d) => d.thickness,
  },

  "swimming-pool": {
    dims: [F.longestSide, F.width, F.depth],
    volume: (d) => d.length * d.width * d.depth,
    formwork: (d) => 2 * (d.length + d.width) * d.depth + d.length * d.width,
    planArea: (d) => d.length * d.width,
    grownPlanArea: grownRect,
    belowGround: true,
    height: (d) => d.depth,
  },
};

/** Anything not named above measures as a rectangular base. */
const DEFAULT_SPEC = base(F.depth);

export function elementSpec(
  measureTypeId: string,
  dimensions?: ElementDimensions,
): ElementSpec {
  // A circular column is measured like a pile, not like a rectangular one.
  if (
    measureTypeId === "columns" &&
    dimensions?.shape?.toLowerCase().includes("circ")
  ) {
    return cylinder("height", [F.diameter, F.height]);
  }
  return SPECS[measureTypeId] ?? DEFAULT_SPEC;
}

/** Millimetres → metres, every slot filled so formulas never see undefined. */
export function toMetres(dimensions: ElementDimensions): Metres {
  const m = (value: number | null) => (value ?? 0) / 1000;
  return {
    length: m(dimensions.length),
    width: m(dimensions.width),
    depth: m(dimensions.depth),
    diameter: m(dimensions.diameter),
    height: m(dimensions.height),
    thickness: m(dimensions.thickness),
    rise: m(dimensions.rise),
  };
}

/** The column header for a group, e.g. `Dimensions (Ø × L) m`. */
export const dimensionColumnLabel = (
  measureTypeId: string,
  dimensions?: ElementDimensions,
) =>
  `Dimensions (${elementSpec(measureTypeId, dimensions)
    .dims.map((f) => f.symbol)
    .join(" × ")}) m`;

/** Working space is added around anything dug, but not around a bored pile. */
export const usesWorkingSpace = (measureTypeId: string) =>
  measureTypeId !== "piles";

export const isBelowGround = (measureTypeId: string, dimensions?: ElementDimensions) =>
  !!elementSpec(measureTypeId, dimensions).belowGround || measureTypeId === "piles";

export const hasReinforcementMat = (
  measureTypeId: string,
  dimensions?: ElementDimensions,
) => !!elementSpec(measureTypeId, dimensions).hasMat;

export type { GlobalParameters };
