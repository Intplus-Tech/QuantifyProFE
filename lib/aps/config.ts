/**
 * Autodesk Platform Services — configuration + credential guard.
 *
 * Every route under app/api/aps/* checks `isApsConfigured()` before touching
 * Autodesk at all, and returns a clear "not configured" response otherwise —
 * this app ships with these env vars blank until a real APS account exists
 * (see README.md in this folder), and nothing else in the workspace should
 * ever break because of that. RVT/NWD/DGN simply keep showing the same
 * "unsupported format" card they already show today.
 */

export const APS_HOST = "https://developer.api.autodesk.com";

// Formats routed to the Autodesk viewer instead of a free client-side one —
// see components/projects/workspace/components/constants.ts VIEWER_MAP.
// IFC/FBX/OBJ/STL/PLY/DAE already have working free viewers and stay off
// this list; DWG/DXF already convert to a measurable PDF for free and stay
// off it too (see utils/drawingToPdf.ts) — Autodesk costs money per file, so
// only the formats with no free alternative go through it.
export const APS_VIEWER_EXTENSIONS = [".rvt", ".nwd", ".dgn"] as const;

export function isApsExtension(ext: string): boolean {
  return (APS_VIEWER_EXTENSIONS as readonly string[]).includes(
    ext.toLowerCase(),
  );
}

interface ApsConfig {
  clientId: string;
  clientSecret: string;
  bucketKey: string;
}

export function getApsConfig(): ApsConfig | null {
  const clientId = process.env.APS_CLIENT_ID?.trim();
  const clientSecret = process.env.APS_CLIENT_SECRET?.trim();
  const bucketKey = process.env.APS_BUCKET_KEY?.trim();
  if (!clientId || !clientSecret || !bucketKey) return null;
  return { clientId, clientSecret, bucketKey };
}

export function isApsConfigured(): boolean {
  return getApsConfig() !== null;
}

export class ApsNotConfiguredError extends Error {
  constructor() {
    super(
      "Autodesk Platform Services isn't set up yet — APS_CLIENT_ID / APS_CLIENT_SECRET / APS_BUCKET_KEY are unset.",
    );
    this.name = "ApsNotConfiguredError";
  }
}
