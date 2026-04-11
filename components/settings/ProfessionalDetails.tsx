"use client";

import { useState, KeyboardEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
  Trash2,
} from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetProfessionalDetailsQuery,
  useUpdateProfessionalDetailsMutation,
} from "@/store/api/userApi";
import { useEffect } from "react";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const professionalSchema = z.object({
  certifications: z.array(
    z.object({
      name: z
        .string()
        .min(2, "Certification name must be at least 2 characters"),
      membershipNumber: z
        .string()
        .min(3, "Membership number must be at least 3 characters"),
    }),
  ),
  yearsOfExperience: z
    .string()
    .min(1, "Years of experience is required")
    .regex(/^\d+$/, "Must be a number"),
  industrySpecialization: z
    .string()
    .min(1, "Select an industry specialization"),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

// API handlers removed, using RTK Query directly

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ───────────────────────────────────────────────────────────────

const defaultSkills = [
  "Cost Estimation",
  "Bill of Quantities (BOQ)",
  "Tender Preparation",
  "Contract Management",
];

export default function ProfessionalDetails() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { data: professionalResponse, isLoading: isFetching } =
    useGetProfessionalDetailsQuery();
  const [updateProfessionalDetails, { isLoading: isUpdating }] =
    useUpdateProfessionalDetailsMutation();

  const professionalData = professionalResponse?.data;

  // ── Skills tag state ──
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      certifications: [{ name: "", membershipNumber: "" }],
      yearsOfExperience: "",
      industrySpecialization: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  useEffect(() => {
    if (professionalData) {
      reset({
        certifications: professionalData.certifications || [
          { name: "", membershipNumber: "" },
        ],
        yearsOfExperience: String(professionalData.yearsOfExperience || ""),
        industrySpecialization: professionalData.industrySpecialization || "",
      });
      setSkills(professionalData.specializedSkills || []);
    }
  }, [professionalData, reset]);

  async function onSave(data: ProfessionalFormValues) {
    try {
      await updateProfessionalDetails({
        certifications: data.certifications,
        yearsOfExperience: Number(data.yearsOfExperience),
        industrySpecialization: data.industrySpecialization,
        specializedSkills: skills,
      }).unwrap();
      toast.success("Professional details updated successfully.");
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to update professional details.",
      );
    }
  }

  async function onSkillsSave() {
    const data = getValues();
    try {
      await updateProfessionalDetails({
        certifications: data.certifications,
        yearsOfExperience: Number(data.yearsOfExperience),
        industrySpecialization: data.industrySpecialization,
        specializedSkills: skills,
      }).unwrap();
      toast.success("Skills saved.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save skills.");
    }
  }
  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }
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
          <CardContent>
            <form onSubmit={handleSubmit(onSave)} className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative pt-6 first:pt-0">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Certification Name
                      </Label>
                      <Input
                        {...register(`certifications.${index}.name` as const)}
                        placeholder="e.g. RICS"
                        className="bg-white border-border/50 h-12"
                      />
                      <FieldError
                        message={errors.certifications?.[index]?.name?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Membership Number
                      </Label>
                      <Input
                        {...register(
                          `certifications.${index}.membershipNumber` as const,
                        )}
                        placeholder="e.g. 6822451"
                        className="bg-white border-border/50 h-12"
                      />
                      <FieldError
                        message={
                          errors.certifications?.[index]?.membershipNumber
                            ?.message
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => append({ name: "", membershipNumber: "" })}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium h-12"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add another certification
                </button>
                <Button
                  type="submit"
                  className="h-12"
                  disabled={isSubmitting || isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Certifications"}
                </Button>
              </div>
            </form>
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
            <form onSubmit={handleSubmit(onSave)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Years of Experience
                  </Label>
                  <Input
                    {...register("yearsOfExperience")}
                    className="bg-white border-border/50 h-12"
                  />
                  <FieldError message={errors.yearsOfExperience?.message} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Industry Specialization
                  </Label>
                  <Controller
                    control={control}
                    name="industrySpecialization"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full bg-white border-border/50 h-12!">
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential Construction">
                            Residential Construction
                          </SelectItem>
                          <SelectItem value="Commercial Construction">
                            Commercial Construction
                          </SelectItem>
                          <SelectItem value="Infrastructure">
                            Infrastructure
                          </SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError
                    message={errors.industrySpecialization?.message}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="h-12"
                  disabled={isSubmitting || isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Experience"}
                </Button>
              </div>
            </form>
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
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="border-0 font-medium px-3 py-1.5 text-sm gap-1.5"
                >
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type to add skills (e.g. Value Engineering, Risk Management)"
                className="bg-white border-border/50 flex-1 h-12"
              />
              <Button
                type="button"
                size="icon"
                onClick={addSkill}
                className="bg-primary hover:bg-primary/80 text-white shrink-0 h-12"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-border/50 text-muted-foreground font-medium h-12"
                onClick={() =>
                  setSkills(professionalData?.specializedSkills || [])
                }
              >
                Reset
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || isUpdating}
                className="bg-primary hover:bg-primary/80 text-white font-semibold h-12"
                onClick={onSkillsSave}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
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
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://i.pravatar.cc/150?u=${currentUser?._id}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <h3 className="font-bold text-foreground text-lg">
                {currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "Loading..."}
              </h3>
              <p className="text-sm text-primary font-medium">
                {professionalData?.professionalTitle || "Professional"}
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
                      {professionalData?.certifications?.[0]?.name ||
                        "Uncertified"}
                    </p>
                  </div>
                </div>
                {professionalData?.certifications?.length ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : null}
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-border/30">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    EXPERIENCE
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {professionalData?.yearsOfExperience || 0} Years
                    Professional
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
