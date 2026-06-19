"use client";

import dynamic from "next/dynamic";

// ManualSetupShell → DrawingPreviewPanel uses react-pdf (pdfjs-dist), which
// accesses browser-only APIs (DOMMatrix) at module evaluation time and cannot
// run in Node.js during SSR prerendering. `ssr: false` must be declared inside
// a Client Component, hence this thin wrapper.
const ManualSetupShell = dynamic(
  () =>
    import("@/components/projects/manual/ManualSetupShell").then(
      (m) => m.ManualSetupShell,
    ),
  { ssr: false },
);

export function NewProjectClient() {
  return <ManualSetupShell basePath="/projects" />;
}
