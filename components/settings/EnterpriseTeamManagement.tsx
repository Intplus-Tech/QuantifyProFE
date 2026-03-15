"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Edit2,
  FolderOpen,
  Users,
  Info,
  CreditCard,
} from "lucide-react";

const officeLocations = [
  {
    id: 1,
    name: "Headquarters",
    address: "123 Victoria Island, Lagos, Nigeria",
  },
  {
    id: 2,
    name: "London Branch",
    address: "45 Canary Wharf, London, UK",
  },
];

export default function EnterpriseTeamManagement() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Basic Information
            </CardTitle>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] font-bold rounded-full px-3">
              Enterprise
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Logo */}
              <div className="flex flex-col gap-2 shrink-0">
                <Label className="text-xs font-medium text-muted-foreground">
                  Company Logo
                </Label>
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-orange-200">
                  <img
                    src="https://i.pravatar.cc/150?u=company"
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-medium text-center">
                  PNG OR JPG, MAX 2MB
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Company Legal Name
                  </Label>
                  <Input
                    defaultValue="Quantify Pro Enterprise Ltd"
                    className="bg-white border-border/50"
                  />
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
                    <Select defaultValue="1-10">
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
                    Registration Number
                  </Label>
                  <Input
                    placeholder="e.g. 12345678"
                    className="bg-white border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Tax ID Number
                  </Label>
                  <Input
                    placeholder="e.g. TIN-98765432"
                    className="bg-white border-border/50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Locations */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Office Locations
            </CardTitle>
            <button className="text-sm font-semibold text-primary hover:text-primary">
              + Add Location
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {officeLocations.map((location, idx) => (
              <div
                key={location.id}
                className={`flex items-center justify-between px-6 py-5 ${idx < officeLocations.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {location.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {location.address}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Subscription Overview */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Current Plan */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  CURRENT PLAN
                </p>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Enterprise Tier
              </h3>
              <p className="text-xs text-muted-foreground">
                Renewal Date: Oct 12, 2024
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Active Projects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Active Projects
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Unlimited access
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold text-foreground">124</span>
              </div>

              {/* Team Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Team Members
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      42 / 50 seats used
                    </p>
                  </div>
                </div>
                <span className="text-xl font-bold text-foreground">42</span>
              </div>
            </div>

            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold mt-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Tip */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-foreground text-sm mb-1">
              Enterprise Tip
            </h4>
            <p className="text-xs text-primary/70 leading-relaxed">
              Your enterprise license allows for custom API integrations and
              dedicated account support 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
