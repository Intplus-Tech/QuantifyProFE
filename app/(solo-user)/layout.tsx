"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F4F7FE]">{children}</main>
      </div>
    </SidebarProvider>
  );
}
