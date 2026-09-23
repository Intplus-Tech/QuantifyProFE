import { NextRequest, NextResponse } from "next/server";
import { isApsConfigured } from "@/lib/aps/config";
import { getTranslationStatus } from "@/lib/aps/modelDerivative";

export const runtime = "nodejs";

/** Polled by the frontend after /api/aps/upload until status is "success". */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ urn: string }> },
) {
  if (!isApsConfigured()) {
    return NextResponse.json(
      { success: false, message: "Autodesk Platform Services isn't configured." },
      { status: 503 },
    );
  }

  const { urn } = await params;
  try {
    const status = await getTranslationStatus(urn);
    return NextResponse.json({ success: true, data: status });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Could not read translation status.",
      },
      { status: 502 },
    );
  }
}
