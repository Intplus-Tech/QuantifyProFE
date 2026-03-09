"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Library,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: Briefcase,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: FileText,
  },
  {
    href: "/libraries",
    label: "Libraries",
    icon: Library,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarComponent collapsible="icon" variant="sidebar">
      {/* Logo Header */}
      {/* <SidebarHeader className="pb-4">
        <Link href="/" className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Logo variant="contained" size="md" />
            <span className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden">
              Quantify Pro
            </span>
          </div>
        </Link>
      </SidebarHeader> */}

      {/* Navigation Content */}
      <SidebarContent className="px-0 mt-20">
        <SidebarMenu className="gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={
                    isActive
                      ? "bg-primary! text-white! [&_svg]:text-white! hover:bg-primary/90!"
                      : ""
                  }
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Logout Footer */}
      <SidebarFooter className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button className="cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
