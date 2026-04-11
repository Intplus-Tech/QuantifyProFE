"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useCreateCompanyProfileMutation,
} from "@/store/api/companyApi";
import { CompanyTeamManagement } from "./CompanyTeamManagement";

// ─── Schema ──────────────────────────────────────────────────────────────────

const orgSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.string().min(1, "Select a company type"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

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
  const [lockSections, setLockSections] = useState(true);

  const { company: storeCompany } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    data: companyResponse,
    isLoading: isCompanyLoading,
    error: companyError,
  } = useGetCompanyProfileQuery();
  const [updateCompanyProfile] = useUpdateCompanyProfileMutation();
  const [createCompanyProfile] = useCreateCompanyProfileMutation();

  const isCompanyNotFoundError = useMemo(() => {
    return (companyError as any)?.data?.message
      ?.toLowerCase()
      .includes("not found");
  }, [companyError]);

  const companyData = companyResponse?.data || storeCompany;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      companyName: companyData?.legalName || companyData?.name || "",
      companyType: companyData?.type || "",
      industry: companyData?.industry || "",
      companySize: companyData?.companySize || "",
      address: companyData?.address || companyData?.addresses?.[0]?.address || "",
    },
  });

  useEffect(() => {
    if (companyData) {
      reset({
        companyName: companyData.legalName || companyData.name || "",
        companyType: companyData.type || "",
        industry: companyData.industry || "",
        companySize: companyData.companySize || "",
        address: companyData.address || companyData.addresses?.[0]?.address || "",
      });
    }
  }, [companyData, reset]);

  async function onOrgSubmit(data: OrgFormValues) {
    try {
      const payload = {
        legalName: data.companyName,
        type: data.companyType,
        industry: data.industry,
        companySize: data.companySize,
        address: data.address,
      };

      if (isCompanyNotFoundError || !companyData) {
        await createCompanyProfile(payload).unwrap();
        toast.success("Organisation information created.");
      } else {
        await updateCompanyProfile(payload).unwrap();
        toast.success("Organisation information updated.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to save organisation information.",
      );
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
                      {companyData?.logo ? (
                        <img
                          src={companyData.logo}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-primary/40 font-bold text-xl items-center justify-center">
                          {companyData?.name?.charAt(0) ||
                            companyData?.legalName?.charAt(0) ||
                            "C"}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium text-center">
                      PNG OR JPG, MAX 2MB
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Company Legal Name
                        </Label>
                        <Input
                          {...register("companyName")}
                          className="bg-white border-border/50 h-12"
                        />
                        <FieldError message={errors.companyName?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Company Type
                        </Label>
                        <Controller
                          control={control}
                          name="companyType"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full bg-white border-border/50 h-12!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="llc">LLC</SelectItem>
                                <SelectItem value="ltd">Ltd</SelectItem>
                                <SelectItem value="plc">PLC</SelectItem>
                                <SelectItem value="sole">
                                  Sole Proprietorship
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError message={errors.companyType?.message} />
                      </div>
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
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full bg-white border-border/50 h-12!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Quantity Surveying">
                                  Quantity Surveying
                                </SelectItem>
                                <SelectItem value="Civil Engineering">
                                  Civil Engineering
                                </SelectItem>
                                <SelectItem value="Architecture">
                                  Architecture
                                </SelectItem>
                                <SelectItem value="Construction">
                                  Construction
                                </SelectItem>
                                <SelectItem value="Real Estate">
                                  Real Estate
                                </SelectItem>
                                <SelectItem value="Project Management">
                                  Project Management
                                </SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
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
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full bg-white border-border/50 h-12!">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201-500">201-500</SelectItem>
                                <SelectItem value="500+">500+</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError message={errors.companySize?.message} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Company Address
                      </Label>
                      <Textarea
                        {...register("address")}
                        placeholder="Enter full company address"
                        className="bg-white border-border/50 resize-none min-h-24 h-12"
                      />
                      <FieldError message={errors.address?.message} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="h-12"
                    disabled={isSubmitting || isCompanyLoading}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isSubmitting
                      ? "Saving..."
                      : isCompanyNotFoundError || !companyData
                        ? "Create Organisation Info"
                        : "Update Organisation Info"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Team Members */}
          <CompanyTeamManagement />

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
                      val
                        ? "Section locking enabled."
                        : "Section locking disabled.",
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
                      "Transfer ownership requires confirmation from the new owner's email.",
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

    </>
  );
}
