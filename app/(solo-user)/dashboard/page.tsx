"use client";

import { Card } from "@/components/ui/card";
import { ChartNoAxesColumn } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PromoSection } from "@/components/dashboard/PromoSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";

export default function DashboardPage() {
  const statsData = [
    {
      label: "Total Project Value",
      value: "₦143,000,000",
      icon: null,
      colorClass: "",
    },
    {
      label: "Projects",
      value: "4/5",
      icon: (
        <ChartNoAxesColumn className="text-primary" size={24} strokeWidth={4} />
      ),
      colorClass: "",
    },
    {
      label: "BOQs",
      value: "84",
      icon: (
        <Image src="/icons/boq.svg" alt="BOQ Icon" width={32} height={32} />
      ),
      colorClass: "",
    },
    {
      label: "Invite a user",
      value: "",
      icon: (
        <Image
          src="/icons/invite.svg"
          alt="Invite Icon"
          width={32}
          height={32}
        />
      ),
      colorClass: "text-primary",
      border: true,
      extra: (
        <>
          <Separator orientation="horizontal" />
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Upgrade your plan
          </p>
        </>
      ),
    },
  ];

  const projectsData = [
    {
      name: "Skyline Residencies - Block A",
      number: "402235",
      openedBy: "Yash Ghori",
      openedAgo: "10 days ago",
      createdDate: "25/3/2023",
      costSummaryDate: "02.05.2024",
      costSummaryUrl: "#",
    },
    {
      name: "City Center Mall Renovation",
      number: "402236",
      openedBy: "Yash Ghori",
      openedAgo: "10 days ago",
      createdDate: "25/3/2023",
      costSummaryDate: "02.05.2024",
      costSummaryUrl: "#",
    },
    {
      name: "Highway Bridge #402",
      number: "402237",
      openedBy: "Yash Ghori",
      openedAgo: "10 days ago",
      createdDate: "25/3/2023",
      costSummaryDate: "02.05.2024",
      costSummaryUrl: "#",
    },
    {
      name: "Lakeside Villas",
      number: "402238",
      openedBy: "Yash Ghori",
      openedAgo: "10 days ago",
      createdDate: "25/3/2023",
      costSummaryDate: "02.05.2024",
      costSummaryUrl: "#",
    },
    {
      name: "Warehouse Distribution Center",
      number: "402239",
      openedBy: "Yash Ghori",
      openedAgo: "10 days ago",
      createdDate: "25/3/2023",
      costSummaryDate: "02.05.2024",
      costSummaryUrl: "#",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
      <StatsGrid stats={statsData} />
      <PromoSection />
        <ProjectsTable projects={projectsData} />
    </div>
  );
}
