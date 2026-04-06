"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Circle, Info, Send } from "lucide-react";
import { useInviteTeamMemberMutation } from "@/store/api/companyApi";

// ─── Schema ──────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  role: z.string().min(1, "Select a role"),
  permision: z.array(z.string()).min(1, "Select at least one permission"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const PERMISSIONS_OPTIONS = [
  {
    id: "read_access",
    label: "Read Access",
    desc: "Can view projects and data",
  },
  {
    id: "write_access",
    label: "Write Access",
    desc: "Can edit projects and data",
  },
  {
    id: "full_access",
    label: "Full Access",
    desc: "Has all administrative rights",
  },
  {
    id: "invite_others",
    label: "Invite Others",
    desc: "Can invite new team members",
  },
];

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const [inviteMember, { isLoading: isInviting }] =
    useInviteTeamMemberMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      permision: ["read_access"],
    },
  });

  async function onSubmit(data: InviteFormValues) {
    try {
      await inviteMember(data).unwrap();
      toast.success(`Invitation sent to ${data.email}.`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to send invitation. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl! p-0 gap-0 overflow-hidden rounded-xl border-border/50">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-border/40">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Invite New Team Member
            </DialogTitle>
            <p className="text-base text-slate-500">
              Send an invitation to join your enterprise workspace.
            </p>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Full Name
                </Label>
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Alex Johnson"
                  className="h-12 border-slate-200 bg-white"
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="alex@company.com"
                  className="h-12 border-slate-200 bg-white"
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700">
                Assign Role
              </Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-12 border-slate-200 bg-white text-base">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="lead-surveyor">
                        Lead Surveyor
                      </SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.role?.message} />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                DEFAULT PERMISSIONS
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="permision"
                  render={({ field }) => (
                    <>
                      {PERMISSIONS_OPTIONS.map((opt) => {
                        const isSelected = field.value.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value.filter((v) => v !== opt.id)
                                : [...field.value, opt.id];
                              field.onChange(newValue);
                            }}
                            className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/30"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-amber-500 fill-amber-500 stroke-white" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[15px] font-semibold text-slate-800 cursor-pointer">
                                {opt.label}
                              </Label>
                              <p className="text-[13px] text-slate-500 leading-snug">
                                {opt.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                />
              </div>
              <FieldError message={errors.permision?.message} />
            </div>

            {/* Warning Box */}
            <div className="bg-[#FFF9EE] border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 mt-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[14px] text-[#A66D00] leading-relaxed">
                Inviting a new member will use 1 of your 8 available seats. You
                can manage your subscription in the{" "}
                <span className="font-bold">Billing</span> section.
              </p>
            </div>
          </div>

          <div className="px-8 pb-8 pt-4 border-t border-border/40 flex justify-center sm:justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-600 font-bold text-base hover:bg-slate-100 h-12 px-6"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-base h-12 px-6 rounded-lg shadow-sm"
            >
              {isInviting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {isInviting ? "Sending..." : "Send Invitation"}
              {!isInviting && (
                <Send className="w-4 h-4 ml-2 fill-white stroke-2" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
