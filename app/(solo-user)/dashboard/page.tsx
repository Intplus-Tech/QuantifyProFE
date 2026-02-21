"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  FileText,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, John! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Project Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$524,800</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">
                +12.5% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="flex items-center gap-1 mt-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-600">
                2 require attention
              </span>
            </div>
          </CardContent>
        </Card>

        {/* BOQs Created */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              BOQs This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">28</div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">All on schedule</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest projects and their status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Project Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "Office Renovation",
                    client: "Tech Corp",
                    value: "$25,000",
                    status: "In Progress",
                    date: "Mar 15, 2025",
                  },
                  {
                    name: "Warehouse Extension",
                    client: "LogiSmart",
                    value: "$85,500",
                    status: "In Progress",
                    date: "Apr 10, 2025",
                  },
                  {
                    name: "Mall Remodel",
                    client: "RetailHub",
                    value: "$157,200",
                    status: "Planning",
                    date: "May 20, 2025",
                  },
                  {
                    name: "Factory Upgrade",
                    client: "ManufactureCo",
                    value: "$92,300",
                    status: "Completed",
                    date: "Feb 28, 2025",
                  },
                ].map((project) => (
                  <tr
                    key={project.name}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {project.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {project.client}
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">
                      {project.value}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          project.status === "Completed"
                            ? "default"
                            : project.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: FileText,
                title: "BOQ Created",
                description: "Office Renovation BOQ finalized",
                time: "2 hours ago",
              },
              {
                icon: CheckCircle2,
                title: "Project Milestone",
                description: "Warehouse Extension - Phase 1 completed",
                time: "5 hours ago",
              },
              {
                icon: AlertCircle,
                title: "Status Update",
                description: "Mall Remodel awaiting client approval",
                time: "1 day ago",
              },
              {
                icon: Calendar,
                title: "Schedule Change",
                description: "Factory Upgrade deadline extended to Mar 30",
                time: "2 days ago",
              },
            ].map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
  );
}
