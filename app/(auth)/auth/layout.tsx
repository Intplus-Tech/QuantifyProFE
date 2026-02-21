"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showLeftPanel =
    pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <div className="h-dvh overflow-hidden bg-muted/30 grid grid-cols-3">
      {/* Left Hero Panel */}
      {showLeftPanel && (
        <div className="relative col-span-1 hidden shrink-0 overflow-hidden rounded-2xl m-3 lg:block">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/auth-bg-image.png"
              alt="Construction blueprints"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex h-full justify-between flex-col p-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">
                Quantify <span className="text-primary">Pro</span>
              </span>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold leading-tight text-white xl:text-2xl">
                Build Smarter,
                <br />
                Estimate Faster,
                <br />
                Collaborate Better
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/80">
                Quantify Pro bridges the gap between traditional quantity
                surveying and modern AI-powered automation. Whether you work
                alone or with a team, unlock precision, speed, and
                compliance—all in one platform.
              </p>
            </div>

            {/* Testimonial Card */}
            <div className="rounded-xl bg-primary/90 p-5 backdrop-blur-sm">
              <p className="text-sm leading-relaxed">
                &ldquo;Quantify Pro is the first one that truly understands our
                Nigerian context. What used to take me 3 days now takes 3 hours.
                The AI extraction from CAD &amp; PDF drawings is about 90%
                accurate for standard architectural plans. Support team is
                responsive too!&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="AS" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Adebola Smith</p>
                  <p className="text-xs">Senior Quantity Surveyor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Content Panel */}
      <div
        className={`flex flex-1 items-center justify-center p-4 lg:p-6 ${
          showLeftPanel ? "col-span-2" : "col-span-3"
        }`}
      >
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
