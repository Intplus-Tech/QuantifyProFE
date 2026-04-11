"use client";

import { Card } from "@/components/ui/card";
import { ChartNoAxesColumn } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PromoSection } from "@/components/dashboard/PromoSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { Project } from "@/types/projects";

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

  const projectsData: Project[] = [
    {
      _id: "1",
      name: "Skyline Residencies - Block A",
      projectCode: "402235",
      clientName: "Yash Ghori",
      createdAt: new Date("2023-03-25").toISOString(),
      updatedAt: new Date("2024-05-02").toISOString(),
      description: "Construction of Skyline Residencies Block A",
      userId: "user-1",
      companyId: "comp-1",
      status: "active",
      source: "manual",
      sourceJobId: "job-1",
      boqResult: {
        projectTitle: "Skyline Residencies - Block A",
        sections: [],
        generalNotes: "",
      },
      libraryItems: [],
    },
    {
      _id: "2",
      name: "City Center Mall Renovation",
      projectCode: "402236",
      clientName: "Yash Ghori",
      createdAt: new Date("2023-03-25").toISOString(),
      updatedAt: new Date("2024-05-02").toISOString(),
      description: "Renovation project for City Center Mall",
      userId: "user-1",
      companyId: "comp-1",
      status: "active",
      source: "manual",
      sourceJobId: "job-2",
      boqResult: {
        projectTitle: "City Center Mall Renovation",
        sections: [],
        generalNotes: "",
      },
      libraryItems: [],
    },
    {
      _id: "3",
      name: "Highway Bridge #402",
      projectCode: "402237",
      clientName: "Yash Ghori",
      createdAt: new Date("2023-03-25").toISOString(),
      updatedAt: new Date("2024-05-02").toISOString(),
      description: "Structural engineering for Highway Bridge #402",
      userId: "user-1",
      companyId: "comp-1",
      status: "active",
      source: "manual",
      sourceJobId: "job-3",
      boqResult: {
        projectTitle: "Highway Bridge #402",
        sections: [],
        generalNotes: "",
      },
      libraryItems: [],
    },
    {
      _id: "4",
      name: "Lakeside Villas",
      projectCode: "402238",
      clientName: "Yash Ghori",
      createdAt: new Date("2023-03-25").toISOString(),
      updatedAt: new Date("2024-05-02").toISOString(),
      description: "Luxury villas project at Lakeside",
      userId: "user-1",
      companyId: "comp-1",
      status: "active",
      source: "manual",
      sourceJobId: "job-4",
      boqResult: {
        projectTitle: "Lakeside Villas",
        sections: [],
        generalNotes: "",
      },
      libraryItems: [],
    },
    {
      _id: "5",
      name: "Warehouse Distribution Center",
      projectCode: "402239",
      clientName: "Yash Ghori",
      createdAt: new Date("2023-03-25").toISOString(),
      updatedAt: new Date("2024-05-02").toISOString(),
      description: "New warehouse distribution center",
      userId: "user-1",
      companyId: "comp-1",
      status: "active",
      source: "manual",
      sourceJobId: "job-5",
      boqResult: {
        projectTitle: "Warehouse Distribution Center",
        sections: [],
        generalNotes: "",
      },
      libraryItems: [],
    },
  ];

  return (
    <div className=" mx-auto space-y-4">
      <StatsGrid stats={statsData} />
      <PromoSection />
      <ProjectsTable projects={projectsData} />
    </div>
  );
}
