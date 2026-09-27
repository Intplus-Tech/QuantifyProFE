/**
 * Autodesk Platform Services — configuration + credential guard.
 *
 * Every route under app/api/aps/* checks `isApsConfigured()` before touching
 * Autodesk at all, and returns a clear "not configured" response otherwise —
 * this app ships with these env vars blank until a real APS account exists
 * (see README.md in this folder), and nothing else in the workspace should
 * ever break because of that. Any extension below simply keeps showing the
 * same "unsupported format" card it already shows today.
 */

export const APS_HOST = "https://developer.api.autodesk.com";

// Formats routed to the Autodesk viewer — see
// components/projects/workspace/components/constants.ts VIEWER_MAP.
// IFC/FBX/OBJ/STL/PLY/DAE keep their own free client-side viewers (no reason
// to pay Autodesk for a format that already works for free); DXF/JPG/PNG
// keep converting to a measurable PDF for free too (utils/drawingToPdf.ts).
// DWG and SKP were free-alternative candidates too (DWG via a server-side
// ODA converter that was never built; SKP has no sheets to measure from) but
// route through Autodesk anyway by explicit choice, rather than waiting on
// that separate work — every remaining unsupported format goes through APS.
export const APS_VIEWER_EXTENSIONS = [
  ".rvt",
  ".nwd",
  ".dgn",
  ".dwg",
  ".skp",
] as const;

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
