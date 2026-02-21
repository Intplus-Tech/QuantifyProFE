"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ── Schema ─────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ── Page Component ─────────────────────────────────────

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    // Mock — simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Password reset requested for:", data.email);
    setSubmitted(true);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Breadcrumb */}
      <p className="text-xs text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          Login
        </Link>{" "}
        &gt; Forgot Password
      </p>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertDescription>
              If an account exists with that email, you&apos;ll receive a
              password reset link shortly.
            </AlertDescription>
          </Alert>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-10 w-full rounded-lg text-sm"
          >
            <Link href="/login">
              <ArrowLeft className="size-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="h-9 text-sm"
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg text-sm font-semibold"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
