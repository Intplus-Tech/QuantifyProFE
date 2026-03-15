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
import { Lock, Monitor, Smartphone, Laptop } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ─── Dummy API handlers ───────────────────────────────────────────────────────

async function updatePassword(data: PasswordFormValues): Promise<void> {
  // TODO: Replace with real API call e.g. await api.patch("/user/password", data)
  await new Promise((r) => setTimeout(r, 800));
  console.log("[API] updatePassword →", { email: data.email, newPassword: "***" });
}

async function logOutDevice(deviceId: number): Promise<void> {
  // TODO: Replace with real API call e.g. await api.post(`/sessions/${deviceId}/logout`)
  await new Promise((r) => setTimeout(r, 600));
  console.log("[API] logOutDevice →", deviceId);
}

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const initialSessions = [
  {
    id: 1,
    device: 'MacBook Pro 16"',
    browser: "Chrome on macOS",
    icon: Laptop,
    location: "Lagos, Nigeria",
    lastLogin: "Current Session",
    status: "Active",
    statusColor: "bg-green-100 text-green-600",
    isCurrent: true,
    canLogout: false,
  },
  {
    id: 2,
    device: "iPhone 15 Pro",
    browser: "iOS App",
    icon: Smartphone,
    location: "Lagos, Nigeria",
    lastLogin: "2 hours ago",
    status: "Active",
    statusColor: "bg-green-100 text-green-600",
    isCurrent: false,
    canLogout: true,
  },
  {
    id: 3,
    device: "Windows Workstation",
    browser: "Edge on Windows",
    icon: Monitor,
    location: "London, UK",
    lastLogin: "Oct 14, 2023",
    status: "Logged Out",
    statusColor: "bg-red-100 text-red-600",
    isCurrent: false,
    canLogout: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function EnterpriseRolesPermissions() {
  const [sessions, setSessions] = useState(initialSessions);
  const [loggingOut, setLoggingOut] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      await updatePassword(data);
      toast.success("Password updated successfully.");
      reset();
    } catch {
      toast.error("Failed to update password.");
    }
  }

  async function handleLogOut(sessionId: number) {
    setLoggingOut(sessionId);
    try {
      await logOutDevice(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "Logged Out",
                statusColor: "bg-red-100 text-red-600",
                canLogout: false,
              }
            : s
        )
      );
      toast.success("Device logged out successfully.");
    } catch {
      toast.error("Failed to log out device.");
    } finally {
      setLoggingOut(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Management Header */}
      <div className="bg-slate-50 border border-border/30 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-base">
            Password Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your account credentials to keep your data safe.
          </p>
        </div>
      </div>

      {/* Password Form */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  EMAIL ADDRESS
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-white border-border/50"
                />
                <FieldError message={errors.email?.message} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  CURRENT PASSWORD
                </Label>
                <Input
                  {...register("currentPassword")}
                  type="password"
                  placeholder="Enter current password"
                  className="bg-white border-border/50"
                />
                <FieldError message={errors.currentPassword?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  NEW PASSWORD
                </Label>
                <Input
                  {...register("newPassword")}
                  type="password"
                  placeholder="Enter new password"
                  className="bg-white border-border/50"
                />
                <FieldError message={errors.newPassword?.message} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  RE-ENTER NEW PASSWORD
                </Label>
                <Input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-white border-border/50"
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-foreground">
            Active Sessions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Devices currently logged into your account.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/5">
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    DEVICE
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    LOCATION
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                    LAST LOGIN
                  </th>
                  <th className="text-right py-3 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const IconComponent = session.icon;
                  return (
                    <tr
                      key={session.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {session.device}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.browser}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground">
                        {session.location}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {session.lastLogin}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge
                            className={`border-0 text-[10px] font-bold uppercase tracking-wider ${session.statusColor}`}
                          >
                            {session.status}
                          </Badge>
                          {session.canLogout && (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8"
                              disabled={loggingOut === session.id}
                              onClick={() => handleLogOut(session.id)}
                            >
                              {loggingOut === session.id
                                ? "Logging out..."
                                : "Log Device Out"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
