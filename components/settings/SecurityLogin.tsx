"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Star,
  Mail,
  Clock,
} from "lucide-react";

const loginActivity = [
  {
    icon: Laptop,
    device: "MacBook Pro M2",
    location: "Lagos, Nigeria • Chrome Browser",
    time: "Active Now",
    isCurrent: true,
  },
  {
    icon: Smartphone,
    device: "iPhone 14 Pro",
    location: "Lagos, Nigeria • App Session",
    time: "Yesterday at 4:32 PM",
    isCurrent: false,
  },
  {
    icon: Monitor,
    device: "Windows Workstation",
    location: "Abuja, Nigeria • Firefox Browser",
    time: "Mar 12, 2024 at 10:15 AM",
    isCurrent: false,
  },
  {
    icon: Tablet,
    device: "iPad Air",
    location: "Lagos, Nigeria • Safari",
    time: "Mar 10, 2024 at 09:22 PM",
    isCurrent: false,
  },
];

export default function SecurityLogin() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Password */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Update Password
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ensure your account is using a long, random password to stay
                    secure.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Current Password
                </Label>
                <Input
                  type="password"
                  defaultValue="••••••••••••"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="bg-white border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-white border-border/50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/80 text-white font-semibold px-6">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Alerts & Session Timeout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-foreground">Email Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Notify me of new logins
                      </p>
                    </div>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-foreground">
                        Session Timeout
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Auto-logout after 2 hours
                      </p>
                    </div>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Login Activity */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Recent Login Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginActivity.map((session, idx) => {
                const Icon = session.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">
                          {session.device}
                        </p>
                        {session.isCurrent && (
                          <Badge className="bg-transparent text-green-600 hover:bg-transparent border-0 text-xs font-semibold p-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              <button className="text-sm font-semibold text-red-500 hover:text-red-600 w-full text-center pt-2">
                Sign out from all other devices
              </button>
            </CardContent>
          </Card>

          {/* Quantify Pro+ Card */}
          <Card className="shadow-none bg-amber-400 border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-white fill-white" />
                <h3 className="font-bold text-white text-lg">Quantify Pro+</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Upgrade to get multi-user access and advanced team security
                features.
              </p>
              <Button
                variant="outline"
                className="bg-white text-orange-600 border-white hover:bg-white/90 hover:text-orange-700 font-semibold"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
