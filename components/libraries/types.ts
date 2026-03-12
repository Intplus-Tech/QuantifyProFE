import type { LucideIcon } from "lucide-react";

export interface LibraryCategory {
  id: string;
  name: string;
  count: number;
  icon: LucideIcon;
}

export interface LibraryItem {
  id: number;
  title: string;
  desc: string;
  unit: string;
  final: string;
  [key: string]: string | number;
}

/** Each column carries its own render function — eliminates category branching in the table */
export interface LibraryColumn {
  label: string;
  render: (item: LibraryItem) => React.ReactNode;
}

export interface LibraryCategoryData {
  title: string;
  subtitle: string;
  /** Middle columns only (between UNIT and FINAL RATE — those two are always fixed) */
  columns: LibraryColumn[];
  /** Default items shown when no location is selected or location has no specific data */
  items: LibraryItem[];
  /** Per-location item overrides. Falls back to `items` if a location has no entry. */
  locationItems?: Record<string, LibraryItem[]>;
}
