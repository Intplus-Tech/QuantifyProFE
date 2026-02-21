"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { EnterpriseSidebar } from "@/components/dashboard/EnterpriseSidebar";
import { Header } from "@/components/dashboard/Header";

export default function EnterpriseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EnterpriseSidebar />
      <div className="flex-1 flex flex-col w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </SidebarProvider>
  );
}
