"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { EnterpriseSidebar } from "@/components/dashboard/EnterpriseSidebar";
import { EnterpriseHeader } from "@/components/dashboard/EnterpriseHeader";
import AuthGuard from "@/components/layout/AuthGuard";

export default function EnterpriseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <EnterpriseSidebar />
        <div className="flex-1 flex flex-col w-full">
          <EnterpriseHeader />
          <main className="flex-1 overflow-y-auto bg-[#F4F7FE]">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
