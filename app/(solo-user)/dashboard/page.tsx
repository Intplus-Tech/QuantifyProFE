"use client";

import { ChartNoAxesColumn } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PromoSection } from "@/components/dashboard/PromoSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { useGetProjectsQuery } from "@/store/api/projectsApi";
import { useGetDashboardStatsQuery } from "@/store/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_PATH = "/projects";

export default function DashboardPage() {
  const { data: projectsRes, isLoading: projectsLoading } = useGetProjectsQuery(
    {},
  );
  const projectsList = projectsRes?.data || [];

  const { data: dashboardRes, isLoading: dashboardLoading } =
    useGetDashboardStatsQuery();

  const dashboardData = dashboardRes?.data;

  // Most recent project for the promo section shortcut
  const mostRecentProjectId = projectsList[0]?._id ?? null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statsData = [
    {
      label: "Total Project Value",
      value: dashboardLoading ? (
        <Skeleton className="h-9 w-32" />
      ) : (
        formatCurrency(dashboardData?.totalProjectValue || 0)
      ),
      icon: null,
      colorClass: "",
    },
    {
      label: "Projects",
      value: dashboardLoading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        `${dashboardData?.projects.count || 0}`
      ),
      icon: (
        <ChartNoAxesColumn className="text-primary" size={24} strokeWidth={4} />
      ),
      colorClass: "",
      href: "/projects",
    },
    {
      label: "BOQs",
      value: dashboardLoading ? (
        <Skeleton className="h-9 w-12" />
      ) : (
        dashboardData?.boqCount || "0"
      ),
      icon: (
        <Image src="/icons/boq.svg" alt="BOQ Icon" width={32} height={32} />
      ),
      colorClass: "",
      href: "/projects", // Usually BOQs are managed within projects
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
      href: "/settings",
      extra: (
        <>
          <Separator orientation="horizontal" className="my-2" />
          <div className="text-xs text-primary font-medium mb-3 leading-relaxed hover:underline">
            Upgrade your plan
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto space-y-4">
      <StatsGrid stats={statsData} />
      <PromoSection
        basePath={BASE_PATH}
        mostRecentProjectId={mostRecentProjectId}
      />
      <ProjectsTable
        projects={projectsList}
        isLoading={projectsLoading}
        basePath={BASE_PATH}
      />
    </div>
  );
}
