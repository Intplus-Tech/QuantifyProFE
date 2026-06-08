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
┌──────────────────────┬──────────────────────────────────────────┐
│ LEFT SIDEBAR         │  TOP BAR                                 │
│  • Header            │  🏠 > Workspace > [file] > Page N of M   │
│  • DASHBOARD link    │                        Auto-saved just now│
│  • TOOLS             ├──────────────────────────────────────────┤
│    (8 tool buttons)  │  CANVAS                                  │
│    colour palette    │  (PDF via react-pdf, img via <img>)       │
│  • ASSEMBLIES        │  BIM/CAD shows placeholder               │
│  • DRAWINGS          │                                          │
│    [search box]      │  ┌───────────┐  bottom-left: zoom panel  │
│    shadcn Accordion: │  │ - + ↔    │  bottom-right: page badge  │
│    ▼ FOLDER [n]      │  └───────────┘  "Page N — filename"      │
│      📄 file.pdf     │                                          │
│        Page 1        │                                          │
│        Page 2 ←sel   │                                          │
│      📄 file2.pdf    │                                          │
│    ▼ FOLDER 2 [n]    │                                          │
│    ──────────────    │                                          │
│    [New Folder][↑]   │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

**Sidebar behaviour:**
- Folders use **shadcn `<Accordion type="multiple">`** — all can be open simultaneously
- Files within folders are plain buttons; active file is highlighted amber
- When a file is selected AND has `pages.length > 1`, its page sub-list expands beneath it
- Clicking a page → `selectedPage` state updates → canvas renders that exact page
- Pages are populated lazily: `react-pdf`'s `onLoadSuccess` dispatches `setDrawingPages`
- **New Folder** opens a dialog to name and create a `DrawingFolder` in Redux
- **Upload** triggers a hidden `<input type="file">`, uploads go into the first folder

**Canvas behaviour:**
- Breadcrumb: `🏠 > Workspace > [drawing name] > Page N of M`
- Floating zoom panel: bottom-left (ZoomIn / ZoomOut / Reset)
- Page badge: bottom-right — `Page N — drawing name`
- No drawing selected → "Viewing No Drawing..." empty state

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
| `ProjectWorkspaceView` | `components/projects/workspace/` | Canvas workspace (main page) |
| `ProjectWorkspaceLayout` | same | Layout wrapper (sidebar for sub-pages) |
| `workspaceMapper` | same | Builds workspace snapshot from wizard state |
| `manualWizardSlice` | `store/slices/` | Wizard Redux state |
| `projectWorkspaceSlice` | `store/slices/` | Per-project workspace snapshots (persisted) |
| `manualProjectApi` | `store/api/` | QS config, scope, finishing, metrics mutations |
| `projectsApi` | `store/api/` | CRUD, file upload, BIM processing, dashboard |

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

| Branch | Description |
|---|---|
| `main` | Production |
| `feat/2-step-wizard-canvas-workspace` | 2-step wizard + canvas workspace overhaul (current) |
| `5-manual-mode-integration` | Previous 4-step wizard integration (merged) |
| `auth/integration` | Auth flow integration (merged) |

---

## Conventions

- **Colours:** Primary action = amber/orange (`bg-amber-500`). Workspace bg = `#dbe3eb`. Panel bg = `#f8fafc`
- **Toasts:** Use `sonner` (`toast.success`, `toast.error`, `toast.warning`)
- **Form validation:** `react-hook-form` + `zod`
- **Icons:** `lucide-react` only
- **No comments** unless the WHY is non-obvious. No docstrings.
- **Simulated data / stubs** must have a clearly marked `// TODO:` swap comment
