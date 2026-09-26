import { NextRequest, NextResponse } from "next/server";
import { isApsConfigured } from "@/lib/aps/config";
import { uploadFileToAps } from "@/lib/aps/oss";
import { startTranslation } from "@/lib/aps/modelDerivative";

export const runtime = "nodejs"; // needs Buffer + streaming fetch bodies, not the edge runtime
export const maxDuration = 300; // large RVT/NWD files can take a while to relay to S3

/**
 * Accepts one RVT/NWD/DGN file (multipart form-data, field "file"), pushes it
 * to the APS bucket, and kicks off translation. Returns the URN the frontend
 * then polls via GET /api/aps/status/[urn] and eventually hands to
 * <ApsViewer urn=... />.
 */
export async function POST(req: NextRequest) {
  if (!isApsConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Autodesk Platform Services isn't configured yet. Set APS_CLIENT_ID / APS_CLIENT_SECRET / APS_BUCKET_KEY to enable RVT/NWD/DGN viewing.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { success: false, message: "No file provided." },
      { status: 400 },
    );
  }

  // A stable-per-drawing key, not the raw filename — two files with the same
  // name uploaded by different users must not collide as the same object.
  const objectKey =
    form?.get("objectKey")?.toString() || `${Date.now()}-${file.name}`;

  try {
    const urn = await uploadFileToAps(file, objectKey);
    await startTranslation(urn);
    return NextResponse.json({ success: true, data: { urn } });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "APS upload failed.",
      },
      { status: 502 },
    );
  }
}
