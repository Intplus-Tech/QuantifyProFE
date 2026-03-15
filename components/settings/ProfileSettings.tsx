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
import { Briefcase, Users } from "lucide-react";
import { useState } from "react";
import { BillingModal } from "./BillingModal";

export default function ProfileSettings() {
  const [billingOpen, setBillingOpen] = useState(false);
  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Company Information */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Company Information
            </CardTitle>
            <Badge className="bg-amber-400 text-white hover:bg-amber-400 border-0 text-[10px] font-bold rounded-full px-3">
              Solo
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Company Legal Name
                </Label>
                <Input
                  defaultValue="Quantify Pro Enterprise Ltd"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Company Type
                </Label>
                <Select defaultValue="llc">
                  <SelectTrigger className="w-full bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="ltd">Ltd</SelectItem>
                    <SelectItem value="plc">PLC</SelectItem>
                    <SelectItem value="sole">Sole Proprietorship</SelectItem>
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
                  <SelectTrigger className="w-full bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qs">Quantity Surveying</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                    <SelectItem value="arch">Architecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Company Size
                </Label>
                <Select defaultValue="50-100">
                  <SelectTrigger className="w-full bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="10-50">10-50</SelectItem>
                    <SelectItem value="50-100">50-100</SelectItem>
                    <SelectItem value="100+">100+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Primary Address
              </Label>
              <Textarea
                defaultValue="wht so ever address in the world of Nigeria with a beauty in it"
                className="bg-white border-border/50 resize-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save All Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Personal Information
            </CardTitle>
            <Badge className="bg-primary text-white hover:bg-primary/80 border-0 text-[10px] font-bold rounded-full px-3">
              Solo
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  defaultValue="Alex Richard"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Professional Title
                </Label>
                <Select defaultValue="qs">
                  <SelectTrigger className="w-full bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qs">Quantity Surveyor</SelectItem>
                    <SelectItem value="pm">Project Manager</SelectItem>
                    <SelectItem value="ce">Civil Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  defaultValue="Alexric.hard@gmail.com"
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
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Primary Address
              </Label>
              <Textarea
                defaultValue="wht so ever address in the world of Nigeria with a beauty in it"
                className="bg-white border-border/50 resize-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <Button className=" text-white font-semibold px-6">
                Save All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Subscription Overview */}
      <div>
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
              <h3 className="text-xl font-bold text-foreground">Solo Tier</h3>
              <p className="text-xs text-muted-foreground">
                Renewal Date: Oct 12, 2024
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Active Projects
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Unlimited access
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold text-foreground">12</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Team Members
                    </p>
                    <p className="text-xs text-muted-foreground">
                      1 / 1 seats used
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold text-foreground">1</span>
              </div>
            </div>

            {/* Manage Billing Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold"
              onClick={() => setBillingOpen(true)}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <BillingModal open={billingOpen} onOpenChange={setBillingOpen} />
    </>
  );
}
