"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BOQDocumentLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 px-5 py-2.5">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6">
        <Skeleton className="h-6 w-96" />
        <Skeleton className="mt-2 h-3 w-72" />

        <div className="mt-6 flex gap-6">
          <div className="hidden w-[190px] shrink-0 space-y-3 sm:block">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>

          <div className="flex-1 space-y-2 rounded-lg border border-slate-200 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
