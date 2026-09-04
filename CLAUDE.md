# QuantifyPro — Claude Context File

> This file tracks architectural decisions, implemented features, known patterns, and pending work
> discussed across all Claude Code sessions. Update it whenever a significant decision is made.

---

## Project Overview

**QuantifyPro** is a PlanSwift-style quantity surveying (QS) SaaS platform for the AEC (Architecture,
Engineering, Construction) industry. It allows QS professionals to:

- Create projects (manual entry or AI-assisted via BIM/PDF analysis)
- Upload drawing references (PDFs, images, BIM, CAD files)
- Perform quantity take-off on structural drawings
- Generate BOQ (Bill of Quantities) reports
- Manage clients, project libraries, and templates

**Stack:** Next.js 14 (App Router) · TypeScript · Redux Toolkit + RTK Query · Tailwind CSS ·
shadcn/ui · react-pdf · react-dropzone

**Repo:** `https://github.com/Intplus-Tech/QuantifyProFE`  
**Package name:** `quantify-pro`

---

## User Types

| Type | Route prefix | Notes |
|---|---|---|
| Solo user | `/` (dashboard, projects, etc.) | Individual QS professional |
| Enterprise user | `/enterprise/...` | Team/company account |

Both user types share the same workspace components — only the `basePath` prop differs.

---

## Route Structure

```
app/
├── (auth)/auth/           login, register, forgot-password, reset-password, verification
├── (solo-user)/
│   ├── dashboard/
│   ├── projects/
│   │   ├── new/           → Manual or AI project creation
│   │   └── [projectId]/
│   │       ├── page.tsx           → ProjectWorkspaceView (canvas)
│   │       ├── layout.tsx         → ProjectWorkspaceLayout
│   │       ├── boq/               → BOQ report
│   │       ├── configuration/     → Scope config (post-MVP)
│   │       ├── library/           → Project library
│   │       └── takeoff/[section]/[item]/  → Takeoff canvas
│   ├── clients/
│   ├── libraries/
│   ├── templates/
│   └── settings/
└── (enterprise-user)/enterprise/  mirrors solo-user structure
```

---

## Manual Project Creation Flow (Current — 2-step wizard)

> Overhauled in session: `feat/2-step-wizard-canvas-workspace`  
> Previously 4 steps (Project Details → Scope → Finishing → Metrics). Now 2 steps.

### Step 1 — Project Details (`StepProjectDetails.tsx`)
Fields: Project Name, Client Name (dropdown from API), Project ID/Ref, Street Address,
Currency, Project Type, Project Phase, Duration (months), Description.

### Step 2 — Drawing References (`StepDrawings.tsx`)
- Drag-and-drop via `react-dropzone`
- **Max 10 files, 200 MB each** (client-side cap — but PDFs/images still route through the
  backend's `/uploads` endpoint, which hard-caps at 50 MB; only CAD/BIM formats routed through
  `/bim/upload` support up to 200 MB. See "Known Issues" below.)
- Accepted formats: `.pdf` `.jpg` `.jpeg` `.png` `.rvt` `.ifc` `.nwd` `.skp` `.fbx` `.obj` `.dwg` `.dxf` `.dgn`
- Per-file state machine: `queued → uploading (%) → processing → complete | error`
- Upload is **simulated** — see swap point below
- Preview panel (right side): react-pdf for PDFs, `<img>` for images, placeholder for BIM/CAD

### After Step 2 — SaveSetupModal
"Your setup has been successfully saved." → Cancel | **Proceed to Workspace**

### Shell
`ManualSetupShell.tsx` — orchestrates both steps, calls `createProject` API on save,
navigates to workspace on proceed.

---

## Redux Store

### Registered reducers (store/index.ts)
```
baseApi          auth          company       library
credits          document      plans         clients
projects         manualWizard  projectWorkspace  takeoff
```

> **Important:** `store/index 2.ts` was a stale duplicate that had the correct reducers.
> It has been merged into `store/index.ts`. The `index 2.ts` file can be deleted.

### manualWizardSlice
```typescript
interface ManualWizardState {
  currentStep: number;          // 1 | 2
  details: Step2Data;           // project details form
  drawings: DrawingFile[];      // uploaded files (max 10)
  folders: DrawingFolder[];     // organisational folders (default: [{ id:'default', name:'DRAWINGS' }])
  draftSavedAt: number | null;
  createdProjectId: string | null;
}

interface DrawingFile {
  id, name, size, extension, category, status, progress
  previewUrl?       // blob URL — revoked on remove/reset
  uploadedUrl?      // backend URL after upload completes
  pages: DrawingPage[]   // populated when PDF loads in canvas (react-pdf onLoadSuccess)
  folderId: string | null
  pageCount?, error?
}

interface DrawingFolder { id, name, fileIds: string[] }
interface DrawingPage   { number: number; label: string }
```

Exported actions:
`goNextStep` `goBackStep` `setDetails`
`addDrawing` `updateDrawing` `removeDrawing` `setDrawingPages`
`addFolder` `renameFolder` `removeFolder` `moveDrawingToFolder`
`markDraftSaved` `setCreatedProjectId` `resetWizard`

Exported types: `DrawingFile` `DrawingFolder` `DrawingPage` `DrawingCategory` `DrawingStatus`

Key behaviours:
- `addDrawing` auto-assigns to first folder; creates default folder if none exists
- `setDrawingPages` is dispatched by the workspace canvas when `react-pdf` resolves `numPages`
- Blob URLs are revoked automatically on `removeDrawing` and `resetWizard`
- `removeFolder` moves orphaned files to the next available folder

---

## Workspace (Canvas View)

### Route: `/projects/[projectId]` (root of project)

`ProjectWorkspaceView.tsx` renders a **PlanSwift-style canvas** layout:

```
┌──────────────────────┬──────────────────────────────────────────┬─────────────┐
│ LEFT SIDEBAR         │  TOP BAR                                 │             │
│  • Header            │  🏠 > Workspace > [file] > Page N of M   │  ELEMENT    │
│  • DASHBOARD link    │                 Scale Locked | View BOQ  │  DETAIL     │
│  • TOOLS             ├──────────────────────────────────────────┤  PANEL      │
│    (6 tool buttons)  │  CANVAS                                  │  (count     │
│    colour palette    │  (PDF via react-pdf, img via <img>)       │   mode only)│
│  • ASSEMBLIES        │  BIM/CAD shows placeholder               │             │
│    (hidden in count) │                                          │             │
│  • DRAWINGS / ELEMENTS│  ┌───────────┐  bottom-left: zoom panel │             │
│    [search box]      │  │ - + ↔    │  bottom-right: page badge  │             │
│    shadcn Accordion  │  └───────────┘  "Page N — filename"      │             │
│    OR count mode     │                                          │             │
│    ELEMENTS panel    │                                          │             │
│    [+ Create Elements│                                          │             │
└──────────────────────┴──────────────────────────────────────────┴─────────────┘
                        ┌─────────────────────────────────────────────────────────┐
                        │ BOTTOM BAR (count mode only)                             │
                        │  Before scale: CALIBRATION REQUIRED + known-dist input  │
                        │  After scale:  Ready to measure + quick tips            │
                        └─────────────────────────────────────────────────────────┘
```

**Sidebar behaviour:**
- Folders use **shadcn `<Accordion type="multiple">`** — all can be open simultaneously
- Files within folders are plain buttons; active file is highlighted amber
- When a file is selected AND has `pages.length > 1`, its page sub-list expands beneath it
- Clicking a page → `selectedPage` state updates → canvas renders that exact page
- Pages are populated lazily: `react-pdf`'s `onLoadSuccess` dispatches `setDrawingPages`
- **New Folder** opens a dialog to name and create a `DrawingFolder` in Redux
- **Upload** triggers a hidden `<input type="file">`, uploads go into the first folder
- In **count mode**: ASSEMBLIES section hides; DRAWINGS card is replaced by ELEMENTS panel

**Canvas behaviour:**
- Breadcrumb: `🏠 > Workspace > [drawing name] > Page N of M`
- Floating zoom panel: bottom-left (ZoomIn / ZoomOut / Reset)
- Page badge: bottom-right — `Page N — drawing name`
- No drawing selected → "Viewing No Drawing..." empty state

**Top bar in count mode:**
- "Scale Locked" green badge appears once calibration is applied
- "View BOQ" amber button appears while count mode is active

---

### Count Tool Flow

Clicking the **Count** tool triggers a sequential modal flow:

1. **BBSQuestionModal** — "Does this drawing have a Bar Bending Schedule?"
   - Yes → BBSEntryModal
   - No / Skip → ScaleSetupModal directly

2. **BBSEntryModal** — table: BAR MARK, BAR SIZE (Select), LENGTH MM, QUANTITY
   - Save Schedule → ScaleSetupModal

3. **ScaleSetupModal** — "Would you like to scale for this page?"
   - Select what to measure (Pile / Column / Beam / etc.)
   - Yes → count mode active + calibration bottom bar + Element Detail Panel opens
   - No → same (scale can be set later)

4. **Count mode active** changes the workspace:
   - Bottom bar shows CALIBRATION REQUIRED → enter known distance → Apply Scale
   - After scale applied: "Ready to measure" + Lock Scale toggle + quick tips
   - ELEMENTS sidebar panel replaces DRAWINGS
   - "Scale Locked" + "View BOQ" appear in top bar
   - Element Detail Panel slides open on the right

---

### Element Detail Panel

A `290px` right-side panel that opens immediately when `ScaleSetupModal` is dismissed (regardless of Yes/No). Renders alongside the canvas.

**CONCRETE tab:**
- Tag input, Counts (static), Shape/Depth/Diameter/Plasticizers, Color swatch

**REBAR tab:**
- Rebar Input Method radio (Read from drawing / Enter manually)
- Main Bars table (Size Select, Number, Depth)
- Addition Bars table (same structure, with "+ Add Bar")
- Stirrups toggle + Size/Spacing when enabled
- Color swatch

**Footer buttons:**
- "Apply & Continue" — logs to console (TODO: persist to element)
- "+ Assign Element" — opens the Assign Element modal flow

The panel header shows the measure type from `ScaleSetupModal` (e.g. "PILE", "COLUMN") via the `measure` prop.

---

### Assign Element Modal Chain

Opens from "+ Assign Element" in the Element Detail Panel footer.

```
AssignItemsModal
  ├── "Create New Element" →  CreateNewElementModal
  │                             └── onCreate → toast + close
  │                             └── "Use Existing" → back to AssignItemsModal
  └── "Assign to Existing" →  ConfirmAssignmentModal
                                └── "Confirm Merge" → AssignmentCompleteModal
                                                        └── Close | View Element
```

- **AssignItemsModal**: radio cards (Create New / Assign to Existing), expandable element list with search
- **ConfirmAssignmentModal**: shows current/adding/new-total preview
- **AssignmentCompleteModal**: success state
- **CreateNewElementModal**: category folder + measurement unit selects, "Assign Pile Parameters" table

All modals support back-navigation (Cancel re-opens previous modal where appropriate).

---

### Sub-pages (BOQ, Takeoff, Configuration)
`ProjectWorkspaceLayout.tsx` detects `activeSegment`:
- `"/"` → passes children through directly (canvas owns full-screen layout)
- Anything else → wraps in sidebar nav layout with "← Back to Workspace" button

---

## File Upload — Swap Point for Real API

In `StepDrawings.tsx`, the `simulateUpload` function is the **only thing to replace**:

```typescript
// TODO: Replace with real API call when endpoint is available
async function simulateUpload(file: File, onProgress: (p: number) => void): Promise<{ url: string }> {
  // swap body with:
  //   const { url } = await uploadDrawingFile(file, { onProgress });
  //   return { url };
}
```

The rest of the upload pipeline (Redux state, progress animation, status badges,
preview rendering) is fully wired and will work without changes.

---

## BIM/3D Viewer — Current Status & Roadmap

### Current behaviour
`.rvt` `.ifc` `.nwd` `.skp` `.fbx` `.obj` `.dwg` `.dxf` `.dgn` files show a styled
placeholder card. Two swap points are marked with `/* SWAP POINT */` comments:

- `components/projects/manual/DrawingPreviewPanel.tsx` → `BimViewerPlaceholder`
- `components/projects/workspace/ProjectWorkspaceView.tsx` → `BimViewerPlaceholder`

### Phase 1 — Free Tier 1 (client-side, zero cloud cost)

Full implementation plan below. All libraries run 100% in the browser — no API keys, no cloud costs.

**Format coverage after Phase 1:**
`.ifc` `.dxf` `.dwg` `.fbx` `.obj` `.step` `.iges` `.stl` `.ply` `.dae`

---

#### Step 1 — IFC viewer (`@thatopen/components` + `web-ifc`)

**Install:**
```bash
npm install @thatopen/components web-ifc three
npm install -D @types/three
```

**WASM worker setup** — add to `next.config.js`:
```js
const CopyPlugin = require("copy-webpack-plugin");
config.plugins.push(
  new CopyPlugin({
    patterns: [{ from: "node_modules/web-ifc/web-ifc.wasm", to: "../public/web-ifc.wasm" }],
  })
);
```

**Create:** `components/projects/workspace/viewers/IfcViewer.tsx`
```tsx
"use client";
import { useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";

export function IfcViewer({ url, onFloorsResolved }: { url: string; onFloorsResolved: (count: number, labels: string[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, ref.current);
    world.camera = new OBC.SimpleCamera(components);
    components.init();
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    const ifcLoader = components.get(OBC.IfcLoader);
    ifcLoader.settings.wasm = { path: "/", absolute: true };
    async function load() {
      const buf = await (await fetch(url)).arrayBuffer();
      const model = await ifcLoader.load(new Uint8Array(buf));
      world.scene.three.add(model);
      const classifier = components.get(OBC.Classifier);
      await classifier.byStorey(model);
      const storeys = Object.keys(classifier.list.storeys ?? {});
      onFloorsResolved(storeys.length || 1, storeys.length ? storeys : ["3D View"]);
    }
    load().catch(console.error);
    return () => components.dispose();
  }, [url, onFloorsResolved]);
  return <div ref={ref} className="w-full h-full" />;
}
```

**Wire SWAP POINT** in `DrawingCanvas` (ProjectWorkspaceView.tsx):
- Condition: `drawing.category === "bim-3d" && drawing.extension === ".ifc" && drawing.previewUrl`
- Replace placeholder with `<IfcViewer url={drawing.previewUrl} onFloorsResolved={(count, labels) => onPageCountResolved(drawing.id, count)} />`
- Also wire in `DrawingPreviewPanel.tsx` for wizard Step 2 preview

**Effort:** ~1 day

---

#### Step 2 — DXF viewer (`dxf-viewer`)

**Install:**
```bash
npm install dxf-viewer three
```

**Create:** `components/projects/workspace/viewers/DxfViewer.tsx`
```tsx
"use client";
import { useEffect, useRef } from "react";
import { DxfViewer as DxfViewerLib } from "dxf-viewer";

export function DxfViewer({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const viewer = new DxfViewerLib(ref.current, { autoResize: true, colorCorrection: true });
    viewer.Load({ url, fonts: [] }).catch(console.error);
    return () => viewer.Destroy();
  }, [url]);
  return <div ref={ref} className="w-full h-full" />;
}
```

**Wire SWAP POINT:**
- Condition: `drawing.category === "cad-2d" && drawing.extension === ".dxf" && drawing.previewUrl`
- DXF is always 1 page (2D drawing) — `onPageCountResolved(drawing.id, 1)` after load

**Note:** DXF only — no DWG. DXF is the open exchange format; most CAD tools can export DXF from DWG.

**Effort:** ~half a day

---

#### Step 3 — DWG viewer (`@mlightcad/cad-viewer` — React wrapper)

**Install:**
```bash
npm install @mlightcad/cad-viewer vue @vue/runtime-dom
```

**Create:** `components/projects/workspace/viewers/DwgViewer.tsx`

DWG viewer is a Vue 3 component. Wrap it using a dynamic iframe or a thin Vue-in-React mount:
```tsx
"use client";
import { useEffect, useRef } from "react";

export function DwgViewer({ url }: { url: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  // Mount the Vue component into an isolated iframe that loads cad-viewer
  // The iframe src points to /api/dwg-viewer?url=<encoded> — a Next.js route
  // that serves a minimal HTML page bootstrapping the Vue cad-viewer component.
  const src = `/api/dwg-viewer?url=${encodeURIComponent(url)}`;
  return <iframe ref={ref} src={src} className="w-full h-full border-0" />;
}
```

**Create:** `app/api/dwg-viewer/route.ts` — serves the minimal Vue HTML bootstrap page.

**Covers:** DWG R14–AutoCAD 2020 + DXF via WASM (libdxfrw + LibreDWG).

**Effort:** ~1.5 days (Vue-in-React isolation adds complexity)

---

#### Step 4 — FBX + OBJ viewer (Three.js loaders)

**Install:** `three` is already a dependency from Steps 1–2.

**Create:** `components/projects/workspace/viewers/ThreeViewer.tsx`
```tsx
"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function ThreeViewer({ url, extension }: { url: string; extension: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    ref.current.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8edf2);
    const camera = new THREE.PerspectiveCamera(60, ref.current.clientWidth / ref.current.clientHeight, 0.1, 10000);
    const controls = new OrbitControls(camera, renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));
    const loader = extension === ".fbx" ? new FBXLoader() : new OBJLoader();
    loader.load(url, (obj) => {
      scene.add(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      camera.position.set(center.x, center.y + 20, center.z + 40);
      controls.target.copy(center);
      controls.update();
    });
    let animId: number;
    const animate = () => { animId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();
    return () => { cancelAnimationFrame(animId); renderer.dispose(); ref.current?.removeChild(renderer.domElement); };
  }, [url, extension]);
  return <div ref={ref} className="w-full h-full" />;
}
```

**Wire SWAP POINT:**
- Condition: `[".fbx", ".obj"].includes(drawing.extension) && drawing.previewUrl`
- FBX/OBJ are single-view 3D models → `onPageCountResolved(drawing.id, 1)` after load

**Effort:** ~half a day

---

#### Step 5 — Multi-format fallback (`online-3d-viewer`)

Covers: `.step` `.iges` `.stl` `.ply` `.dae` `.3dm` `.3ds` `.3mf` `.amf` `.brep` — 18+ formats in one library.

**Install:**
```bash
npm install online-3d-viewer
```

**Create:** `components/projects/workspace/viewers/MultiFormatViewer.tsx`
```tsx
"use client";
import { useEffect, useRef } from "react";
import { Init, SetMode, LoadModelFromUrlList } from "online-3d-viewer";

export function MultiFormatViewer({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    Init();
    SetMode(ref.current);
    LoadModelFromUrlList([url]);
  }, [url]);
  return <div ref={ref} className="w-full h-full" />;
}
```

**Wire SWAP POINT:** catch-all for any `bim-3d` or `cad-2d` extension not handled by Steps 1–4.

**Effort:** ~half a day

---

#### Summary — Tier 1 effort and coverage

| Step | Formats | Library | Effort |
|---|---|---|---|
| 1 | `.ifc` | `@thatopen/components` + `web-ifc` | ~1 day |
| 2 | `.dxf` | `dxf-viewer` | ~0.5 day |
| 3 | `.dwg` | `@mlightcad/cad-viewer` | ~1.5 days |
| 4 | `.fbx` `.obj` | Three.js loaders | ~0.5 day |
| 5 | `.step` `.iges` `.stl` `.ply` `.dae` + more | `online-3d-viewer` | ~0.5 day |
| **Total** | **10+ formats** | — | **~4 days** |

**Still requiring Tier 2 (paid/cloud) after Phase 1:** `.rvt` `.nwd` `.skp` `.dgn`

---

### Phase 2 — Tier 2 (server-side, proprietary formats)

**Option A — Speckle self-hosted (Apache-2.0, free to run):**
- Covers: `.rvt` `.nwd` `.skp` `.dgn` + all Tier 1 formats
- Converts server-side; embed `@speckle/viewer` in Next.js
- Requires hosting a Speckle server instance

**Option B — Autodesk Platform Services (APS):**

| Plan | ~Monthly Cost | Complex conversions/mo | Use case |
|---|---|---|---|
| Free | $0 | 20 | Dev/testing only |
| Starter | ~$50–100 | 500 | <50 projects/month |
| Pro | ~$200–400 | 2,000 | Active production |
| Enterprise | Custom | Unlimited | High-volume |

**APS implementation (3–4 days after credentials):**
1. Backend: `POST /api/aps/translate` + `GET /api/aps/status/:urn` + `POST /api/aps/token`
2. Frontend: `npm install @adsk/forge-viewer` → replace placeholder with `<ApsViewer urn={drawing.urn} getToken={fetchApsToken} />`
3. Add `urn?: string` field to `DrawingFile` interface in `manualWizardSlice.ts`
4. Viewer calls `onPageCountResolved(drawing.id, sheetCount)` on model load

---

## Key Components Map

| Component | Path | Purpose |
|---|---|---|
| `ManualSetupShell` | `components/projects/manual/` | 2-step wizard shell |
| `StepProjectDetails` | same | Step 1 form |
| `StepDrawings` | same | Step 2 upload |
| `DrawingFileList` | same | Reusable file list with status |
| `DrawingPreviewPanel` | same | Reusable preview (PDF + image + BIM placeholder) |
| `SaveSetupModal` | same | Post-save confirmation modal |
| `ProjectWorkspaceView` | `components/projects/workspace/` | Canvas workspace — main component |
| `ProjectWorkspaceLayout` | same | Layout wrapper (sidebar for sub-pages) |
| `workspaceMapper` | same | Builds workspace snapshot from wizard state |
| `manualWizardSlice` | `store/slices/` | Wizard Redux state |
| `projectWorkspaceSlice` | `store/slices/` | Per-project workspace snapshots (persisted) |
| `manualProjectApi` | `store/api/` | QS config, scope, finishing, metrics mutations |
| `projectsApi` | `store/api/` | CRUD, file upload, BIM processing, dashboard |

**Sub-components inside `ProjectWorkspaceView.tsx` (all co-located in same file):**

| Component | Purpose |
|---|---|
| `DrawingCanvas` | Renders PDF (react-pdf), image, or BIM placeholder |
| `FileRow` | Single drawing row + page sub-list in sidebar |
| `NewFolderDialog` | Modal to name a new drawing folder |
| `BBSQuestionModal` | Step 1 of Count flow — BBS yes/no |
| `BBSEntryModal` | Step 2 — BBS data entry table |
| `ScaleSetupModal` | Step 3 — page scale setup (measure type + yes/no) |
| `ElementDetailPanel` | Right-side panel: CONCRETE / REBAR tabs + apply/assign footer |
| `AssignItemsModal` | Assign flow step 1 — create new vs assign to existing |
| `ConfirmAssignmentModal` | Assign flow step 2 — merge preview |
| `AssignmentCompleteModal` | Assign flow step 3 — success state |
| `CreateNewElementModal` | Alternate assign path — new element form |

---

## API Patterns

- All API calls go through RTK Query via `baseApi` (axios base query)
- File uploads use `useUploadBimFileMutation` / `useUploadPdfBoqMutation` from `projectsApi`
- BIM translation polling: `useGetBimStatusQuery` with `pollingInterval`
- Manual project config is split across 4 endpoints in `manualProjectApi`:
  - `PATCH /projects/:id/manual/qs-config`
  - `PUT   /projects/:id/manual/scope/:foundationType`
  - `PATCH /projects/:id/manual/finishing`
  - `PATCH /projects/:id/manual/metrics`

---

## Known Issues / Tech Debt

| Issue | File | Notes |
|---|---|---|
| `store/index 2.ts` exists as stale duplicate | `store/` | Safe to delete |
| `types/auth.ts` and `types/templates.ts` are not proper modules | `types/` | Pre-existing TS errors, not caused by our changes |
| `StepScope`, `StepFinishing`, `StepMetrics` still exist | `components/projects/manual/` | Removed from wizard flow but files not deleted — safe to clean up |
| `app/layout.tsx` has a modification | `app/` | Review before next push |
| Drawing upload is simulated | `StepDrawings.tsx` | Swap point clearly marked with TODO comment |
| View BOQ finalize — exact failure mode unknown | `ProjectWorkspaceView.tsx` | Button now shows specific error toasts (404/400/5xx); user needs to report which one appears |
| Client-side upload cap (200 MB) exceeds what PDFs/images can actually clear | `StepDrawings.tsx` | All files (PDF, image, CAD/BIM) upload through the generic `/uploads` endpoint, which the backend hard-caps at 50 MB. A 50–200 MB PDF/image will pass the dropzone check and then fail at upload time. Only CAD/BIM formats get true 200 MB support, and only via the separate `/bim/upload` endpoint (APS translation flow), which `StepDrawings.tsx` doesn't call. |

---

## Branching History (relevant)

| Branch | Description | Remote? |
|---|---|---|
| `main` | Production | ✅ pushed |
| `feat/2-step-wizard-canvas-workspace` | 2-step wizard + canvas workspace overhaul (current) | ✅ pushed |
| `5-manual-mode-integration` | Previous 4-step wizard integration (merged) | ✅ |
| `auth/integration` | Auth flow integration (merged) | ✅ |

Latest commit on `feat/2-step-wizard-canvas-workspace`: `feat: count tool flow, element panel, assign element modal chain` (`738e845`)

---

---

## Session — Workspace Fixes & Auto-Save (2026-07-18 → 2026-07-20)

### 1. Source Dropdown on Manual Project Creation

Added a `source` field to the manual project creation form (Step 2).

- `PROJECT_SOURCES` constant in `components/projects/manual/constants.ts` — values: `manual`, `manual-drawn`, `pdf_boq`, `bim`, `template`
- `source: string` added to `Step2Data` interface (`components/projects/manual/types.ts`)
- `source: z.string().optional()` added to zod schema in `StepProjectDetails.tsx`
- `CreateManualProjectPayload.source` widened from `"manual"` literal to `string` (`types/manualProject.ts`)
- Transformer: `source: step2.source || "manual"` (`manualWizardTransformers.ts`)

---

### 2. Drawing Hydration Fix (document not showing in workspace)

**Root cause:** `backendProject.drawings` is empty for freshly-created projects. `DrawingHydrator` was never rendering.

**Fix:** `apiHydrateIds` in `ProjectWorkspaceView.tsx` now merges `backendProject.drawings` AND `savedSession.drawings` (from localStorage written by the wizard before navigation):

```typescript
const apiHydrateIds = useMemo(() => {
  const ids = new Set<string>(backendProject?.drawings ?? []);
  for (const d of savedSession.drawings ?? []) ids.add(d.id);
  return Array.from(ids);
}, [backendProject?.drawings, savedSession.drawings]);
```

`drawingsOpen` panel also auto-opens when `savedSession.drawings` is non-empty.

---

### 3. Color Picker Fix (Fix #2)

**Root cause:** Radix `<Select>` + `<SelectItem>` with `<div>` children causes a div-inside-span DOM nesting violation that prevents click events from registering.

**Fix:** Replaced both color pickers (Concrete tab and Rebar tab) in `ElementDetailPanel.tsx` with inline clickable `<button>` circles — no more Radix Select involved:

```tsx
<div className="flex gap-1.5 flex-wrap py-1">
  {PALETTE.map((c) => (
    <button
      key={c} type="button" onClick={() => onColorChange?.(c)}
      title={PALETTE_LABELS[c] ?? c}
      className={`w-6 h-6 rounded-full border-2 transition-all ${
        (activeColor ?? PALETTE[0]) === c
          ? "border-white ring-2 ring-slate-400 scale-110"
          : "border-transparent hover:scale-110"
      }`}
      style={{ backgroundColor: c }}
    />
  ))}
</div>
```

`PALETTE_LABELS` constant added to `components/projects/workspace/components/constants.ts` maps hex → human-readable name.

---

### 4. Cross-Page Element Visibility (Fix #1)

**Root cause:** Phase 2 hydration only loaded elements from the *current* active session. Switching pages wiped the Elements tab.

**Architecture change:** Phase 2 is now split into two:

**Phase 2 (unchanged in role):** Per-session canvas/calibration restore only (scale factor, canvas marks, known distance). Runs once per `activeSessionId`.

**Global element loader (new):** Runs once when `backendProject._id` first resolves. Fetches ALL project sessions in parallel via `fetchProjectSessions` + `fetchSessionById`, then merges ALL `_snapshot`-bearing elements across every session into a single global `elements` state. The Elements tab now shows work from every page simultaneously.

```typescript
const projectElementsLoaded = useRef(false);
useEffect(() => {
  if (projectElementsLoaded.current || !backendProject?._id) return;
  projectElementsLoaded.current = true;
  async function loadAllElements() {
    const sessionsResult = await fetchProjectSessions(projectId);
    // ... fetch all sessions in parallel, merge assigned + pending elements
  }
  loadAllElements();
}, [backendProject?._id, projectId]);
```

---

### 5. Undo/Redo Disabled State + Keyboard Shortcuts (Fix #3)

- Undo/Redo buttons in TOOLS bar are now `disabled` when `measurementHook.canUndo` / `canRedo` is false. Styling: `disabled:opacity-40 disabled:cursor-not-allowed`.
- Keyboard shortcuts added: `Cmd/Ctrl+Z` = undo, `Cmd/Ctrl+Shift+Z` or `Ctrl+Y` = redo. Wired via `useEffect` + `window.addEventListener("keydown", ...)`.

---

### 6. Skip BBS/Scale Prompts on Page Navigation (Fix #4)

**Problem:** Navigating to another page and clicking a tool triggered the full BBS → Scale Setup modal chain again, as if starting from scratch.

**Fix:** `handleToolClick` now checks `scaleFlowActive` first. If scale is already configured (from any previous page or session restore), clicking a tool directly activates it:

```typescript
function handleToolClick(id: ToolId) {
  if (id === "undo") { measurementHook.undo(); return; }
  if (id === "redo") { measurementHook.redo(); return; }
  if (scaleFlowActive) {
    setActiveTool(id);
    setCountModeActive(id === "count");
    setPendingTool(null);
    return;
  }
  setPendingTool(id);
  setBbsModalStep("question");
}
```

`scaleFlowActive` persists across page navigation (component-level state, only reset by `handleResetScale`).

---

### 7. Apply Scale ≠ Lock Scale

**Problem:** Clicking "Apply Scale" immediately locked the scale (`setScaleLocked(true)` was called inside `handleApplyScale`), bypassing the explicit "Lock Scale" toggle.

**Fix:** Removed `setScaleLocked(true)` and `scaleLocked: true` from `handleApplyScale`. The user must now explicitly toggle Lock Scale after confirming they are happy with the calibration.

Status header in the calibration bar now changes dynamically:
- Before apply: red dot + "CALIBRATION REQUIRED"
- After apply, before lock: amber dot + "SCALE APPLIED — Lock when ready"
- After lock: separate "Ready to measure" bar (unchanged)

---

### 8. Auto-Save (Continuous Variant Persistence)

**Problem:** The `concreteMeasurements` array (fed to `CreateNewElementModal`) was only populated when the user explicitly clicked "Apply & Continue". If they skipped that step and clicked "+ Assign Element", the modal showed empty.

**Solution:** Auto-save fires on every canvas mark and on every form field change.

#### Architecture

**`currentVariantId` ref** — stable UUID for the current measurement round. Used as `clientId` when upserting to backend so repeated saves are idempotent. Cycles (new UUID) when "Apply & Continue" is explicitly clicked.

**`handleAutoSave(formPayload?)`** in `ProjectWorkspaceView.tsx`:
- Builds a `WsConcreteMeasurement` using `currentVariantId.current` as ID
- Upserts/updates the entry in `concreteMeasurements` (no duplicates)
- Calls `upsertPendingVariant` to persist to backend
- Updates `autoSaveStatus`: `idle → saving → saved → idle`

**Canvas mark trigger:** `useEffect` on `measurementHook.state.measurements.length` — fires `handleAutoSave()` whenever a new mark is placed.

**Form field trigger:** `onFormChange` prop added to `ElementDetailPanel`. A `useEffect` inside the panel watches all form state (tag, concrete fields, rebar bars, stirrups) and fires `onFormChange` with a 700 ms debounce.

**"Apply & Continue" integration:** Now uses `currentVariantId.current` (same ID as auto-saves) to update the existing entry in place, then cycles to a new UUID. No duplicates ever appear.

#### Navbar autosave indicator

```tsx
{autoSaveStatus === "saving" ? (
  <span className="flex items-center gap-1 text-[10px] text-amber-500">
    <div className="w-2.5 h-2.5 border border-amber-400 border-t-transparent rounded-full animate-spin" />
    Saving...
  </span>
) : (
  <span className="flex items-center gap-1 text-[10px] text-slate-400">
    <Save className="w-3 h-3" /> Auto-saved just now
  </span>
)}
```

#### localStorage fixes

- `concreteMeasurements: []` removed from the on-mount localStorage wipe so pending measurements survive page refresh.
- Global element loader falls back to `loadSession(projectId).concreteMeasurements` if backend returns no pending variants.

#### Assign Element guard

If `concreteMeasurements` is somehow still empty when "+ Assign Element" is clicked (no drawings yet), a toast fires: "Take a measurement on the drawing first."

---

### 9. View BOQ — Error Visibility

**Problem:** Clicking "View BOQ" did nothing visible.

**Fix:** `handleViewBoq` now:
- Shows a warning toast if `activeSessionId` is null ("No active session")
- On API failure, shows a specific toast: 404 = "Session not found", 400 = "Cannot finalize: ensure at least one measurement is saved", otherwise shows the HTTP status code
- Navigation to `/boq` only happens on API success

**Status:** Root cause of the actual failure still unknown — user needs to check DevTools Network tab for the HTTP status on `POST /measurement-sessions/:id/finalize`.

---

### Key Files Modified This Session

| File | What changed |
|---|---|
| `components/projects/manual/types.ts` | Added `source: string` to `Step2Data` |
| `components/projects/manual/constants.ts` | Added `PROJECT_SOURCES`, `source: ""` default |
| `components/projects/manual/StepProjectDetails.tsx` | Source dropdown with Radix Select |
| `components/projects/manual/manualWizardTransformers.ts` | `source: step2.source \|\| "manual"` |
| `types/manualProject.ts` | Widened `source` to `string` |
| `components/projects/workspace/ProjectWorkspaceView.tsx` | Major — all session, auto-save, hydration, BBS/scale fixes |
| `components/projects/workspace/components/ElementDetailPanel.tsx` | Color swatch grid, `onFormChange` prop, debounced form auto-save |
| `components/projects/workspace/components/constants.ts` | Added `PALETTE_LABELS` |

---

## Workspace Sidebar — Visual Spec (last redesigned to match Figma)

| Section | Implementation |
|---|---|
| Sidebar width | `w-[248px]`, `bg-white` |
| Header | `bg-[#fdf8f0]` warm cream, amber-500 `LayoutGrid` icon (rounded-xl), bold project name + subtitle |
| DASHBOARD | `Home` icon, bold uppercase `tracking-widest` |
| TOOLS | `Wrench` label, 6× `w-9 h-9 rounded-lg` buttons (Length/Area/Count/Text/Undo/Redo), active = `bg-amber-500`; colour palette `h-7 rounded-lg border` |
| ASSEMBLIES | `Box` icon + label, no placeholder text |
| DRAWINGS card | `rounded-xl border border-slate-200 shadow-sm bg-white` inside `p-2` |
| Card header | Amber `FolderOpen` + **"DRAWINGS"** bold + `SlidersHorizontal` filter icon |
| FileRow active | `bg-amber-50 text-amber-700` |
| FileRow inactive | `text-slate-600 hover:bg-slate-50` |
| Page sub-list | `ml-6 border-l-2 border-amber-200 pl-4` |
| Card footer | "New Folder" (outlined) + "Upload" (`bg-amber-50`) inside card |

**Behaviour note:** Drawings uploaded during wizard creation auto-populate the DRAWINGS folder.
"New Folder" and "Upload" inside the card are secondary/backup controls.

---

## Session — Elemental BOQ (`boq_v2`) + inline "Add Client" (2026-09-04)

### 1. Add Client from the project-creation client dropdown

`AddClientDialog` already had an `onSuccess?` prop in its interface and both callers
(`StepProjectDetails.tsx` manual flow, `AiAnalysisContent.tsx` AI flow) passed a handler
to auto-select the new client — but the dialog **never called it**. Fixed: `AddClientDialog`
now destructures `onSuccess` and fires `onSuccess?.(result?.data)` on a successful
`createClient`. The dropdown's "Add New Client" item (shown when the list is empty and
pinned to the bottom otherwise) → dialog → new client returned and selected; the `Clients`
RTK tag refetch lists it. Also typed `onSuccess` as `(client: Client)` and cleaned the
`catch (err: any)`.

### 2. New BOQ page — elemental document (`boq_v2`)

Backend shipped an additive elemental BOQ contract. `boqResult` (excel_boq_v1, flat
`sections[]`) is **unchanged**; the new document sits beside it.

**New endpoints (all under `ApiEndpoints.projects.*`):**
| Endpoint | Purpose |
|---|---|
| `GET /projects/:id/boq-document` | The elemental document (`BoqDocument`) |
| `PATCH /projects/:id/boq-document/rows/:rowId` | Edit one row — send only changed fields; **response is the whole retotalled document** |
| `GET /projects/:id/material-takeoff` | Materials to purchase (`MaterialTakeoffResult`) — not the older `/takeoff/:id/material-schedule` |

Commit response (`POST /takeoff/:id/calculate/commit`) grew two keys: `boqDocument`,
`materialSchedule`. Library items gained optional `elementType` / `workType` for
rate-matching by what a row prices instead of description text.

**Document shape** (`types/boqDocument.ts`): `elementGroups[]` → `sections[]` → `rows[]`.
- `groupId` / `sectionId` / `rowId` are stable — key off these. `elementNo` renumbers every
  commit (display only, "ELEMENT NO. 1").
- `itemCode` runs continuously A–Z then AA across all sections in a group.
- `rowType`: `item` (money) · `note` / `header` / `spacer` (presentational — the Figma
  preamble blocks like "Disposal Of Ground Water" come through as `header` + `note` rows).
- `descriptionLeadIn` renders bold inline before `description`.
- `rate` / `amount` `null` → render **em dash, never ₦0** ("not yet priced"). Freshly
  committed docs are unpriced until library rates attach or a QS keys them in.
- Coverage is partial by design (~6 of 15 Figma groups) — build the group list from the
  response, never hard-code headings.
- `row.locked[]` lists QS-overridden fields; PATCH `unlock: [...]` hands them back.

**Frontend (`components/projects/boq-document/`):** `BOQDocumentView` was **replaced in
place** — same `/boq` route, same `{ projectId, basePath }` props. The workspace
"View BOQ" button (`ProjectWorkspaceView.tsx` `handleViewBoq`) already finalizes the
session with `commit: true` then routes to `/boq`; no change needed there.

| File | Role |
|---|---|
| `BOQDocumentView.tsx` | Fetches `useGetBoqDocumentQuery`; loading / 404-empty / error / doc states; owns the row-edit sheet + autosave status |
| `ProjectInfoPanel.tsx` | Left rail — Project Info + Quick Summary (from `summary.entries` + adjustments + grandTotal) + Refresh |
| `ElementGroupCard.tsx` | `ELEMENT NO. n: TITLE` card + element total, renders its sections |
| `SectionBlock.tsx` | SMM band (`D20: …`), 6-col table (ITEM/DESCRIPTION/QTY/UNIT/RATE/AMOUNT), row-type rendering, per-section footer (`+ Add item · Import CSV · Section Total`) |
| `RateCell.tsx` | Always-editable boxed rate input; commits on blur/Enter → `PATCH { rate }` |
| `RowEditSheet.tsx` | Right `Sheet` — edit description/leadIn/unit/qty/rate/itemCode + unlock toggles for locked fields |
| `GrandSummaryBlock.tsx` | `summary` block — entries table + adjustments + GRAND TOTAL |
| `BOQTopBar.tsx` | Reused; Save button replaced by an autosave chip (`saveStatus` prop) — every edit persists immediately |

Deleted (excel_boq_v1 document UI, superseded): `BillCard`, `SubsectionTable`,
`GrandSummaryCard`, `GrandTotalCard`, `EditItemDrawer`, `totals.ts`,
`mapProjectToBoqDocument.ts`, `dummy-data.ts`, `types.ts`, `BOQFooterBar`,
`InlineNumberCell`.

**RTK:** `store/api/boqDocumentApi.ts` (injected, registered in `store/index.ts`);
`"BoqDocument"` tag added to `baseApi`. `patchBoqDocumentRow.onQueryStarted` swaps the
`getBoqDocument` cache for the returned retotalled document.

**Spec:** `specs/quantifypro.json` (root key `swaggerDoc`) — added the 11 `Boq*` /
`MaterialTakeoff*` schemas + `PatchBoqRowRequest`, the 3 paths, `boqDocument` /
`materialSchedule` on the commit response, and `elementType` / `workType` on `LibraryItem`
and its create/patch bodies. `docs/api/openapi.json` left untouched.

### Still stubbed (toast "coming soon")
Export ▾, Export Excel, per-section "+ Add item" and "Import CSV". Print uses `window.print()`.

---

## Conventions

- **Colours:** Primary action = amber/orange (`bg-amber-500`). Workspace bg = `#dbe3eb`. Panel bg = `#f8fafc`. Sidebar header = `#fdf8f0`
- **Toasts:** Use `sonner` (`toast.success`, `toast.error`, `toast.warning`)
- **Form validation:** `react-hook-form` + `zod`
- **Icons:** `lucide-react` only
- **No comments** unless the WHY is non-obvious. No docstrings.
- **Simulated data / stubs** must have a clearly marked `// TODO:` swap comment
- **Git pushes:** Do NOT push to remote without explicit user confirmation. User has rejected pushes twice ("dont push"). Always ask before pushing.
