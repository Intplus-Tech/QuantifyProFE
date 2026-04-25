"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { EnterpriseSidebar } from "@/components/dashboard/EnterpriseSidebar";
import { EnterpriseHeader } from "@/components/dashboard/EnterpriseHeader";
import AuthGuard from "@/components/layout/AuthGuard";
import { usePathname } from "next/navigation";

export default function EnterpriseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isWorkspaceRoute =
    segments[0] === "enterprise" &&
    segments[1] === "projects" &&
    Boolean(segments[2]) &&
    segments[2] !== "new";

  if (isWorkspaceRoute) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-[#dbe3eb]">{children}</main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <EnterpriseSidebar />
        <div className="flex-1 flex flex-col w-full">
          <EnterpriseHeader />
          <main className="flex-1 overflow-y-auto bg-[#F4F7FE] px-2 sm:px-6 pb-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
