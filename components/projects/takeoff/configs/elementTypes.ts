/**
 * All supported structural element types for manual takeoff.
 */
export type TakeoffElementType =
  | "column_in_foundation"
  | "pile_cap"
  | "ground_beam"
  | "raft_foundation"
  | "strip_foundation"
  | "pile"
  | "column"
  | "beam"
  | "slab"
  | "staircase"
  | "staircase_landing"
  | "staircase_strings_steps"
  | "staircase_upper_floors"
  | "wall"
  | "swimming_pool"
  | "oversite_slab"
  | "column_footing"
  | "pile_cap_frames"
  | "shear_wall"
  | "lift_wall"
  | "lintels"
  | "roof_column"
  | "roof_beam"
  | "kitchen_countertop"
  | "excavation_clearing"
  | "excavation_strip"
  | "ddt_pad_pit_in_strip"
  | "strip_length_calculator"
  | "pad_footing"
  | "ground_floor_bed"
  | "excavation_ground_beam"
  | "ground_floor_bed_void"
  | "water_slab"
  | "roof_slab"
  | "upper_floor_ddt_void"
  | "parapet_wall"
  | "parapet_wall_copping";

export const TAKEOFF_ELEMENT_TYPES: TakeoffElementType[] = [
  "column_in_foundation",
  "pile_cap",
  "ground_beam",
  "raft_foundation",
  "strip_foundation",
  "pile",
  "column",
  "beam",
  "slab",
  "staircase",
  "staircase_landing",
  "staircase_strings_steps",
  "staircase_upper_floors",
  "wall",
  "swimming_pool",
  "oversite_slab",
  "column_footing",
  "pile_cap_frames",
  "shear_wall",
  "lift_wall",
  "lintels",
  "roof_column",
  "roof_beam",
  "kitchen_countertop",
  "excavation_clearing",
  "excavation_strip",
  "ddt_pad_pit_in_strip",
  "strip_length_calculator",
  "pad_footing",
  "ground_floor_bed",
  "excavation_ground_beam",
  "ground_floor_bed_void",
  "water_slab",
  "roof_slab",
  "upper_floor_ddt_void",
  "parapet_wall",
  "parapet_wall_copping",
];
