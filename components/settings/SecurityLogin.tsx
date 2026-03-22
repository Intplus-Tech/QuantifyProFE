"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Star,
  Mail,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useChangePasswordMutation } from "@/store/api/authApi";

// ─── Schema ─────────────────────────────────────────────────────────────────

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// API handler removed, using RTK Query mutation directly in the component

// ─── Field error helper ──────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const loginActivity = [
  {
    icon: Laptop,
    device: "MacBook Pro M2",
    location: "Lagos, Nigeria • Chrome Browser",
    time: "Active Now",
    isCurrent: true,
  },
  {
    icon: Smartphone,
    device: "iPhone 14 Pro",
    location: "Lagos, Nigeria • App Session",
    time: "Yesterday at 4:32 PM",
    isCurrent: false,
  },
  {
    icon: Monitor,
    device: "Windows Workstation",
    location: "Abuja, Nigeria • Firefox Browser",
    time: "Mar 12, 2024 at 10:15 AM",
    isCurrent: false,
  },
  {
    icon: Tablet,
    device: "iPad Air",
    location: "Lagos, Nigeria • Safari",
    time: "Mar 10, 2024 at 09:22 PM",
    isCurrent: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SecurityLogin() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });
  console.log(errors, "error");
  const [changePassword, { isLoading: isApiLoading }] =
    useChangePasswordMutation();
  const isSubmitting = isFormSubmitting || isApiLoading;

  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success(response.message || "Password changed successfully.");
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update password.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Password */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Update Password
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ensure your account is using a long, random password to stay
                    secure.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onPasswordSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("currentPassword")}
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="bg-white border-border/50 h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FieldError message={errors.currentPassword?.message} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("newPassword")}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="bg-white border-border/50 h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FieldError message={errors.newPassword?.message} />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/80 text-white font-semibold px-6 h-12"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Email Alerts & Session Timeout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-foreground">Email Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Notify me of new logins
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={(val) => {
                      setEmailAlerts(val);
                      toast.success(
                        val
                          ? "Email alerts enabled."
                          : "Email alerts disabled.",
                      );
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-foreground">
                        Session Timeout
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Auto-logout after 2 hours
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sessionTimeout}
                    onCheckedChange={(val) => {
                      setSessionTimeout(val);
                      toast.success(
                        val
                          ? "Session timeout enabled."
                          : "Session timeout disabled.",
                      );
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Login Activity */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Recent Login Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginActivity.map((session, idx) => {
                const Icon = session.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">
                          {session.device}
                        </p>
                        {session.isCurrent && (
                          <Badge className="bg-transparent text-green-600 hover:bg-transparent border-0 text-xs font-semibold p-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              <button className="text-sm font-semibold text-red-500 hover:text-red-600 w-full text-center pt-2">
                Sign out from all other devices
              </button>
            </CardContent>
          </Card>

          {/* Quantify Pro+ Card */}
          <Card className="shadow-none bg-amber-400 border-0 overflow-hidden relative">
            {/* Decorative shield */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-white/15 rotate-12" />
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-2xl bg-white/10 rotate-12" />
            <CardContent className="p-6 relative">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">
                Quantify Pro+
              </h3>
              <p className="text-sm text-white/90 mb-5">
                Upgrade to get multi-user access and advanced team security
                features.
              </p>
              <Button className="bg-white text-amber-500 hover:bg-white/90 hover:text-amber-600 font-semibold border-0 w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
