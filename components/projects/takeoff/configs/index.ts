/**
 * Takeoff Config Router
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the single entry-point used by TakeoffItemView.tsx.
 * It delegates to the correct section file based on the URL section + item.
 *
 * To add a completely new section (e.g. "external"):
 *  1. Create  configs/external.ts  following the same pattern.
 *  2. Import and call it in the router below.
 *  3. Register routes in ProjectWorkspaceLayout.tsx.
 *  4. Done — TakeoffItemView.tsx needs no changes.
 */

import { Settings2 } from "lucide-react";
import { getSubstructureConfig } from "./substructure";
import { getSuperstructureConfig } from "./superstructure";
import { getFinishingConfig } from "./finishing";
import type { TakeoffConfig } from "./types";

export type { TakeoffConfig };
export type {
  TakeoffColumn,
  TakeoffTableConfig,
  TakeoffSubTab,
  TakeoffTab,
} from "./types";

/**
 * Returns the TakeoffConfig for the given section + item URL slugs.
 * Falls back to a generic single-table config if no specific config exists.
 */
export function getTakeoffConfig(section: string, item: string): TakeoffConfig {
  let config: TakeoffConfig | null = null;

  if (section === "substructure") {
    config = getSubstructureConfig(item);
  } else if (section === "superstructure") {
    config = getSuperstructureConfig(item);
  } else if (section === "finishing") {
    config = getFinishingConfig(item);
  }

  // If a section-specific config was found, return it
  if (config) return config;

  // Generic fallback — used for any item not yet configured
  return {
    tabs: [
      {
        id: "general",
        label: "General Measurements",
        title: `${item.replace(/-/g, " ")} Details`,
        subtitle: "Enter measurements for this structural element.",
        icon: Settings2,
        columns: [
          { key: "id", label: "ID", readonly: true },
          { key: "description", label: "Description", highlight: true },
          { key: "length", label: "Length (m)", highlight: true },
          { key: "width", label: "Width (m)", highlight: true },
          { key: "qty", label: "Quantity", highlight: true },
        ],
        defaultRows: [{ id: "ITEM-1" }],
      },
    ],
  };
}
