/**
 * The extraction panel, toasts and report notes render text that originates
 * server-side, which means it arrives written for engineers: provider and
 * model names, snake_case element enums, "OCR", "schema", raw JSON fragments.
 * Everything shown to a surveyor goes through here first.
 */

/** snake_case / kebab-case element ids → the label used on the measure tiles. */
const ELEMENT_WORDS: Record<string, string> = {
  pile: "Piles",
  pile_cap: "Pile Caps",
  pile_cap_frames: "Pile Cap Frames",
  ground_beam: "Ground Beams",
  raft_foundation: "Raft Foundations",
  strip_foundation: "Strip Foundations",
  pad_footing: "Pad Footings",
  column: "Columns",
  column_footing: "Column Footings",
  column_in_foundation: "Columns in Foundation",
  beam: "Beams",
  slab: "Slabs",
  oversite_slab: "Oversite Slabs",
  water_slab: "Water Slabs",
  roof_slab: "Roof Slabs",
  staircase: "Stairs",
  staircase_landing: "Stair Landings",
  staircase_strings_steps: "Stair Strings & Steps",
  staircase_upper_floors: "Upper Floor Stairs",
  wall: "Walls",
  shear_wall: "Shear Walls",
  lift_wall: "Lift Walls",
  parapet_wall: "Parapet Walls",
  parapet_wall_copping: "Parapet Copping",
  lintels: "Lintels",
  roof_column: "Roof Columns",
  roof_beam: "Roof Beams",
  swimming_pool: "Swimming Pools",
  kitchen_countertop: "Kitchen Countertops",
  ground_floor_bed: "Ground Floor Beds",
  ground_floor_bed_void: "Ground Floor Voids",
  upper_floor_ddt_void: "Upper Floor Voids",
  excavation_clearing: "Site Clearing",
  excavation_strip: "Strip Excavation",
  excavation_ground_beam: "Ground Beam Excavation",
  ddt_pad_pit_in_strip: "Pad Pits in Strip",
  strip_length_calculator: "Strip Lengths",
};

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** One server element type → the words a surveyor would use. */
export const elementTypeLabel = (type: string): string =>
  ELEMENT_WORDS[type] ?? titleCase(type);

export const elementTypeLabels = (types: string[] = []): string =>
  [...new Set(types.map(elementTypeLabel))].join(", ");

/**
 * Phrases that mean something to whoever wrote the backend and nothing to the
 * person reading the screen. Order matters — longer phrases run first so a
 * short rule can't chop a longer one in half.
 */
const PLAIN_ENGLISH: [RegExp, string][] = [
  // Provider / model identifiers, in any of the shapes they arrive in.
  [/\b(?:anthropic|openai|google|gemini|vertex|azure|bedrock)\s*[·:/|-]\s*[\w.\-]+/gi, ""],
  [/\bclaude[\w.\-]*\b/gi, ""],
  [/\bgpt-[\w.\-]+\b/gi, ""],
  [/\b(?:anthropic|openai|vertex ai|bedrock)\b/gi, ""],
  [/\b(?:llm|vlm|vision model|language model|the model)\b/gi, "the analysis"],

  // Pipeline vocabulary.
  [/\boptical character recognition\b/gi, "text reading"],
  [/\bocr(?:'?e?d|ing)?\b/gi, "text reading"],
  [/\bbounding box(?:es)?\b/gi, "outline"],
  [/\bnormalised coordinates\b/gi, "positions"],
  [/\bconfidence score\b/gi, "confidence"],
  [/\btoken(?:s|ised|ized)?\b/gi, ""],
  [/\bprompt(?:s|ing)?\b/gi, ""],
  [/\binference\b/gi, "analysis"],
  [/\bpayload\b/gi, "data"],
  [/\bschema\b/gi, "data format"],
  [/\bendpoint\b/gi, "service"],
  [/\bapi\b/gi, "service"],
  [/\benum(?:eration)?\b/gi, "list"],
  [/\bparse[sd]?\b/gi, "read"],
  [/\bparsing\b/gi, "reading"],
  [/\bnull\b/gi, "not given"],
  [/\bboolean\b/gi, "yes/no"],
  [/\bregex\b/gi, "search pattern"],
  [/\bstack trace\b/gi, "error detail"],
  [/\bbackend\b/gi, "server"],
  [/\brequested?ElementTypes\b/g, "selected elements"],
];

/** A run of raw JSON or a bracketed object dumped mid-sentence. */
const JSON_BLOCK = /\{[^{}]*\}|\[[^\[\]]*\]{1}/g;

/**
 * Rewrite server prose so it reads as plain English.
 *
 * This is a presentation filter, not a truth filter — figures, element names,
 * page numbers and the surveyor-facing caveats all survive; only the
 * engineering vocabulary around them is replaced.
 */
export function humaniseText(raw?: string | null): string {
  if (!raw) return "";

  let text = String(raw);

  // Drop JSON fragments before word rules run, so their keys aren't rewritten
  // into sentences that then read as if they were prose.
  text = text.replace(JSON_BLOCK, " ");

  for (const [pattern, replacement] of PLAIN_ENGLISH) {
    text = text.replace(pattern, replacement);
  }

  // Snake_case survivors are almost always element types.
  text = text.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (match) => elementTypeLabel(match));

  return text
    .replace(/\s*[·|]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,.;:])\1+/g, "$1")
    .replace(/^[\s,.;:·|-]+/, "")
    .trim();
}

/**
 * Shorten long server notes to a readable lead. Returns the whole thing plus a
 * flag, so the caller can offer "show more" rather than silently truncating.
 */
export function summariseNotes(
  raw?: string | null,
  limit = 260,
): { short: string; full: string; truncated: boolean } {
  const full = humaniseText(raw);
  if (full.length <= limit) return { short: full, full, truncated: false };

  const cut = full.slice(0, limit);
  const boundary = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return {
    short: `${cut.slice(0, boundary > 80 ? boundary : limit).trim()}…`,
    full,
    truncated: true,
  };
}
