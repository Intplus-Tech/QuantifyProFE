# QuantifyPro

A PlanSwift-style quantity surveying (QS) SaaS platform built with Next.js 14, TypeScript, Redux Toolkit, and Tailwind CSS.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Auth Bypass (Offline / No Server Mode)

When the backend server is unavailable, authentication can be bypassed so you can
load the workspace and review UI changes without needing a live API connection.

### How to disable auth (bypass mode ON)

Open **`components/layout/AuthGuard.tsx`** and ensure the flag at the top reads:

```ts
const BYPASS_AUTH = true;
```

That single line makes `AuthGuard` pass all routes straight through to the page,
skipping token checks, profile fetches, and login redirects entirely.

Navigate directly to a workspace URL, for example:

```
http://localhost:3000/projects/demo-project-123
```

The workspace will load using fallback data (project name shows as
`Project demo-pro…` since the API is offline — this is expected).

### How to re-enable auth (bypass mode OFF)

1. Open **`components/layout/AuthGuard.tsx`**
2. Change the flag to:
   ```ts
   const BYPASS_AUTH = false;
   ```
3. Run `npm run build` to confirm no type errors
4. All original auth logic — token checks, session expiry polling, profile
   sync, and login redirects — is preserved in the file below the bypass block
   and will activate automatically

> **Nothing else needs to change.** The bypass only affects `AuthGuard.tsx`.
> RTK Query API calls will still fire but will gracefully fall back to empty
> data when the server is unreachable.

---

## Project Structure

```
app/
├── (auth)/auth/           Login, register, forgot-password, verification
├── (solo-user)/           Individual user routes (dashboard, projects, etc.)
└── (enterprise-user)/     Enterprise team routes (mirrors solo-user)

components/
├── layout/AuthGuard.tsx   ← Auth gate (see bypass instructions above)
├── projects/workspace/    ProjectWorkspaceView — main canvas component
└── dashboard/             Sidebar, Header

store/                     Redux Toolkit slices + RTK Query APIs
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
