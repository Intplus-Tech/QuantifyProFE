# Autodesk Platform Services (APS) integration

Routes RVT, NWD, DGN, DWG, and SKP through Autodesk's own viewer, embedded in
the workspace, instead of the "unsupported format" placeholder those five
used to show. See `components/projects/workspace/components/constants.ts` →
`VIEWER_MAP` for exactly which extensions are routed here
(`APS_VIEWER_EXTENSIONS` in `config.ts` is the single source of truth). DWG
and SKP each had a cheaper or free alternative on the table (a server-side
ODA converter for DWG; nothing for SKP, it has no sheets to measure from
regardless) but route through Autodesk anyway, by explicit choice, rather
than wait on that separate work.

**Status: credentials confirmed live, not yet verified against a real
model.** `APS_CLIENT_ID` / `APS_CLIENT_SECRET` / `APS_BUCKET_KEY` are set in
`.env` and have been exercised against Autodesk's real servers — token
exchange, bucket creation, and a file upload all succeeded. What's still
unverified is an actual RVT/NWD/DGN/DWG/SKP file translating and rendering
in the viewer — every test so far used a placeholder file, since translation
needs real CAD content to produce anything to look at. Every function in
this folder still checks `isApsConfigured()` first and fails with a clear
message rather than a raw network error, so the rest of the app stays
unaffected if these are ever unset again.

## What this does NOT do

This is the **embed-the-real-viewer** path, not the PDF-conversion path used
for JPG/PNG/DXF (`utils/drawingToPdf.ts`). Consequences:

- Measurements taken with Autodesk's own Measure tool (built into their
  viewer) do **not** flow into this app's BOQ pipeline. That tool is
  Autodesk's UI, running inside Autodesk's viewer — connecting it to
  `Measurement`/`LengthMeasurement` objects and the backend would be
  separate, not-yet-built work.
- These formats carry real-world units already (unlike a scanned PDF), so
  Autodesk's Measure tool needs no manual two-click calibration the way
  our own canvas does.

## What you need before this can run

1. An APS account at aps.autodesk.com (company-owned, not personal).
2. An "App" inside it, with **Model Derivative** and **Data Management**
   enabled — NOT Design Automation, that's a different, unrelated
   integration for converting RVT sheets to PDF.
3. Its Client ID / Client Secret → `.env` as `APS_CLIENT_ID` /
   `APS_CLIENT_SECRET`. Never prefix these `NEXT_PUBLIC_` — the secret must
   never reach the browser.
4. A bucket name of your choosing → `APS_BUCKET_KEY` (created automatically
   on first upload if it doesn't exist yet).
5. A payment method on the account — the free tier's exact monthly cap isn't
   published; it's visible in the APS console after signup.

## How a file gets from upload to on-screen

1. `ApsViewer.tsx` (client) fetches the source file, POSTs it as
   multipart form-data to `app/api/aps/upload`.
2. `upload/route.ts` → `lib/aps/oss.ts` pushes it to the APS bucket via the
   direct-to-S3 signed-URL flow, then `lib/aps/modelDerivative.ts` kicks off
   translation to SVF2.
3. `ApsViewer.tsx` polls `app/api/aps/status/[urn]` every 4s until the
   manifest reports `success` (or `failed`/`timeout` — surfaced to the user
   verbatim from Autodesk's own error message).
4. It loads the Autodesk Viewer SDK from Autodesk's own CDN (not bundled —
   most users never open one of these three formats) and calls
   `Autodesk.Viewing.Document.load(urn, ...)`.
5. The viewer's own `getAccessToken` callback calls `app/api/aps/viewer-token`
   for a viewables-read-only token, minted server-side — the browser never
   sees the client secret, only this narrowly-scoped, short-lived token.

## Cost awareness

Every upload here calls the Model Derivative API, which is billed per file
(≈$0.30–$1.50 depending on volume tier at the time this was written — see
the pricing conversation in project history, and reconfirm at
aps.autodesk.com/pricing-pilot before relying on it, Autodesk has changed
this model more than once). This now includes DWG and SKP, which had a
free-or-cheaper path available (a server-side ODA converter for DWG; nothing
for SKP either way) — routed through Autodesk anyway by explicit request,
so every DWG/SKP upload now costs a translation credit too, not just
RVT/NWD/DGN. IFC/FBX/OBJ stay off `APS_VIEWER_EXTENSIONS` — they already
have free viewers elsewhere in this folder (`IfcViewer.tsx`,
`ThreeViewer.tsx`) — and JPG/PNG/DXF stay off it too, converting to a
measurable PDF for free instead (`utils/drawingToPdf.ts`).

## Verifying this once real credentials exist

Nothing in this folder has been exercised against a live Autodesk account —
`tsc`/`eslint`/`next build` all pass, but that only proves the code is
well-formed, not that every endpoint shape here matches Autodesk's API
exactly. The first real test (upload one small RVT and watch it translate)
will most likely surface a small mismatch somewhere in `lib/aps/oss.ts` or
`lib/aps/modelDerivative.ts` — check the error message surfaced in
`ViewerErrorOverlay` first, it's passed through from Autodesk's own response
body wherever possible.
