"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, BarChart3, HardDrive } from "lucide-react";
import { useGetUsageStatsQuery } from "@/store/api/billingApi";

export function PlanUsage() {
  const { data: usageResponse, isLoading } = useGetUsageStatsQuery();
  const usage = usageResponse?.data;

  if (isLoading) return (
    <Card className="shadow-sm border-border/50 animate-pulse">
      <div className="h-64 bg-slate-100 rounded-xl m-6" />
    </Card>
  );

  return (
    <Card className="shadow-sm border-border/50 bg-slate-50/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Plan Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Active Projects */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-foreground">
                Active Projects
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {usage?.activeProjects.used}/{usage?.activeProjects.limit}
            </span>
          </div>
          <Progress
            value={(usage?.activeProjects.used || 0) / (usage?.activeProjects.limit || 1) * 100}
            className="h-2 bg-gray-200 [&>div]:bg-orange-500"
          />
        </div>

        {/* BOQ Extractions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">
                BOQ Extractions
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {usage?.boqExtractions.used}/{usage?.boqExtractions.limit}
            </span>
          </div>
          <Progress
            value={(usage?.boqExtractions.used || 0) / (usage?.boqExtractions.limit || 1) * 100}
            className="h-2 bg-gray-200 [&>div]:bg-blue-500"
          />
        </div>

        {/* Cloud Storage (Dummy for now as it wasn't in sample API) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">
                Cloud Storage
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              2.4GB/5GB
            </span>
          </div>
          <Progress
            value={48}
            className="h-2 bg-gray-200 [&>div]:bg-emerald-500"
          />
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          Need more resources?{" "}
          <span className="text-orange-500 font-medium cursor-pointer hover:underline">
            Upgrade your plan
          </span>{" "}
          to unlock higher limits and premium features.
        </p>
      </CardContent>
    </Card>
  );
}
