"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  FolderOpen,
  BarChart3,
  HardDrive,
  Camera,
} from "lucide-react";

export default function EnterpriseOrganizationSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Organization Information */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Organization Information
            </CardTitle>
            <Badge className="bg-primary text-white hover:bg-primary/80 border-0 text-[10px] font-bold rounded-full px-3">
              Enterprise
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-5 mb-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-foreground">Organization Logo</h3>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 2MB. Recommended 200x200px
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Organization Name
                </Label>
                <Input
                  defaultValue="Quantify Pro Enterprise Ltd"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Organization Type
                </Label>
                <Select defaultValue="llc">
                  <SelectTrigger className="bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="ltd">Ltd</SelectItem>
                    <SelectItem value="plc">PLC</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Industry
                </Label>
                <Select defaultValue="qs">
                  <SelectTrigger className="bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qs">Quantity Surveying</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                    <SelectItem value="arch">Architecture</SelectItem>
                    <SelectItem value="construction">
                      Construction Management
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Organization Size
                </Label>
                <Select defaultValue="50-100">
                  <SelectTrigger className="bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10-50">10-50 employees</SelectItem>
                    <SelectItem value="50-100">50-100 employees</SelectItem>
                    <SelectItem value="100-500">100-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Tax ID / Registration Number
                </Label>
                <Input
                  defaultValue="RC-1234567"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Website
                </Label>
                <Input
                  defaultValue="https://quantifypro.com"
                  className="bg-white border-border/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Head Office Address
              </Label>
              <Textarea
                defaultValue="15 Awolowo Road, Ikoyi, Lagos, Nigeria"
                className="bg-white border-border/50 resize-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save Organization Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Contact */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Primary Admin Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  defaultValue="Adebayo Johnson"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Job Title
                </Label>
                <Input
                  defaultValue="Chief Quantity Surveyor"
                  className="bg-white border-border/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  defaultValue="adebayo@quantifypro.com"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  defaultValue="+234 733 955 4338"
                  className="bg-white border-border/50"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="text-white font-semibold px-6">
                Update Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Subscription & Usage Overview */}
      <div className="space-y-6">
        <Card className="shadow-sm border-border/50 bg-slate-50/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Current Plan */}
            <div className="bg-white rounded-lg p-4 border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  CURRENT PLAN
                </span>
                <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0 text-[10px] font-bold">
                  ACTIVE
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-primary">Enterprise</h3>
              <p className="text-muted-foreground text-sm mt-1">
                ₦150,000/month
              </p>
            </div>

            {/* Team Seats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Team Seats
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">18/25</span>
              </div>
              <Progress
                value={72}
                className="h-2 bg-gray-200 [&>div]:bg-primary"
              />
            </div>

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
                  12/Unlimited
                </span>
              </div>
              <Progress
                value={30}
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
                  84/Unlimited
                </span>
              </div>
              <Progress
                value={40}
                className="h-2 bg-gray-200 [&>div]:bg-blue-500"
              />
            </div>

            {/* Cloud Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">
                    Cloud Storage
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  42GB/100GB
                </span>
              </div>
              <Progress
                value={42}
                className="h-2 bg-gray-200 [&>div]:bg-emerald-500"
              />
            </div>

            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5 font-medium"
            >
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
