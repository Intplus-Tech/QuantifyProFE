"use client";

import { Search, Bell, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export function EnterpriseHeader() {
  const pathname = usePathname() || "";
  const user = useSelector((state: RootState) => state.auth.user);

  let title = "Enterprise Dashboard";
  let subtitle = `Hi, ${user?.firstName},${user?.lastName}`;

  if (pathname.includes("/projects")) {
    title = "Projects";
    subtitle = "";
  } else if (pathname.includes("/clients")) {
    title = "Clients";
    subtitle = "Manage your enterprise clients";
  } else if (pathname.includes("/templates")) {
    title = "Templates";
    subtitle = "Manage your enterprise templates";
  } else if (pathname.includes("/libraries")) {
    title = "Libraries";
    subtitle = "Manage your enterprise libraries";
  } else if (pathname.includes("/settings")) {
    title = "Settings";
    subtitle = "Manage your enterprise settings";
  }

  return (
    <header className=" bg-[#F4F7FE] h-fit py-4 flex items-center px-6 gap-6 sticky top-0 z-50">
      {/* Sidebar Toggle */}
      {/* <SidebarTrigger className="-ml-2" /> */}
      {/* <Separator orientation="vertical" className="h-6" /> */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, clients..."
              className="pl-10 bg-muted h-12 text-sm"
            />
          </div>
        </div>
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        {/* User Avatar */}
        <Avatar className="w-9 h-9">
          <AvatarImage src="https://avatar.vercel.sh/user" alt="User" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
