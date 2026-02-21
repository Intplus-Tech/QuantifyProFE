"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Monitor,
  Smartphone,
  Laptop,
} from "lucide-react";

const sessions = [
  {
    id: 1,
    device: "MacBook Pro 16\"",
    browser: "Chrome on macOS",
    icon: Laptop,
    location: "Lagos, Nigeria",
    lastLogin: "Current Session",
    status: "Active",
    statusColor: "bg-green-100 text-green-600",
    isCurrent: true,
  },
  {
    id: 2,
    device: "iPhone 15 Pro",
    browser: "iOS App",
    icon: Smartphone,
    location: "Lagos, Nigeria",
    lastLogin: "2 hours ago",
    status: "Active",
    statusColor: "bg-green-100 text-green-600",
    canLogout: true,
  },
  {
    id: 3,
    device: "Windows Workstation",
    browser: "Edge on Windows",
    icon: Monitor,
    location: "London, UK",
    lastLogin: "Oct 14, 2023",
    status: "Logged Out",
    statusColor: "bg-red-100 text-red-600",
  },
];

export default function EnterpriseRolesPermissions() {
  return (
    <div className="space-y-6">
      {/* Password Management Header */}
      <div className="bg-slate-50 border border-border/30 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Lock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-base">
            Password Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your account credentials to keep your data safe.
          </p>
        </div>
      </div>

      {/* Password Form */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                EMAIL ADDRESS
              </Label>
              <Input
                type="email"
                placeholder="Enter your current email address"
                className="bg-white border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                CURRENT PASSWORD
              </Label>
              <Input
                type="password"
                placeholder="Enter New Password"
                className="bg-white border-border/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                NEW PASSWORD
              </Label>
              <Input
                type="password"
                defaultValue=""
                className="bg-white border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                RE-ENTER NEW PASSWORD
              </Label>
              <Input
                type="password"
                defaultValue=""
                className="bg-white border-border/50"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Active Sessions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Devices currently logged into your account.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/5">
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    DEVICE
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    LOCATION
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    LAST LOGIN
                  </th>
                  <th className="text-right py-3 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const IconComponent = session.icon;
                  return (
                    <tr
                      key={session.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {session.device}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.browser}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground">
                        {session.location}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {session.lastLogin}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge
                            className={`border-0 text-[10px] font-bold uppercase tracking-wider ${session.statusColor}`}
                          >
                            {session.status}
                          </Badge>
                          {session.canLogout && (
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-8"
                            >
                              Log Device out
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
