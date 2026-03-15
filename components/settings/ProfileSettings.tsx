"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { BillingModal } from "./BillingModal";

// ─── Schemas ───────────────────────────────────────────────────────────────

const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.string().min(1, "Select a company type"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  primaryAddress: z.string().min(5, "Address must be at least 5 characters"),
});

const personalSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  title: z.string().min(1, "Select a professional title"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type CompanyFormValues = z.infer<typeof companySchema>;
type PersonalFormValues = z.infer<typeof personalSchema>;

// ─── Dummy API handlers ─────────────────────────────────────────────────────

async function updateCompanyInfo(data: CompanyFormValues): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/company", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updateCompanyInfo →", data);
}

async function updatePersonalInfo(data: PersonalFormValues): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/profile", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updatePersonalInfo →", data);
}

// ─── Field error helper ──────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const [billingOpen, setBillingOpen] = useState(false);

  // ── Company form ──
  const {
    register: regC,
    control: controlC,
    handleSubmit: handleC,
    formState: { errors: errC, isSubmitting: submittingC },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "Quantify Pro Enterprise Ltd",
      companyType: "llc",
      industry: "qs",
      companySize: "50-100",
      primaryAddress: "wht so ever address in the world of Nigeria with a beauty in it",
    },
  });

  async function onCompanySubmit(data: CompanyFormValues) {
    try {
      await updateCompanyInfo(data);
      toast.success("Company information saved.");
    } catch {
      toast.error("Failed to save company information.");
    }
  }

  // ── Personal form ──
  const {
    register: regP,
    control: controlP,
    handleSubmit: handleP,
    formState: { errors: errP, isSubmitting: submittingP },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: "Alex Richard",
      title: "qs",
      email: "Alexric.hard@gmail.com",
      phone: "+234 733 955 4338",
      address: "wht so ever address in the world of Nigeria with a beauty in it",
    },
  });

  async function onPersonalSubmit(data: PersonalFormValues) {
    try {
      await updatePersonalInfo(data);
      toast.success("Personal information saved.");
    } catch {
      toast.error("Failed to save personal information.");
    }
  }

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
            <CardContent>
              <form onSubmit={handleC(onCompanySubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Company Legal Name
                    </Label>
                    <Input
                      {...regC("companyName")}
                      className="bg-white border-border/50"
                    />
                    <FieldError message={errC.companyName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Company Type
                    </Label>
                    <Controller
                      control={controlC}
                      name="companyType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      )}
                    />
                    <FieldError message={errC.companyType?.message} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Industry
                    </Label>
                    <Controller
                      control={controlC}
                      name="industry"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full bg-white border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qs">Quantity Surveying</SelectItem>
                            <SelectItem value="civil">Civil Engineering</SelectItem>
                            <SelectItem value="arch">Architecture</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errC.industry?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Company Size
                    </Label>
                    <Controller
                      control={controlC}
                      name="companySize"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      )}
                    />
                    <FieldError message={errC.companySize?.message} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Primary Address
                  </Label>
                  <Textarea
                    {...regC("primaryAddress")}
                    className="bg-white border-border/50 resize-none min-h-20"
                  />
                  <FieldError message={errC.primaryAddress?.message} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingC}>
                    {submittingC ? "Saving..." : "Save Company Info"}
                  </Button>
                </div>
              </form>
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
            <CardContent>
              <form onSubmit={handleP(onPersonalSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      {...regP("fullName")}
                      className="bg-white border-border/50"
                    />
                    <FieldError message={errP.fullName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Professional Title
                    </Label>
                    <Controller
                      control={controlP}
                      name="title"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full bg-white border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qs">Quantity Surveyor</SelectItem>
                            <SelectItem value="pm">Project Manager</SelectItem>
                            <SelectItem value="ce">Civil Engineer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errP.title?.message} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      {...regP("email")}
                      type="email"
                      className="bg-white border-border/50"
                    />
                    <FieldError message={errP.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      {...regP("phone")}
                      type="tel"
                      className="bg-white border-border/50"
                    />
                    <FieldError message={errP.phone?.message} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Primary Address
                  </Label>
                  <Textarea
                    {...regP("address")}
                    className="bg-white border-border/50 resize-none min-h-20"
                  />
                  <FieldError message={errP.address?.message} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingP} className="text-white font-semibold px-6">
                    {submittingP ? "Saving..." : "Save Personal Info"}
                  </Button>
                </div>
              </form>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Active Projects</p>
                      <p className="text-xs text-muted-foreground">Unlimited access</p>
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
                      <p className="text-sm font-semibold text-foreground">Team Members</p>
                      <p className="text-xs text-muted-foreground">1 / 1 seats used</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-foreground">1</span>
                </div>
              </div>
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
