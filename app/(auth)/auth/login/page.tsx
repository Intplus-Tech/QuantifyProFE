"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Search,
  SquareStack,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

// ── Schema ─────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
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
  const defaultEmail = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
      rememberMe: true,
    },
  });

  async function onSubmit(data: LoginFormData) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    console.log(result, "result");

    if (result?.ok) {
      router.push("/");
    } else {
      setLoginError(result?.error || "Invalid email or password.");
    }
  }

  return (
    <main className="flex h-full items-center justify-center p-6 xl:p-10">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Login to your account
        </h1>

        {loginError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {loginError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="davidgoliath12@initplus.co"
              className="h-10"
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
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

          <div className="flex items-center justify-between pt-0.5">
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-3.5 rounded border border-border accent-primary"
                {...register("rememberMe")}
              />
              Remember me
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 min-w-40 rounded-md text-xs"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
