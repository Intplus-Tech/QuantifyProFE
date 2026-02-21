"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

// ── Schemas ────────────────────────────────────────────

const baseSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15)
    .regex(/^[0-9\-+() ]+$/, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

const singleUserSchema = baseSchema.extend({
  accountType: z.literal("single"),
});

const companySchema = baseSchema.extend({
  accountType: z.literal("company"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(150),
});

const registerSchema = z.discriminatedUnion("accountType", [
  singleUserSchema,
  companySchema,
]);

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Page Component ─────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"single" | "company">(
    "single",
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: "single",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  function switchAccountType(type: "single" | "company") {
    setAccountType(type);
    setValue("accountType", type);
    // Reset company field when switching
    if (type === "single") {
      setValue("companyName" as never, "" as never);
    }
  }

  async function onSubmit(data: RegisterFormData) {
    // Mock registration — simulate a 1.5 s API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Registered:", data);
    // Redirect to login after mock success
    router.push("/login?registered=true");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Create your account
        </h2>
      </div>

      {/* Account Type Toggle */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          You&apos;re creating an account as?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchAccountType("single")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
              accountType === "single"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`flex size-4 items-center justify-center rounded-full border-2 ${
                accountType === "single"
                  ? "border-primary-foreground"
                  : "border-muted-foreground"
              }`}
            >
              {accountType === "single" && (
                <span className="size-2 rounded-full bg-primary-foreground" />
              )}
            </span>
            Register As Single User
          </button>
          <button
            type="button"
            onClick={() => switchAccountType("company")}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
              accountType === "company"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`flex size-4 items-center justify-center rounded-full border-2 ${
                accountType === "company"
                  ? "border-primary-foreground"
                  : "border-muted-foreground"
              }`}
            >
              {accountType === "company" && (
                <span className="size-2 rounded-full bg-primary-foreground" />
              )}
            </span>
            Register As a Company
          </button>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Company Name — only when "company" is selected */}
        {accountType === "company" && (
          <Field
            data-invalid={
              !!(errors as Record<string, { message?: string }>).companyName
            }
          >
            <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
            <Input
              id="companyName"
              placeholder="Cost Cliff Consultants Ltd."
              className="h-9 text-sm"
              {...register("companyName" as never)}
            />
            <FieldError>
              {
                (errors as Record<string, { message?: string }>).companyName
                  ?.message
              }
            </FieldError>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              placeholder="David"
              className="h-9 text-sm"
              {...register("firstName")}
            />
            <FieldError>{errors.firstName?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              placeholder="Goliath"
              className="h-9 text-sm"
              {...register("lastName")}
            />
            <FieldError>{errors.lastName?.message}</FieldError>
          </Field>
        </div>

        {/* Email Address */}
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

        {/* Phone Number */}
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="0801-234-5678"
            className="h-9 text-sm"
            {...register("phone")}
          />
          <FieldError>{errors.phone?.message}</FieldError>
        </Field>

        {/* Password */}
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create your password"
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

        {/* Terms of Use */}
        <p className="text-xs text-muted-foreground">
          By clicking &lsquo;Create Account&rsquo; you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Terms of Use
          </Link>
        </p>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-10 w-auto min-w-[180px] rounded-lg text-sm font-semibold"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
