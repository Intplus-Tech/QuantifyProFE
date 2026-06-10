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
- **Max 10 files, 20 MB each**
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

### Phase 1 — Free (implement when ready)
**`@thatopen/components` + `web-ifc`** (MIT, $0 forever)
- Supports: `.ifc` only
- Runs 100% in browser, no cloud, no API key
- Install: `npm install @thatopen/components web-ifc`
- Replace `BimViewerPlaceholder` with `<IfcViewer url={file.previewUrl} />`

### Phase 2 — Paid (for RVT, DWG, NWD support)
**Autodesk Platform Services (APS)** — the only browser solution for proprietary formats

| Plan | ~Monthly Cost | Tokens | Use case |
|---|---|---|---|
| Free | $0 | 100/mo | Dev/testing only |
| Starter | ~$50–100 | 500/mo | <50 projects/month |
| Pro | ~$200–400 | 2,000/mo | Active production |
| Enterprise | Custom | Unlimited | High-volume |

**Implementation (3–4 days after credentials):**
1. Backend: `POST /api/aps/translate` + `GET /api/aps/status/:urn` + `POST /api/aps/token`
2. Frontend: `npm install @adsk/forge-viewer` → replace `BimViewerPlaceholder` with
   `<ApsViewer urn={drawing.urn} getToken={fetchApsToken} />`
3. Add `urn: string` field to `DrawingFile` interface in `manualWizardSlice.ts`

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

---

## Branching History (relevant)

| Branch | Description | Remote? |
|---|---|---|
| `main` | Production | ✅ pushed |
| `feat/2-step-wizard-canvas-workspace` | 2-step wizard + canvas workspace overhaul (current) | ❌ local only — DO NOT push without user confirmation |
| `5-manual-mode-integration` | Previous 4-step wizard integration (merged) | ✅ |
| `auth/integration` | Auth flow integration (merged) | ✅ |

Latest commit on `feat/2-step-wizard-canvas-workspace`: `feat: folder/page hierarchy sidebar + redesign to match Figma spec`

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

## Conventions

- **Colours:** Primary action = amber/orange (`bg-amber-500`). Workspace bg = `#dbe3eb`. Panel bg = `#f8fafc`. Sidebar header = `#fdf8f0`
- **Toasts:** Use `sonner` (`toast.success`, `toast.error`, `toast.warning`)
- **Form validation:** `react-hook-form` + `zod`
- **Icons:** `lucide-react` only
- **No comments** unless the WHY is non-obvious. No docstrings.
- **Simulated data / stubs** must have a clearly marked `// TODO:` swap comment
- **Git pushes:** Do NOT push to remote without explicit user confirmation. User has rejected pushes twice ("dont push"). Always ask before pushing.
