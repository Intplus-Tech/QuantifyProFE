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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Edit2,
  Shield,
  Lock,
  ArrowRightLeft,
  ArrowRight,
  Info,
  Plus,
} from "lucide-react";
import { InviteMemberModal } from "./InviteMemberModal";

// ─── Schema ──────────────────────────────────────────────────────────────────

const orgSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  registrationNumber: z.string().optional(),
  addressLine1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  addressLine2: z.string().optional(),
  state: z.string().min(1, "Select a state"),
  country: z.string().min(1, "Select a country"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

// ─── Dummy API handler ────────────────────────────────────────────────────────

async function updateOrgInfo(data: OrgFormValues): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/enterprise/organization", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updateOrgInfo →", data);
}

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const teamMembers = [
  {
    id: 1,
    name: "Adebola Olaitan",
    email: "adebola@quantifypro.co",
    avatar: "https://i.pravatar.cc/150?u=adebola",
    initials: "AO",
    role: "Owner",
    roleBg: "bg-transparent text-muted-foreground",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Yash Ghori",
    email: "yash.ghori@architects.io",
    avatar: "",
    initials: "YG",
    avatarBg: "bg-orange-100 text-primary",
    role: "Lead Surveyor",
    roleBg: "bg-blue-50 text-blue-600",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "12 mins ago",
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    email: "s.jenkins@constructions.uk",
    avatar: "",
    initials: "SJ",
    avatarBg: "bg-green-100 text-green-600",
    role: "Member",
    roleBg: "bg-transparent text-muted-foreground",
    status: "Offline",
    statusColor: "bg-gray-300",
    lastActive: "2 days ago",
  },
  {
    id: 4,
    name: "Marcus Chen",
    email: "m.chen@outlook.com",
    avatar: "",
    initials: "MC",
    avatarBg: "bg-blue-100 text-blue-600",
    role: "Member",
    roleBg: "bg-transparent text-muted-foreground",
    status: "Invited",
    statusColor: "bg-primary",
    lastActive: "-",
    isInvited: true,
  },
];

const libraries = [
  {
    id: 1,
    desc: "Ready-Mix Concrete C35/45",
    subDesc: "ID: MAT-4429",
    iconBg: "bg-primary/10 text-primary",
    unit: "m",
    rate: "142.50",
    category: "STRUCTURAL",
    date: "Oct 12, 2023",
  },
  {
    id: 2,
    desc: "Reinforcement Bars (16mm)",
    subDesc: "ID: MAT-8812",
    iconBg: "bg-blue-100 text-blue-600",
    unit: "Tonne",
    rate: "875.00",
    category: "STEELWORK",
    date: "Oct 10, 2023",
  },
  {
    id: 3,
    desc: "Plasterboard Standard 12.5mm",
    subDesc: "ID: MAT-3301",
    iconBg: "bg-green-100 text-green-600",
    unit: "m",
    rate: "12.45",
    category: "DRYLINING",
    date: "Sep 28, 2023",
  },
  {
    id: 4,
    desc: "Fire Door - 30min Rated (Single)",
    subDesc: "ID: MAT-1109",
    iconBg: "bg-purple-100 text-purple-600",
    unit: "Each",
    rate: "210.00",
    category: "JOINERY",
    date: "Sep 24, 2023",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function EnterpriseOrganizationSettings() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [lockSections, setLockSections] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      companyName: "Quantify Pro Enterprise Ltd",
      industry: "qs",
      companySize: "50-100",
      registrationNumber: "",
      addressLine1: "",
      addressLine2: "",
      state: "lagos",
      country: "nigeria",
    },
  });

  async function onOrgSubmit(data: OrgFormValues) {
    try {
      await updateOrgInfo(data);
      toast.success("Organisation information saved.");
    } catch {
      toast.error("Failed to save organisation information.");
    }
  }

  return (
    <>
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
              <form onSubmit={handleSubmit(onOrgSubmit)}>
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Logo */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Company Logo
                    </Label>
                    <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
                      <img
                        src="https://i.pravatar.cc/150?u=company"
                        alt="Company Logo"
                        className="w-full h-full object-cover opacity-50"
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
                        {...register("companyName")}
                        className="bg-white border-border/50"
                      />
                      <FieldError message={errors.companyName?.message} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Industry
                        </Label>
                        <Controller
                          control={control}
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
                        <FieldError message={errors.industry?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Company Size
                        </Label>
                        <Controller
                          control={control}
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
                        <FieldError message={errors.companySize?.message} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Govt. Registration Number
                      </Label>
                      <Input
                        {...register("registrationNumber")}
                        placeholder="e.g. 12345678"
                        className="bg-white border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Company Address
                      </Label>
                      <div className="space-y-3">
                        <div>
                          <Input
                            {...register("addressLine1")}
                            placeholder="Address Line 1"
                            className="bg-white border-border/50"
                          />
                          <FieldError message={errors.addressLine1?.message} />
                        </div>
                        <Input
                          {...register("addressLine2")}
                          placeholder="Address Line 2 (optional)"
                          className="bg-white border-border/50"
                        />
                        <Controller
                          control={control}
                          name="state"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full bg-white border-border/50">
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lagos">Lagos</SelectItem>
                                <SelectItem value="abuja">Abuja</SelectItem>
                                <SelectItem value="rivers">Rivers</SelectItem>
                                <SelectItem value="kano">Kano</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError message={errors.state?.message} />
                        <Controller
                          control={control}
                          name="country"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full bg-white border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nigeria">Nigeria</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="us">United States</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError message={errors.country?.message} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Organisation Info"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Team Members
              </CardTitle>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-y border-border bg-muted/5">
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        NAME & EMAIL
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        ROLE
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        LAST ACTIVE
                      </th>
                      <th className="text-right py-3 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} />
                              ) : null}
                              <AvatarFallback
                                className={`text-xs font-semibold ${member.avatarBg ?? ""}`}
                              >
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">
                                {member.name}
                              </p>
                              <p className="text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <Badge
                            variant="secondary"
                            className={`border-0 font-medium ${member.roleBg}`}
                          >
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${member.statusColor}`}
                            />
                            <span className="font-medium text-muted-foreground">
                              {member.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {member.lastActive}
                        </td>
                        <td className="py-3 px-6 text-right">
                          {member.isInvited ? (
                            <button
                              className="text-primary font-semibold uppercase text-[10px] tracking-wider hover:text-primary/80"
                              onClick={() => toast.success(`Invitation resent to ${member.email}.`)}
                            >
                              RESEND
                            </button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-right">
                <button className="text-xs font-semibold text-primary hover:text-primary/80">
                  View All
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Libraries */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Enterprise Libraries
              </CardTitle>
              <Select defaultValue="subcontractor">
                <SelectTrigger className="w-[200px] h-9 bg-muted/30 border-border/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subcontractor">
                    Subcontractor Directory
                  </SelectItem>
                  <SelectItem value="materials">Materials Directory</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-y border-border bg-muted/5">
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        ITEM DESCRIPTION
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        UNIT
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        CURRENT RATE
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        CATEGORY
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                        LAST UPDATED
                      </th>
                      <th className="text-right py-3 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {libraries.map((lib) => (
                      <tr
                        key={lib.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${lib.iconBg}`}
                            >
                              <span className="text-[10px] font-bold">
                                {lib.desc.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {lib.desc}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {lib.subDesc}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6 font-medium text-foreground">
                          {lib.unit}
                        </td>
                        <td className="py-3 px-6 font-bold text-foreground">
                          {lib.rate}
                        </td>
                        <td className="py-3 px-6">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-border/50"
                          >
                            {lib.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-6 text-muted-foreground">
                          {lib.date}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-right">
                <button className="text-xs font-semibold text-primary hover:text-primary/80">
                  View All
                </button>
              </div>
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Role Permissions */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  Role Permissions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Customize what different team roles can access and modify
                  within projects.
                </p>
              </div>
              <button className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                Edit Role Settings <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>

          {/* Lock Sections */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <Switch
                  checked={lockSections}
                  onCheckedChange={(val) => {
                    setLockSections(val);
                    toast.success(
                      val ? "Section locking enabled." : "Section locking disabled."
                    );
                  }}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  Lock Sections
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Prevent users from deleting mandatory sections in
                  enterprise-standard templates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Ownership */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  Transfer Ownership
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Handing over account control to another user.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold"
                  onClick={() =>
                    toast.warning(
                      "Transfer ownership requires confirmation from the new owner's email."
                    )
                  }
                >
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
