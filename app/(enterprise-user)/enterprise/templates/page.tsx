"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Users,
  BookOpen,
  Building,
  Home,
  Building2,
  Factory,
  ShoppingBag,
  Hotel,
  MoreVertical,
} from "lucide-react";

const mockTemplates = [
  {
    id: 1,
    title: "Residential Building- Standard",
    description:
      "Complete BOQ template for standard residential buildings with NIQS-compliant.",
    icon: Home,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    openedAt: "opened 2 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=1", initials: "JD" }],
    extraUsers: "+2",
  },
  {
    id: 2,
    title: "Commercial Office Building",
    description:
      "Professional BOQ template for multi-story commercial office buildings",
    icon: Building2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    openedAt: "opened 12 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=2", initials: "AS" }],
    extraUsers: "+3",
  },
  {
    id: 3,
    title: "Warehouse & Industrial",
    description: "Specialized template for warehouse and industrial facilities",
    icon: Factory,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    openedAt: "Opened 30 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=3", initials: "MK" }],
    extraUsers: "+2",
  },
  {
    id: 4,
    title: "Shopping Mall/Retail",
    description: "Comprehensive template for retail and shopping centers",
    icon: ShoppingBag,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    openedAt: "opened 2 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=4", initials: "BL" }],
    extraUsers: "+2",
  },
  {
    id: 5,
    title: "Hotel & Hospitality",
    description: "Detailed BOQ for hotel and hospitality projects",
    icon: Hotel,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    openedAt: "opened 12 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=5", initials: "RJ" }],
    extraUsers: "+3",
  },
  {
    id: 6,
    title: "Duplex & Villa",
    description: "Luxury residential template for duplexes and villas",
    icon: Factory,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    openedAt: "Opened 30 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=6", initials: "TR" }],
    extraUsers: "+2",
  },
  {
    id: 7,
    title: "Residential Building- Standard",
    description:
      "Complete BOQ template for standard residential buildings with NIQS-compliant.",
    icon: Home,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    openedAt: "opened 2 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=1", initials: "JD" }],
    extraUsers: "+2",
  },
  {
    id: 8,
    title: "Commercial Office Building",
    description:
      "Professional BOQ template for multi-story commercial office buildings",
    icon: Building2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    openedAt: "opened 12 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=2", initials: "AS" }],
    extraUsers: "+3",
  },
  {
    id: 9,
    title: "Warehouse & Industrial",
    description: "Specialized template for warehouse and industrial facilities",
    icon: Factory,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    openedAt: "Opened 30 mins ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=3", initials: "MK" }],
    extraUsers: "+2",
  },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"system" | "organization">(
    "system",
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Template</h1>
        <p className="text-muted-foreground text-sm">
          Manage your standard and Organization workflow templates across the
          platform.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <Button
          size={"lg"}
          onClick={() => setActiveTab("system")}
          className={` ${
            activeTab === "system"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-muted-foreground border border-border/50 hover:bg-primary/10"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          System Template
        </Button>
        <Button
          size={"lg"}
          onClick={() => setActiveTab("organization")}
          className={` ${
            activeTab === "organization"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-muted-foreground border border-border/50 hover:bg-primary/10"
          }`}
        >
          <Building className="w-4 h-4" />
          Organization Template
        </Button>
      </div>

      {/* Template Banner */}
      <div className="space-y-4">
        {activeTab === "system" ? (
          <>
            <h2 className="text-xl font-bold text-foreground">
              System Template
            </h2>
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30 shadow-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg shrink-0">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-1">
                    System Template
                  </h3>
                  <p className="text-sm text-orange-700/80">
                    Professional templates created by Quantify pro, optimized
                    for Nigerian construction projects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground">
              Organizational Template
            </h2>
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30 shadow-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg shrink-0">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-1">
                    Organizational Template
                  </h3>
                  <p className="text-sm text-orange-700/80">
                    Custom templates created by your team members based on
                    completed projects. Share and reuse proven BOQ structures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search material description..."
          className="pl-12 h-14 bg-white border-border/50 shadow-sm text-base rounded-xl"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden flex flex-col"
            >
              <CardContent className="p-6 flex flex-col flex-1">
                {/* Card Header: Icon & Options */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.iconBg}`}
                  >
                    <Icon className={`w-6 h-6 ${template.iconColor}`} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Card Body: Title & Description */}
                <div className="mb-6 flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                    {template.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {template.description}
                  </p>
                </div>

                {/* Card Footer: Avatars & Time */}
                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {template.team.map((member, idx) => (
                        <Avatar
                          key={idx}
                          className="w-8 h-8 border-2 border-white"
                        >
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 font-medium px-2 py-0.5 text-xs rounded-full"
                    >
                      {template.extraUsers}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {template.openedAt}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
