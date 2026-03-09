"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartNoAxesColumn,
  Check,
  FileText,
  MessageSquare,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/dashboard/StatsGrid";

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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <StatsGrid stats={statsData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-5">
            <CardTitle className="text-base font-semibold">
              Recent Projects
            </CardTitle>
            <Link
              href="/projects"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/10">
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">
                      Value
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground">
                      Last Edited
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Skyline Residencies - Block A",
                      status: "In Progress",
                      value: "$1,250,000",
                      date: "2 hours ago",
                    },
                    {
                      name: "City Center Mall Renovation",
                      status: "Drafting",
                      value: "$450,000",
                      date: "Yesterday",
                    },
                    {
                      name: "Highway Bridge #402",
                      status: "In Progress",
                      value: "$2,800,000",
                      date: "3 days ago",
                    },
                    {
                      name: "Lakeside Villas",
                      status: "Completed",
                      value: "$850,000",
                      date: "1 week ago",
                    },
                    {
                      name: "Warehouse Distribution Center",
                      status: "Drafting",
                      value: "$3,100,000",
                      date: "1 week ago",
                    },
                  ].map((project, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-foreground">
                        {project.name}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={
                            project.status === "In Progress"
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 font-medium"
                              : project.status === "Completed"
                                ? "bg-green-100 text-green-700 hover:bg-green-100 border-0 font-medium"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0 font-medium"
                          }
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-foreground">
                        {project.value}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {project.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader className="py-5 border-b border-border">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {[
                {
                  icon: FileText,
                  iconBg: "bg-orange-100",
                  iconColor: "text-orange-600",
                  content: (
                    <>
                      <span className="font-semibold text-foreground">
                        Sarah M.
                      </span>{" "}
                      created a new estimate for{" "}
                      <span className="font-semibold text-foreground">
                        Skyline Block B
                      </span>
                    </>
                  ),
                  time: "10 mins ago",
                },
                {
                  icon: Check,
                  iconBg: "bg-green-100",
                  iconColor: "text-green-600",
                  content: (
                    <>
                      <span className="font-semibold text-foreground">
                        Mark T.
                      </span>{" "}
                      approved BOQ for{" "}
                      <span className="font-semibold text-foreground">
                        Lakeside Villas
                      </span>
                    </>
                  ),
                  time: "2 hours ago",
                },
                {
                  icon: MessageSquare,
                  iconBg: "bg-orange-100",
                  iconColor: "text-orange-600",
                  content: (
                    <>
                      New comment on{" "}
                      <span className="font-semibold text-foreground">
                        Bridge #402
                      </span>{" "}
                      reinforcement schedule
                    </>
                  ),
                  time: "5 hours ago",
                },
                {
                  icon: Upload,
                  iconBg: "bg-gray-100",
                  iconColor: "text-gray-600",
                  content: (
                    <>
                      <span className="font-semibold text-foreground">You</span>{" "}
                      uploaded 3 drawings to{" "}
                      <span className="font-semibold text-foreground">
                        City Center Mall
                      </span>
                    </>
                  ),
                  time: "Yesterday",
                },
              ].map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-5 border-b border-border last:border-0"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={
                          "flex items-center justify-center w-8 h-8 rounded-full " +
                          activity.iconBg
                        }
                      >
                        <Icon className={"w-4 h-4 " + activity.iconColor} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
