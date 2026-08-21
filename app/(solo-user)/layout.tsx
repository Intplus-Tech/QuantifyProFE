"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import { usePathname } from "next/navigation";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { isValidObjectId } from "@/utils/apiError";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function SoloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // /projects/ai/... is the AI flow, not a project called "ai".
  const isAiFlow = segments[0] === "projects" && segments[1] === "ai";

  // Only treat the segment as a project id when it actually is one. Matching on
  // "anything that isn't 'new'" made /projects/ai/new fetch GET /projects/ai.
  const projectId =
    segments[0] === "projects" && !isAiFlow && isValidObjectId(segments[1])
      ? segments[1]
      : "";

  const { data: projectResponse } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });

  const isManualWorkspace =
    Boolean(projectId) && projectResponse?.data?.processingMode !== "ai";

  // The BOQ document is full-screen — it renders outside the dashboard chrome
  const isBoqDocument = Boolean(projectId) && segments[2] === "boq";

  // The AI screens carry their own chrome and size to the viewport.
  if (isAiFlow) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-[#f5f7fa]">{children}</main>
      </AuthGuard>
    );
  }

  if (isBoqDocument) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-[#dbe3eb]">{children}</main>
      </AuthGuard>
    );
  }

  if (isManualWorkspace) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-[#dbe3eb]">{children}</main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col w-full">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#F4F7FE] px-2 sm:px-6 pb-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
