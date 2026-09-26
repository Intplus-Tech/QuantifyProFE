/**
 * Model Derivative — turns an uploaded object into something the Autodesk
 * Viewer can stream (SVF2), and reports back on that translation's progress.
 *
 * Docs: https://aps.autodesk.com/en/docs/model-derivative/v2/tutorials/
 */

import { APS_HOST } from "./config";
import { getAppToken } from "./token";

export type ManifestStatus =
  | "pending"
  | "inprogress"
  | "success"
  | "failed"
  | "timeout";

export interface TranslationStatus {
  status: ManifestStatus;
  /** 0-100, best-effort — Model Derivative reports this as a string like "66%". */
  progress: number;
  /** Populated once status is "failed" or "timeout", for surfacing to the user. */
  errorMessage?: string;
}

/** Kicks off (or re-confirms — this call is idempotent) a translation job. */
export async function startTranslation(urn: string): Promise<void> {
  const token = await getAppToken();
  const res = await fetch(`${APS_HOST}/modelderivative/v2/designdata/job`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Required so translation jobs for an object created via the
      // direct-to-S3 upload flow are accepted.
      "x-ads-force": "false",
    },
    body: JSON.stringify({
      input: { urn },
      output: { formats: [{ type: "svf2", views: ["2d", "3d"] }] },
    }),
  });

  // 400 with "already exists"-shaped errors just means the job was already
  // submitted (e.g. the user reopened the same page) — treat as success and
  // let getTranslationStatus report the real state.
  if (!res.ok && res.status !== 400) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not start APS translation (${res.status}): ${body || res.statusText}`,
    );
  }
}

interface ManifestResponse {
  status?: string;
  progress?: string;
  derivatives?: { status?: string; progress?: string; messages?: { message?: string; type?: string }[] }[];
}

function parseProgress(raw?: string): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

export async function getTranslationStatus(
  urn: string,
): Promise<TranslationStatus> {
  const token = await getAppToken();
  const res = await fetch(
    `${APS_HOST}/modelderivative/v2/designdata/${encodeURIComponent(urn)}/manifest`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  // The manifest doesn't exist until the job has actually started processing
  // — a 404 right after submitting the job is normal, not an error.
  if (res.status === 404) return { status: "pending", progress: 0 };

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not read APS translation status (${res.status}): ${body || res.statusText}`,
    );
  }

  const manifest = (await res.json()) as ManifestResponse;
  const status = (manifest.status ?? "pending") as ManifestStatus;
  const progress = parseProgress(manifest.progress);

  if (status === "failed" || status === "timeout") {
    const message = manifest.derivatives
      ?.flatMap((d) => d.messages ?? [])
      .find((m) => m.type === "error")?.message;
    return { status, progress, errorMessage: message ?? "Translation failed." };
  }

  return { status, progress };
}
