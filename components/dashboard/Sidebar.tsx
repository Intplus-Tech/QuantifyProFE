"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  DashboardIcon,
  ProjectIcon,
  ClientIcon,
  TemplateIcon,
  LibraryIcon,
  SettingIcon,
} from "./Icons";
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
import { signOut } from "next-auth/react";
import { removeToken } from "@/utils/tokenManager";
import { useToastManager } from "@base-ui/react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: ProjectIcon,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: ClientIcon,
  },
  {
    href: "/templates",
    label: "Templates",
    icon: TemplateIcon,
  },
  {
    href: "/libraries",
    label: "Libraries",
    icon: LibraryIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: SettingIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarComponent collapsible="icon" variant="sidebar" className="max-w-md">
      {/* Logo Header */}
      <SidebarHeader className="w-[90%] mx-auto mt-10">
        <Link href="/" className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Logo variant="contained" size="xl" />
            <p>
              <span className="font-bold text-xl text-primary group-data-[collapsible=icon]:hidden whitespace-nowrap inline-block">
                Quantify Pro
              </span>
              <span className="text-lg text-primary font-bold  capitalize">
                {pathname.split("/")?.[1]}
              </span>
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-0 mt-4 ">
        <SidebarMenu className="gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <SidebarMenuItem key={item.href} className="w-[90%] mx-auto">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`my-2 px-8 py-6 ${
                    isActive
                      ? "bg-primary! text-white! hover:bg-primary/90 [&_svg]:text-white!"
                      : "text-[A3A#D0] [&_svg]:text-[#A3AED0] hover:[&_svg]:text-[#2B3674]"
                    // isActive
                    //   ? "bg-primary! text-white! font-semibold hover:bg-primary/90! [&_svg]:text-white! py-3!"
                    //   : "text-[#A3AED0] hover:text-[#2B3674] [&_svg]:text-[#A3AED0] hover:[&_svg]:text-[#2B3674] py-1.5!"
                  }`}
                >
                  <Link href={item.href}>
                    <Icon className="w-6 h-6" />
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
              <button
                onClick={() => {
                  removeToken();
                  router.push("/auth/login");
                }}
                className="cursor-pointer"
              >
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
