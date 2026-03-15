"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Briefcase,
  Target,
  PlusCircle,
  X,
  Plus,
  Award,
  Clock,
  CheckCircle,
  Lightbulb,
  Camera,
} from "lucide-react";

const skills = [
  "Cost Estimation",
  "Bill of Quantities (BOQ)",
  "Tender Preparation",
  "Contract Management",
];

export default function ProfessionalDetails() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Professional Certifications */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-foreground">
                Professional Certifications
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Primary Certification
                </Label>
                <Input
                  defaultValue="RICS (Royal Institution of Chartered Surve..."
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Membership Number
                </Label>
                <Input
                  defaultValue="6822451"
                  className="bg-white border-border/50"
                />
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <PlusCircle className="w-4 h-4" />
              Add another certification
            </button>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-foreground">
                Work Experience
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Years of Experience
                </Label>
                <Input
                  defaultValue="12"
                  className="bg-white border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Industry Specialization
                </Label>
                <Select defaultValue="residential">
                  <SelectTrigger className="w-full bg-white border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">
                      Residential Construction
                    </SelectItem>
                    <SelectItem value="commercial">
                      Commercial Construction
                    </SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialized Surveying Skills */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-bold text-foreground">
                Specialized Surveying Skills
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className=" border-0 font-medium px-3 py-1.5 text-sm gap-1.5"
                >
                  {skill}
                  <X className="w-3 h-3 cursor-pointer" />
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Type to add skills (e.g. Value Engineering, Risk Management)"
                className="bg-white border-border/50 flex-1"
              />
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/80 text-white shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                className="border-border/50 text-muted-foreground font-medium"
              >
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/80 text-white font-semibold">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Profile Preview */}
      <div className="space-y-6">
        <Card className="shadow-sm border-border/50 bg-slate-50/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Profile Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://i.pravatar.cc/150?u=adebola"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <h3 className="font-bold text-foreground text-lg">
                Adebola Oladapo
              </h3>
              <p className="text-sm text-orange-500 font-medium">
                Senior Quantity Surveyor
              </p>
            </div>

            {/* Status & Experience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-border/30">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      STATUS
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Chartered (MRICS)
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-border/30">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    EXPERIENCE
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    12 Years Professional
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Profile Strength
                </span>
                <span className="text-sm font-bold text-green-600">85%</span>
              </div>
              <Progress
                value={85}
                className="h-2 bg-gray-200 [&>div]:bg-green-500"
              />
              <p className="text-xs text-muted-foreground">
                Complete your specialized skills to reach 100% and unlock
                premium report templates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Tip */}
        <Card className="shadow-none bg-primary border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white">Professional Tip</h3>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Professionals with <strong>RICS</strong> certifications on
              Quantify Pro are 40% more likely to close high-value commercial
              tenders. Keep your details up to date to maintain visibility.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
