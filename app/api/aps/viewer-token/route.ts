import { NextResponse } from "next/server";
import { isApsConfigured } from "@/lib/aps/config";
import { getViewerToken } from "@/lib/aps/token";

export const runtime = "nodejs";

/**
 * The only APS credential the browser ever sees: a viewables:read-only
 * token, minted server-side. ApsViewer's getAccessToken callback calls this
 * on load and again whenever the SDK says the token is about to expire.
 */
export async function GET() {
  if (!isApsConfigured()) {
    return NextResponse.json(
      { success: false, message: "Autodesk Platform Services isn't configured." },
      { status: 503 },
    );
  }

  try {
    const token = await getViewerToken();
    // The Viewer SDK's getAccessToken callback wants (token, expiresInSeconds).
    // 55 min is conservative against Autodesk's real 60 min token lifetime.
    return NextResponse.json({ success: true, data: { token, expiresIn: 55 * 60 } });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Could not get a viewer token.",
      },
      { status: 502 },
    );
  }
}
