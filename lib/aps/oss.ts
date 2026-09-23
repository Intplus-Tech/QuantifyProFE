/**
 * Data Management OSS (Object Storage Service) — gets a file into an APS
 * bucket so Model Derivative has something to translate. APS moved uploads to
 * a direct-to-S3 flow: this server never proxies the file bytes itself, it
 * only asks OSS for a pre-signed S3 URL, and whoever has the file PUTs
 * straight to S3.
 *
 * Docs: https://aps.autodesk.com/en/docs/data/v2/tutorials/upload-file/
 */

import { APS_HOST, getApsConfig, ApsNotConfiguredError } from "./config";
import { getAppToken } from "./token";

// Module-scope cache — survives only as long as this server process/instance
// does (a serverless cold start resets it). Safe either way: ensureBucket()
// tolerates the bucket already existing, so a reset just means one extra,
// harmless 409 the next time it's called.
let bucketEnsured = false;

/**
 * Buckets are created once and reused forever — re-creating an existing one
 * is a 409, which this treats as success. "persistent" = files stay until
 * explicitly deleted, matching every other uploaded drawing in this app.
 */
async function ensureBucket(): Promise<void> {
  if (bucketEnsured) return;
  const config = getApsConfig();
  if (!config) throw new ApsNotConfiguredError();

  const token = await getAppToken();
  const res = await fetch(`${APS_HOST}/oss/v2/buckets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketKey: config.bucketKey,
      policyKey: "persistent",
    }),
  });

  // 409 Conflict = bucket already exists, which is the steady-state case.
  if (!res.ok && res.status !== 409) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not create/confirm APS bucket "${config.bucketKey}" (${res.status}): ${body || res.statusText}`,
    );
  }
  bucketEnsured = true;
}

interface SignedUploadUrls {
  uploadKey: string;
  urls: string[];
}

async function getSignedUploadUrls(
  objectKey: string,
  parts: number,
): Promise<SignedUploadUrls> {
  const config = getApsConfig();
  if (!config) throw new ApsNotConfiguredError();
  const token = await getAppToken();

  const res = await fetch(
    `${APS_HOST}/oss/v2/buckets/${encodeURIComponent(config.bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload?parts=${parts}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not get a signed upload URL (${res.status}): ${body || res.statusText}`,
    );
  }
  return res.json();
}

async function completeUpload(
  objectKey: string,
  uploadKey: string,
): Promise<{ objectId: string }> {
  const config = getApsConfig();
  if (!config) throw new ApsNotConfiguredError();
  const token = await getAppToken();

  const res = await fetch(
    `${APS_HOST}/oss/v2/buckets/${encodeURIComponent(config.bucketKey)}/objects/${encodeURIComponent(objectKey)}/signeds3upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uploadKey }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not finalise the APS upload (${res.status}): ${body || res.statusText}`,
    );
  }
  return res.json();
}

/** S3's own multipart limit — a single pre-signed PUT tops out here. */
const S3_PART_LIMIT_BYTES = 100 * 1024 * 1024;

/**
 * Uploads one file to the APS bucket and returns its Model Derivative URN
 * (base64url of the OSS object id — what every downstream call keys off).
 * `objectKey` should be unique per upload; the caller's own drawing id is a
 * good choice so re-uploads under a new id never collide with an old object.
 */
export async function uploadFileToAps(
  file: Blob,
  objectKey: string,
): Promise<string> {
  await ensureBucket();

  const parts = Math.max(1, Math.ceil(file.size / S3_PART_LIMIT_BYTES));
  const { uploadKey, urls } = await getSignedUploadUrls(objectKey, parts);

  const partSize = Math.ceil(file.size / parts);
  for (let i = 0; i < parts; i++) {
    const chunk = file.slice(i * partSize, Math.min((i + 1) * partSize, file.size));
    const putRes = await fetch(urls[i], { method: "PUT", body: chunk });
    if (!putRes.ok) {
      throw new Error(
        `Upload to S3 failed on part ${i + 1}/${parts} (${putRes.status})`,
      );
    }
  }

  const { objectId } = await completeUpload(objectKey, uploadKey);

  // Model Derivative wants base64url (no padding) of the raw object id.
  return Buffer.from(objectId)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
