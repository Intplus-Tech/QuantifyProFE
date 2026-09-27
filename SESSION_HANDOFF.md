# Session handoff — read this first

Written to get a fresh Claude Code session oriented fast, without re-deriving
everything below from scratch. `CLAUDE.md` is the full living doc (auto-loaded
every session) — this file is a compressed pointer into the parts of it that
are mid-flight, plus context that isn't in CLAUDE.md yet.

**Branch:** `feat/measurement-session-boq-pipeline`
**Repo root:** this directory (`quantifyPro/`) — the parent `intplus/` is not
a git repo, don't run git commands from there.
**Working tree:** clean as of this handoff. **2 commits ahead of origin**
(`bde57b2`, `fc5ebd0`) — not pushed yet, push only if asked.

---

## Update (this session): the /bim/* pipeline is reconnected

The decision below was acted on. `NewProjectDialog` now has a third card,
**"CAD/BIM Upload"**, which opens the old `AiAnalysisContent` upload form
in-dialog (uncommented, unchanged) → `/processing` (`ProcessingView`, also
revived) → on completion, `createProjectFromBimBoq` creates a real project
with `source: "bim"`, `sourceJobId` (the backend's internal `BimJob._id`),
and a real `boqResult` from Autodesk's Properties API.

**Confirmed by reading the actual types** (`types/projects.ts`): a BIM
upload's `sourceJobId` returned at *upload* time is literally the Autodesk
Model Derivative **urn** (`BimUploadResponse.urn`) — the backend does its
own OSS upload + translation server-side, under its own credentials, wholly
separate from this session's earlier `lib/aps/*` proof-of-concept. So:

- `ProcessingView` now renders the real Autodesk viewer (`ApsViewer`) during
  processing, fed that urn directly (`urn={sourceJobId}`) — **zero extra
  Autodesk upload**, since a urn is already cached.
- On the **project's own page**, `ProjectWorkspaceView` now branches early:
  `backendProject.source === "bim"` renders a new, small
  `BimProjectWorkspace.tsx` instead of the PDF/CAD takeoff canvas — it looks
  up the project's `sourceJobId` (the Mongo `BimJob._id`, confirmed a
  *different* id from the urn) via `useGetBimJobByIdQuery`, reads `.urn` off
  the job record, and feeds that straight into `ApsViewer`. **Reopening the
  project never re-uploads** — the urn comes from the backend-persisted job,
  not from the non-persisted `manualWizard` Redux slice this whole problem
  was originally traced to.
- A "View BOQ" button routes to the existing `/boq` page, which already
  renders `project.boqResult` (the older `excel_boq_v1` shape) unchanged.

**Not yet verified — same caveat as before, now narrower in scope:**
translating a real (not placeholder) RVT/DWG/etc. file through this exact
path hasn't been watched end-to-end. If `ProcessingView`'s `bimJobId` !=
`sourceJobId`-as-urn assumption is ever wrong for some file type, the viewer
falls back to its normal error overlay (visible, not silent) rather than a
blank screen — but that's inference from reading the code, not a live run.

**Separately fixed, same session:** `DrawingHydrator` (in
`ProjectWorkspaceView.tsx`, used by the *older*, `manualWizard`-based
drawing-hydration path for ordinary manual/AI projects) used to silently do
nothing forever if its `getUpload`/`downloadUpload` queries errored on
reload — no toast, no error row, the drawing just never appeared. This is
almost certainly what "I upload to Autodesk, then reopen the project and see
nothing" was hitting for CAD/BIM files dropped into the *manual* wizard
(a different, still-live code path from the `/bim/*` one above — see
"What this session's Autodesk work still is good for" below, unchanged).
Fixed to surface a toast + a visible "error" row in the sidebar instead of
silence. This does **not** fix the re-upload cost on that path — only
`/bim/*`-sourced projects get real urn persistence; a BIM/CAD file uploaded
through the *manual* wizard's `StepDrawings.tsx` still re-uploads to
Autodesk on every reload, exactly as documented below. Worth revisiting
whether that path should even keep offering RVT/DWG/etc. now that the real
pipeline has its own entry point (flagged, not decided).

## The one open decision — read before touching anything Autodesk-related

This session built a **parallel** Autodesk integration (own bucket, own
upload route, own viewer embed) to prove APS credentials and the SDK work at
all. That proof succeeded — but investigating the backend mid-session found
it **already has a complete, separate BOQ-generation pipeline for CAD/BIM
files that this new work duplicates**, and does more than it (real
quantities, not just a viewer):

```
POST /bim/upload → GET /bim/status/{urn} → POST /bim/boq/{urn}
  → GET /bim/jobs/{jobId} → POST /bim/jobs/{jobId}/create-project
```

That pipeline's frontend side already exists in this repo too —
`ProcessingView.tsx`, `AiAnalysisContent.tsx`, `hooks/useFileAnalysisUpload.ts`
— but is **orphaned**: `NewProjectDialog` only offers "AI-Powered Processing"
and "Manual Entry" today; the BIM-job path got disconnected when the AI flow
was redesigned and was never reconnected.

**Current direction (agreed with the user, not yet built):** stop extending
the parallel `lib/aps/*` pipeline for BOQ purposes. Reconnect the backend's
existing `/bim/*` pipeline instead — likely a third option on the
New-Project screen, uploaded RVT/DWG/etc. becomes **its own new project**
(confirmed by the user — no merging with an existing project's PDF-measured
elements). The reasoning, if it needs re-justifying to anyone:

- The backend's pipeline reads **real model properties** (Volume, Area,
  Family, Type — via Autodesk's Properties API) for the BOQ. Manually
  bridging Autodesk's click-to-measure tool would only ever be as accurate
  as a mouse click, and can't do area at all in 3D view (Autodesk's own
  limitation, confirmed via their docs).
- The backend's pipeline already persists the URN against a job/project
  record server-side. This session's `lib/aps/*` pipeline does not — the
  `apsUrn` it caches lives in **Redux only**, resets on reload, and causes a
  real re-upload (and re-bill) every time a file is reopened cold. Reusing
  the backend's upload fixes this for free instead of needing new backend
  work of our own.
- Next concrete step, not yet done: open `ProcessingView.tsx` +
  `AiAnalysisContent.tsx` and check how much of the old wiring still works
  before deciding how to reconnect it.

**What NOT to do:** don't build a bridge from Autodesk's `Measure` extension
(`getMeasurementList()`, `MEASUREMENT_CHANGED_EVENT` — confirmed these exist
and are usable) into this app's own BOQ data shape. That was seriously
considered and set aside in favor of the above — re-raise only if the
backend's pipeline turns out to be broken or insufficient.

---

## What this session's Autodesk work still is good for

Not wasted — it's the thing that proved the account/credentials/SDK
actually work, and it's still what renders RVT/NWD/DGN/DWG/SKP for **viewing**
(not measuring) today:

- `lib/aps/{config,token,oss,modelDerivative}.ts` — 2-legged OAuth, direct-to-S3
  upload, translation + manifest polling. **Verified against the real
  Autodesk account**: token exchange, bucket creation, and a file upload all
  succeeded live (see `lib/aps/README.md`). Translation of an actual
  RVT/NWD/DGN/DWG/SKP file has **not** been verified — every live test used a
  placeholder file.
- `app/api/aps/{upload,status/[urn],viewer-token}/route.ts` — thin Next.js
  routes over the above, all gated by `isApsConfigured()` so nothing breaks
  if credentials are ever unset.
- `components/projects/workspace/viewers/ApsViewer.tsx` — embeds Autodesk's
  real viewer. `preview` prop (bare `Viewer3D`, no toolbar) for the
  project-creation wizard; full `GuiViewer3D` for the workspace. Accepts a
  cached `urn` + reports new ones via `onUrnResolved` so the same file isn't
  re-uploaded across the wizard → workspace handoff (still doesn't survive a
  reload — see the Redux-only caveat above).
- Wired into `VIEWER_MAP` (`components/projects/workspace/components/constants.ts`)
  for `.rvt .nwd .dgn .dwg .skp` — **all five**, by explicit user request,
  even though DWG/SKP each had a cheaper option on the table (a server-side
  ODA converter for DWG; nothing for SKP either way). This costs a real
  Autodesk translation credit per upload for all five now.
- `components/projects/workspace/ProjectWorkspaceView.tsx` — the workspace's
  own measuring tools (Length/Area/Count, calibration bar, "New Element")
  are disabled with an explanatory tooltip when an Autodesk-viewed file is
  open, since there's no Konva overlay behind Autodesk's viewer for them to
  act on. A "view only, not measurable here" chip shows in the top bar.

**Credentials:** real, live, working APS Client ID/Secret + bucket key
(`quantifypro-drawings`) are in the local `.env` (gitignored — **not in this
repo**, a fresh clone/new machine won't have them; ask the user or check
this machine's `.env` if picking this back up here). Don't echo the secret
value into chat or any file — an earlier turn this session had to remind the
user of that after they pasted it directly.

---

## Everything else this session shipped (done, not in question)

All on `feat/measurement-session-boq-pipeline`, `tsc`/`eslint`/`next build`
clean at every commit. Full detail is in `CLAUDE.md`'s "Known Issues" table
and its per-session sections — this is just the index:

| Fix | Commit(s) | One-line summary |
|---|---|---|
| BOQ finalize 400 "QS project type must be configured" | `437ac9e` | Wizard never set `qsProjectType`; added a Scope-of-Works field + a recovery dialog on `View BOQ` for already-created projects |
| Draggable BOQ row editor | `437ac9e` | Replaced the docked row-edit `Sheet` with a floating draggable card (new `useDraggablePanel` hook, reusable) |
| Pile shape-driven dimension fields | `49ef19d` | Circular/Square/Rectangular pile now shows the right dimension inputs, not always Diameter |
| Column Base/Pad "No of Base Type" | `603080a`, `a93af1e` | Repetition-multiplier field (backend already expected this under `count` — confirmed via spec) |
| **Root-cause scale-factor drift across pages** | `d361881` | `globalScaleFactor` was a single non-page-scoped React state; switching pages left it stuck on the previous page's calibration, silently mismeasuring everything. This was the actual cause of a previously-reported "1.2m reads as 3.04m" bug. Now resets synchronously per page, mirroring `useCanvasMeasurements`' own pattern. |
| Continuous (multi-segment) length tool | `d361881` | Length tool was hard-capped at 2 clicks; now click-to-add-vertex like the Area tool, finish with double-click/right-click/Enter |
| Calibration bar could look "ready" on an unscaled page | `6afb481` | Same root cause as the drift bug — `scaleInfo` wasn't reset with the factor |
| **Free PDF conversion for JPG/PNG/DXF** | `f97379a` | `utils/drawingToPdf.ts` — images embedded byte-for-byte via `pdf-lib`, DXF rendered to real vector via `dxf-parser`. Unlocks calibration/measuring/BOQ for these formats with zero backend/Autodesk involvement. DWG has no equivalent free path (would need a server-side ODA converter, not built). |
| Element list delete didn't stick | *(earlier session, already in CLAUDE.md)* | Blank `id` on created elements collided server-side; fixed with `crypto.randomUUID()` + a one-time migration to purge orphaned records |

---

## Things already researched — don't re-research these

- **APS pricing**: Flex tokens, ~$0.30–$1.50/file depending on volume tier,
  labeled "Pricing (Pilot)" by Autodesk (actively changing) — reconfirm at
  aps.autodesk.com/pricing-pilot before quoting a number to the user.
- **Design Automation (RVT→PDF sheet extraction)**: only 5 engines exist
  (AutoCAD, Revit, Inventor, 3ds Max, Fusion) — no Navisworks, no
  MicroStation. NWD/DGN have **no path** to a PDF via Autodesk, ever. This
  is a separate, smaller integration from the BOQ-pipeline question above
  and was explicitly **not** pursued — mentioned here only so it doesn't get
  proposed again as if new.
- **Autodesk Viewer's Measure tool**: no manual calibration needed for
  well-modeled files (real-world units travel with the translated file);
  area measurement doesn't work in 3D mode at all, distance only, unless the
  file has an actual 2D sheet view.
- **DGN via Model Derivative**: supported for translation/viewing, just not
  confirmed for SVF2 specifically (may fall back to SVF) — irrelevant to the
  current viewer setup either way.

---

## Working notes for whoever picks this up

- **Ports on this machine are frequently occupied by unrelated projects**
  (other Next.js apps the user has running). Always `lsof -i :PORT` before
  starting a dev server, and verify a curl response is genuinely this
  project (e.g. hit `/api/aps/viewer-token` and check for real APS JSON)
  before trusting it — this session hit a false-positive against an
  unrelated app on a collided port once.
- **The user default-prefers plan-then-build.** Several turns this session
  were explicitly "no code yet, give me a plan" — answer the question fully
  and concretely (with real research/verification where it matters, e.g. the
  APS pricing and Measure-tool research), then ask before implementing.
- **Verify against the real thing when the stakes are real** — this session
  distrusted its own APS plumbing until it was tested against the live
  Autodesk account (real token, real bucket, real upload), and distrusted
  the "it's obviously fine" instinct on the scale-drift bug until the exact
  mechanism was traced through the code. Don't assert something works
  without having actually run it when it's cheap to check.
- **Don't push without being asked.** This session's pattern was: implement,
  verify (`tsc`/`eslint`/`build`), commit locally, then wait for an explicit
  "commit and push" before pushing. The 2 unpushed commits noted at the top
  are exactly this — implemented and committed, not yet asked to push.
