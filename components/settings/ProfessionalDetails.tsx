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
} from "lucide-react";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const certSchema = z.object({
  primaryCertification: z
    .string()
    .min(2, "Certification name must be at least 2 characters"),
  membershipNumber: z
    .string()
    .min(3, "Membership number must be at least 3 characters"),
});

const experienceSchema = z.object({
  yearsOfExperience: z
    .string()
    .min(1, "Years of experience is required")
    .regex(/^\d+$/, "Must be a number"),
  industrySpecialization: z
    .string()
    .min(1, "Select an industry specialization"),
});

type CertFormValues = z.infer<typeof certSchema>;
type ExperienceFormValues = z.infer<typeof experienceSchema>;

// ─── Dummy API handlers ───────────────────────────────────────────────────────

async function updateCertifications(
  data: CertFormValues
): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/certifications", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updateCertifications →", data);
}

async function updateWorkExperience(
  data: ExperienceFormValues
): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/experience", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updateWorkExperience →", data);
}

async function updateSkills(skills: string[]): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/skills", { skills })
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updateSkills →", skills);
}

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
  // ── Skills tag state ──
  const [skills, setSkills] = useState<string[]>(defaultSkills);
  const [skillInput, setSkillInput] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);

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

  async function onSkillsSave() {
    setSavingSkills(true);
    try {
      await updateSkills(skills);
      toast.success("Skills saved.");
    } catch {
      toast.error("Failed to save skills.");
    } finally {
      setSavingSkills(false);
    }
  }

  // ── Certifications form ──
  const {
    register: regCert,
    handleSubmit: handleCert,
    formState: { errors: errCert, isSubmitting: submittingCert },
  } = useForm<CertFormValues>({
    resolver: zodResolver(certSchema),
    defaultValues: {
      primaryCertification:
        "RICS (Royal Institution of Chartered Surveyors)",
      membershipNumber: "6822451",
    },
  });

  async function onCertSubmit(data: CertFormValues) {
    try {
      await updateCertifications(data);
      toast.success("Certifications saved.");
    } catch {
      toast.error("Failed to save certifications.");
    }
  }

  // ── Work Experience form ──
  const {
    register: regExp,
    control: controlExp,
    handleSubmit: handleExp,
    formState: { errors: errExp, isSubmitting: submittingExp },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      yearsOfExperience: "12",
      industrySpecialization: "residential",
    },
  });

  async function onExperienceSubmit(data: ExperienceFormValues) {
    try {
      await updateWorkExperience(data);
      toast.success("Work experience saved.");
    } catch {
      toast.error("Failed to save work experience.");
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
            <form onSubmit={handleCert(onCertSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Primary Certification
                  </Label>
                  <Input
                    {...regCert("primaryCertification")}
                    className="bg-white border-border/50"
                  />
                  <FieldError message={errCert.primaryCertification?.message} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Membership Number
                  </Label>
                  <Input
                    {...regCert("membershipNumber")}
                    className="bg-white border-border/50"
                  />
                  <FieldError message={errCert.membershipNumber?.message} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add another certification
                </button>
                <Button type="submit" disabled={submittingCert}>
                  {submittingCert ? "Saving..." : "Save Certifications"}
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
            <form onSubmit={handleExp(onExperienceSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Years of Experience
                  </Label>
                  <Input
                    {...regExp("yearsOfExperience")}
                    className="bg-white border-border/50"
                  />
                  <FieldError message={errExp.yearsOfExperience?.message} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Industry Specialization
                  </Label>
                  <Controller
                    control={controlExp}
                    name="industrySpecialization"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                    )}
                  />
                  <FieldError message={errExp.industrySpecialization?.message} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submittingExp}>
                  {submittingExp ? "Saving..." : "Save Experience"}
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
                className="bg-white border-border/50 flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={addSkill}
                className="bg-primary hover:bg-primary/80 text-white shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-border/50 text-muted-foreground font-medium"
                onClick={() => setSkills(defaultSkills)}
              >
                Reset
              </Button>
              <Button
                type="button"
                disabled={savingSkills}
                className="bg-primary hover:bg-primary/80 text-white font-semibold"
                onClick={onSkillsSave}
              >
                {savingSkills ? "Saving..." : "Save Changes"}
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
                    src="https://i.pravatar.cc/150?u=adebola"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <h3 className="font-bold text-foreground text-lg">
                Adebola Oladapo
              </h3>
              <p className="text-sm text-primary font-medium">
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
                <Clock className="w-4 h-4 text-primary" />
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
