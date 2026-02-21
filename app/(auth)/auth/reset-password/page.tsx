"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push("/auth/login");
  }

  return (
    <div className="mx-auto h-[calc(100dvh-1.5rem)] max-w-[1260px]">
      <Button
        type="button"
        onClick={() => router.back()}
        variant="secondary"
        size="icon-sm"
        className="bg-gray-400 absolute left-6 top-6"
        aria-label="Go back"
      >
        <ArrowLeft className="size-3.5" />
      </Button>

      <section className="relative h-[calc(100%-1.5rem)] overflow-hidden">
        <div className="relative flex h-full flex-col p-6">
          <div className="mx-auto flex h-full w-full max-w-lg items-center justify-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-[430px] space-y-4"
            >
              <h1 className="text-center text-3xl font-semibold">
                Reset Password
              </h1>
              <p className="text-center text-xs text-muted-foreground">
                Create New Password
              </p>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Re-Enter Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md text-xs"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                {isSubmitting ? "Updating..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
