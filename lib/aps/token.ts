/**
 * 2-legged OAuth (Client Credentials grant) against APS Authentication v2.
 * "2-legged" = app-to-app — there's no QuantifyPro user login involved, this
 * app authenticates as itself. Two different scopes are needed:
 *
 *  - an app-only token (bucket/data/viewable write) for the server to upload
 *    and translate files — never leaves this process.
 *  - a viewables:read-only token, minted fresh per request and handed to the
 *    browser, so the Autodesk Viewer running client-side can stream a
 *    translated model without the browser ever holding write access or the
 *    client secret.
 *
 * Docs: https://aps.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token
 */

import { APS_HOST, ApsNotConfiguredError, getApsConfig } from "./config";

export type ApsScope =
  | "data:read"
  | "data:write"
  | "data:create"
  | "bucket:create"
  | "bucket:read"
  | "viewables:read";

interface CachedToken {
  token: string;
  /** Epoch ms — refresh a little before this, not exactly at it. */
  expiresAt: number;
}

// One cache entry per distinct scope set requested, kept for the life of this
// server process. Not persisted anywhere — every route re-derives what it
// needs from getApsConfig() and this cache, so a fresh deploy just refetches.
const cache = new Map<string, CachedToken>();

async function requestToken(scopes: ApsScope[]): Promise<CachedToken> {
  const config = getApsConfig();
  if (!config) throw new ApsNotConfiguredError();

  const basic = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const res = await fetch(`${APS_HOST}/authentication/v2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: scopes.join(" "),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `APS token request failed (${res.status}): ${body || res.statusText}`,
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  return {
    token: data.access_token,
    // Refresh 60s early so an in-flight request never gets handed a token
    // that expires mid-call.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

export async function getApsToken(scopes: ApsScope[]): Promise<string> {
  // Sort order only matters for a stable cache key, never for the request
  // itself — the scope string is space-joined either way.
  const key = [...scopes].sort((a, b) => a.localeCompare(b)).join(" ");
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const fresh = await requestToken(scopes);
  cache.set(key, fresh);
  return fresh.token;
}

/** The full-access token this server uses to talk to APS on its own behalf. */
export function getAppToken(): Promise<string> {
  return getApsToken([
    "data:read",
    "data:write",
    "data:create",
    "bucket:create",
    "bucket:read",
  ]);
}

/**
 * A read-only token safe to hand to the browser — cached under its own
 * scope key, entirely separate from getAppToken()'s write/bucket-scoped one,
 * so a viewer session can never end up holding write access.
 */
export function getViewerToken(): Promise<string> {
  return getApsToken(["viewables:read"]);
}
