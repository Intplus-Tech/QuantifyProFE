/**
 * Takeoff Route Permissions Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTE: DO NOT WIRE THIS INTO THE UI YET.
 * This is isolated business logic meant to be integrated once all screens are 
 * fully built. It controls which sidebar navigation links are visible based on 
 * the project's foundation type.
 */

export type FoundationType = "Pile" | "Raft" | "Strip" | "Raft Pile with basement" | string;

export interface TakeoffPermissions {
  /** Should the entire Superstructure section be visible? */
  showSuperstructure: boolean;
  /** Should the entire Finishing section be visible? */
  showFinishing: boolean;
  /** Which specific routes under Substructure should be visible? */
  allowedSubstructureRoutes: string[];
}

/**
 * Determines which takeoff links should be rendered in the sidebar.
 * 
 * Rules:
 * - "Pile": Has NO superstructure and NO finishes. Just foundation (substructure).
 * - "Strip": Superstructure/Finishing allowed. Substructure: strip-foundation, ground-beam, column-in-foundation.
 * - "Raft Pile with basement": Superstructure/Finishing allowed. Substructure: pile-cap, ground-beam, column-in-foundation.
 * - "Raft": Currently configured to mirror "Strip" per temporary requirements.
 * 
 * @param foundationType The foundationType string from the project snapshot
 * @returns An object containing permissions for sections and routes
 */
export function getTakeoffPermissions(foundationType: FoundationType): TakeoffPermissions {
  const type = foundationType?.toLowerCase() || "";

  // 1. PILE ALONE
  if (type === "pile") {
    return {
      showSuperstructure: false,
      showFinishing: false,
      // Default pile substructure allowed
      allowedSubstructureRoutes: ["pile-cap", "ground-beam", "column-in-foundation"],
    };
  }

  // 2. RAFT PILE WITH BASEMENT
  if (type === "raft pile with basement") {
    return {
      showSuperstructure: true,
      showFinishing: true,
      allowedSubstructureRoutes: ["pile-cap", "ground-beam", "column-in-foundation"],
    };
  }

  // 3. STRIP (and RAFT mirroring STRIP for now)
  if (type === "strip" || type === "raft") {
    return {
      showSuperstructure: true,
      showFinishing: true,
      allowedSubstructureRoutes: ["strip-foundation", "ground-beam", "column-in-foundation"],
    };
  }

  // DEFAULT (Fallback)
  return {
    showSuperstructure: true,
    showFinishing: true,
    allowedSubstructureRoutes: ["pile-cap", "strip-foundation", "ground-beam", "column-in-foundation"],
  };
}
