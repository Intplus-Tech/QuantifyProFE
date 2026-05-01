"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  useResendVerificationEmailMutation,
  useVerifyOtpMutation,
} from "@/store/api/authApi";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerificationPage() {
  return (
    <Suspense>
      <VerificationContent />
    </Suspense>
  );
}

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = searchParams.get("mode") ?? ""; // "reset" = from forgot-password flow

  const hiddenEmail = useMemo(() => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    if (name.length <= 3) return `***@${domain}`;
    return `${name.slice(0, 3)}**********@${domain}`;
  }, [email]);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);

  const [resendOtp, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) {
      const pastedData = value.replace(/\D/g, "").slice(0, 6);
      if (pastedData.length > 0) {
        const next = [...code];
        for (let i = 0; i < pastedData.length; i++) {
          if (index + i < 6) {
            next[index + i] = pastedData[i];
          }
        }
        setCode(next);
        const nextIndex = Math.min(index + pastedData.length, 5);
        document
          .getElementById(`otp-${nextIndex === 6 ? 5 : nextIndex}`)
          ?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const nextCode = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      nextCode[i] = pastedData[i];
    }
    setCode(nextCode);

    const nextIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${nextIndex === 6 ? 5 : nextIndex}`)?.focus();
  }

  async function handleContinue() {
    const joined = code.join("");
    setError(null);

    if (joined.length !== 6) {
      setError("Enter all 6 digits of your code.");
      return;
    }

    if (mode === "reset") {
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(joined)}`,
      );
    } else {
      try {
        const response = await verifyOtp({
          email,
          otp: joined,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Email verified successfully!");
          router.push("/auth/login");
        } else {
          setError(
            response.message || "Verification failed. Please try again.",
          );
          toast.error(response.message || "Verification failed.");
        }
      } catch (err: any) {
        const errorMessage =
          err.data?.message ||
          err.message ||
          "An error occurred during verification.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  }

  async function resendCode() {
    if (countdown > 0 || isResending) return;
    setError(null);
    try {
      const response = await resendOtp({ email }).unwrap();
      if (response.success) {
        setCountdown(30);
        toast.success("A new verification code has been sent to your email.");
      } else {
        toast.error(response.message || "Failed to resend code.");
      }
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Failed to resend code.");
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
        <Link href="/auth/forgot-password" aria-label="Back to forgot password">
          <ArrowLeft className="size-3.5" />
        </Link>
      </Button>

      <section className="relative h-[calc(100dvh-1.5rem)] overflow-hidden">
        <div className="relative flex h-full flex-col p-6">
          <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center">
            <div className="w-full max-w-[420px] space-y-4">
              <h1 className="text-center text-3xl font-semibold">
                Enter your Verification Code
              </h1>
              <p className="text-center text-xs text-muted-foreground">
                Enter the code sent to your email address, {hiddenEmail}
              </p>

              <div className="grid grid-cols-6 gap-2 pt-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(event) =>
                      handleChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="h-12 text-center text-base"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                  />
                ))}
              </div>

              {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="button"
                onClick={handleContinue}
                disabled={isVerifying}
                className="h-10 w-full rounded-md text-xs"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={countdown > 0 || isResending}
                  className="font-medium text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
                >
                  {isResending
                    ? "Resending..."
                    : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend Code"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
