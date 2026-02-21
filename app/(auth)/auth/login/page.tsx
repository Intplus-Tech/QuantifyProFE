"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ── Schema ─────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Mock Credentials ───────────────────────────────────

const MOCK_USER = {
  email: "demo@quantifypro.com",
  password: "Password1",
};

// ── Page Wrapper (Suspense boundary for useSearchParams) ──

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

// ── Form Component ─────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoginError(null);

    // Mock login — simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (
      data.email === MOCK_USER.email &&
      data.password === MOCK_USER.password
    ) {
      // Successful mock login
      console.log("Login successful:", data.email);
      router.push("/");
    } else {
      setLoginError(
        "Invalid email or password. Try demo@quantifypro.com / Password1",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Breadcrumb */}
      <p className="text-xs text-muted-foreground">Login</p>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      {/* Success Alert — shown after registration redirect */}
      {justRegistered && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="size-4 text-green-600" />
          <AlertDescription>
            Account created successfully! You can now log in.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {loginError && (
        <Alert variant="destructive">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Email */}
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

        {/* Password */}
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-9 pr-10 text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
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

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-10 w-full rounded-lg text-sm font-semibold"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </form>

      {/* Demo Credentials Hint */}
      <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Demo Credentials
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Email:{" "}
          <span className="font-mono text-foreground">
            demo@quantifypro.com
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Password: <span className="font-mono text-foreground">Password1</span>
        </p>
      </div>
    </div>
  );
}
