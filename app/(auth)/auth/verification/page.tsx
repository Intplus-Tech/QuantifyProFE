"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const email = searchParams.get("email") ?? "davidgoliath12@initplus.co";
  const hiddenEmail = useMemo(() => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    if (name.length <= 3) return `***@${domain}`;
    return `${name.slice(0, 3)}**********@${domain}`;
  }, [email]);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  async function verifyCode() {
    const joined = code.join("");
    setError(null);

    if (joined.length !== 6) {
      setError("Enter all 6 digits of your verification code.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (joined === "444444") {
      router.push("/auth/reset-password");
      return;
    }

    setIsSubmitting(false);
    setError("Invalid code. Try 444444 for this mock flow.");
  }

  async function resendCode() {
    setResent(false);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setResent(true);
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
                    onChange={(event) => updateDigit(index, event.target.value)}
                    className="h-10 text-center text-base"
                    inputMode="numeric"
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
                onClick={verifyCode}
                disabled={isSubmitting}
                className="h-10 w-full rounded-md text-xs"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={resendCode}
                  className="font-medium text-primary hover:underline"
                >
                  Resend (30s)
                </button>
              </p>
            </div>
          </div>

          {resent && (
            <div className="mx-auto mb-2 w-full max-w-md">
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="size-4 text-green-600" />
                <AlertDescription>
                  A new verification code is sent to your email.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
