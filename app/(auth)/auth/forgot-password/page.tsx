"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const [forgotPassword, { isLoading: isSubmitting }] =
    useForgotPasswordMutation();

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      const response = await forgotPassword(data).unwrap();
      if (response.success) {
        setSubmitted(true);
        toast.success("OTP sent! Check your email.");
        router.push(
          `/auth/verification?email=${encodeURIComponent(data.email)}&mode=reset`,
        );
      } else {
        toast.error(response.message || "Failed to send reset code.");
      }
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Failed to send reset code.");
    }
  }

  return (
    <div className="mx-auto h-[calc(100dvh-1.5rem)] max-w-[1260px]">
      <Button
        asChild
        variant="secondary"
        size="icon-sm"
        className="bg-gray-400 absolute left-6 top-6"
      >
        <Link href="/auth/login" aria-label="Back to login">
          <ArrowLeft className="size-3.5" />
        </Link>
      </Button>

      <section className="relative h-[calc(100dvh-1.5rem)] overflow-hidden">
        <div className="relative flex h-full flex-col p-6">
          <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center">
            <div className="w-full max-w-[420px] space-y-3">
              <h1 className="text-center text-3xl font-semibold">
                Forgot Password?
              </h1>
              <p className="text-center text-xs text-muted-foreground">
                Enter your email address and we&apos;ll send you a reset code
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3 pt-3"
              >
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

                <Button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="h-10 w-full rounded-md text-xs"
                >
                  {isSubmitting && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  {isSubmitting ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
